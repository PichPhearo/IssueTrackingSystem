<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Issue;
use App\Models\User;

class IssuePolicy
{
    private function getRole(User $user): ?UserRole
    {
        return $user->role instanceof UserRole ? $user->role : UserRole::tryFrom($user->role);
    }

    private function isAdminOrPM(User $user): bool
    {
        $role = $this->getRole($user);
        return in_array($role, [UserRole::ADMIN, UserRole::PROJECT_MANAGER], true);
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Issue $issue): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $this->isAdminOrPM($user);
    }

    public function update(User $user, Issue $issue): bool
    {
        if ($this->isAdminOrPM($user)) {
            return true;
        }

        $role = $this->getRole($user);
        if ($role === UserRole::DEVELOPER && $issue->assigned_to === $user->id) {
            return true;
        }

        return false;
    }

    public function updateStatus(User $user, Issue $issue, \App\Enums\IssueStatus|string|null $targetStatus = null): bool
    {
        if (! $targetStatus) {
            $role = $this->getRole($user);
            if ($this->isAdminOrPM($user) || $role === UserRole::QA) {
                return true;
            }
            if ($role === UserRole::DEVELOPER && $issue->assigned_to === $user->id) {
                return true;
            }
            return false;
        }

        return $issue->canUserTransitionTo($user, $targetStatus);
    }

    public function verify(User $user, Issue $issue): bool
    {
        $role = $this->getRole($user);
        return in_array($role, [UserRole::ADMIN, UserRole::PROJECT_MANAGER, UserRole::QA], true);
    }

    public function delete(User $user, Issue $issue): bool
    {
        return $this->isAdminOrPM($user);
    }
}
