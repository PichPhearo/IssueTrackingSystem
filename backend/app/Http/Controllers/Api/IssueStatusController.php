<?php

namespace App\Http\Controllers\Api;

use App\Enums\IssueStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateIssueStatusRequest;
use App\Http\Resources\IssueResource;
use App\Models\Issue;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class IssueStatusController extends Controller
{
    public function update(UpdateIssueStatusRequest $request, Issue $issue): JsonResponse
    {
        $targetStatus = IssueStatus::from($request->validated()['status']);

        if (! $issue->canTransitionTo($targetStatus)) {
            return response()->json([
                'message' => "Invalid status transition from '{$issue->status->value}' to '{$targetStatus->value}'.",
            ], 422);
        }

        Gate::authorize('updateStatus', [$issue, $targetStatus]);

        $issue->update([
            'status' => $targetStatus,
        ]);

        $currentUser = $request->user();
        $recipientIds = collect([$issue->assigned_to, $issue->created_by])
            ->filter()
            ->unique()
            ->reject(fn ($id) => $id === $currentUser->id);

        foreach ($recipientIds as $recipientId) {
            Notification::create([
                'user_id' => $recipientId,
                'type' => 'status_changed',
                'message' => "Issue #{$issue->id} ('{$issue->title}') status changed to {$targetStatus->value} by {$currentUser->name}",
                'related_issue_id' => $issue->id,
            ]);
        }

        return response()->json([
            'message' => 'Issue status updated successfully',
            'issue' => new IssueResource($issue->load(['project', 'creator', 'assignee'])),
        ]);
    }
}

