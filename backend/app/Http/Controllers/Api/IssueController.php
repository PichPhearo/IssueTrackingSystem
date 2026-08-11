<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreIssueRequest;
use App\Http\Requests\UpdateIssueRequest;
use App\Http\Resources\IssueDetailResource;
use App\Http\Resources\IssueResource;
use App\Models\Issue;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class IssueController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Issue::class);

        $query = Issue::with(['project', 'creator', 'assignee']);

        if ($request->has('project_id')) {
            $query->where('project_id', $request->query('project_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->query('priority'));
        }

        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->query('assigned_to'));
        }

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $issues = $query->latest()->paginate(15);

        return response()->json(IssueResource::collection($issues)->response()->getData(true));
    }

    public function store(StoreIssueRequest $request): JsonResponse
    {
        Gate::authorize('create', Issue::class);

        $validated = $request->validated();
        $validated['created_by'] = $request->user()->id;

        $issue = Issue::create($validated);

        $currentUser = $request->user();
        if ($issue->assigned_to && $issue->assigned_to !== $currentUser->id) {
            Notification::create([
                'user_id' => $issue->assigned_to,
                'type' => 'reassigned',
                'message' => "You were assigned to issue #{$issue->id} ('{$issue->title}') by {$currentUser->name}",
                'related_issue_id' => $issue->id,
            ]);
        }

        return response()->json([
            'message' => 'Issue created successfully',
            'issue' => new IssueResource($issue->load(['project', 'creator', 'assignee'])),
        ], 201);
    }

    public function show(Issue $issue): JsonResponse
    {
        Gate::authorize('view', $issue);

        return response()->json(new IssueDetailResource($issue->load(['project', 'creator', 'assignee', 'comments.user'])));
    }

    public function update(UpdateIssueRequest $request, Issue $issue): JsonResponse
    {
        Gate::authorize('update', $issue);

        $oldAssignee = $issue->assigned_to;
        $issue->update($request->validated());

        $currentUser = $request->user();
        if (array_key_exists('assigned_to', $request->validated()) && $issue->assigned_to != $oldAssignee) {
            if ($issue->assigned_to && $issue->assigned_to !== $currentUser->id) {
                Notification::create([
                    'user_id' => $issue->assigned_to,
                    'type' => 'reassigned',
                    'message' => "You were assigned to issue #{$issue->id} ('{$issue->title}') by {$currentUser->name}",
                    'related_issue_id' => $issue->id,
                ]);
            }
        }

        return response()->json([
            'message' => 'Issue updated successfully',
            'issue' => new IssueResource($issue->load(['project', 'creator', 'assignee'])),
        ]);
    }

    public function destroy(Issue $issue): JsonResponse
    {
        Gate::authorize('delete', $issue);

        $issue->delete();

        return response()->json([
            'message' => 'Issue deleted successfully',
        ]);
    }
}
