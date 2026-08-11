<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Project;
use App\Models\User;

class ProjectPolicy
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

    public function view(User $user, Project $project): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $this->isAdminOrPM($user);
    }

    public function update(User $user, Project $project): bool
    {
        return $this->isAdminOrPM($user);
    }

    public function delete(User $user, Project $project): bool
    {
        $role = $this->getRole($user);
        return $role === UserRole::ADMIN;
    }

    public function manageMembers(User $user, Project $project): bool
    {
        return $this->isAdminOrPM($user);
    }
}
