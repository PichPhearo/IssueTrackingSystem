<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Comment;
use App\Models\User;

class CommentPolicy
{
    private function getRole(User $user): ?UserRole
    {
        return $user->role instanceof UserRole ? $user->role : UserRole::tryFrom($user->role);
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Comment $comment): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function delete(User $user, Comment $comment): bool
    {
        $role = $this->getRole($user);
        return $role === UserRole::ADMIN || $comment->user_id === $user->id;
    }
}
