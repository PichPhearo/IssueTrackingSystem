<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Issue;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class CommentController extends Controller
{
    public function index(Issue $issue): JsonResponse
    {
        Gate::authorize('viewAny', Comment::class);

        $comments = $issue->comments()->with('user')->latest()->get();

        return response()->json(CommentResource::collection($comments));
    }

    public function store(StoreCommentRequest $request, Issue $issue): JsonResponse
    {
        Gate::authorize('create', Comment::class);

        $comment = $issue->comments()->create([
            'user_id' => $request->user()->id,
            'body' => $request->validated()['body'],
        ]);

        $currentUser = $request->user();
        $recipientIds = collect([$issue->assigned_to, $issue->created_by])
            ->filter()
            ->unique()
            ->reject(fn ($id) => $id === $currentUser->id);

        foreach ($recipientIds as $recipientId) {
            Notification::create([
                'user_id' => $recipientId,
                'type' => 'comment',
                'message' => "{$currentUser->name} commented on issue #{$issue->id} ('{$issue->title}')",
                'related_issue_id' => $issue->id,
            ]);
        }

        return response()->json([
            'message' => 'Comment added successfully',
            'comment' => new CommentResource($comment->load('user')),
        ], 201);
    }

    public function destroy(Comment $comment): JsonResponse
    {
        Gate::authorize('delete', $comment);

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully',
        ]);
    }
}
