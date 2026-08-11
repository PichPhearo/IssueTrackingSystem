<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ProjectMemberController extends Controller
{
    public function store(Request $request, Project $project): JsonResponse
    {
        Gate::authorize('manageMembers', $project);

        $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        $project->members()->syncWithoutDetaching([$request->input('user_id')]);

        return response()->json([
            'message' => 'Member added to project successfully',
            'members' => UserResource::collection($project->members),
        ]);
    }

    public function destroy(Project $project, User $user): JsonResponse
    {
        Gate::authorize('manageMembers', $project);

        $project->members()->detach($user->id);

        return response()->json([
            'message' => 'Member removed from project successfully',
        ]);
    }
}
