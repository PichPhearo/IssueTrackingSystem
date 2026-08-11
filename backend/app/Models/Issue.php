<?php

namespace App\Models;

use App\Enums\IssuePriority;
use App\Enums\IssueStatus;
use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Issue extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'title',
        'description',
        'priority',
        'status',
        'branch_name',
        'created_by',
        'assigned_to',
    ];

    protected function casts(): array
    {
        return [
            'priority' => IssuePriority::class,
            'status' => IssueStatus::class,
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Determine if the issue can transition to the given status based on the state machine rules.
     */
    public function canTransitionTo(IssueStatus|string $targetStatus): bool
    {
        return $this->status->canTransitionTo($targetStatus);
    }

    /**
     * Determine if a user can transition the issue to the given status based on role and workflow rules.
     */
    public function canUserTransitionTo(User $user, IssueStatus|string $targetStatus): bool
    {
        $target = $targetStatus instanceof IssueStatus ? $targetStatus : IssueStatus::tryFrom($targetStatus);

        if (! $target || ! $this->canTransitionTo($target)) {
            return false;
        }

        if ($this->status === $target) {
            return true;
        }

        $role = $user->role instanceof UserRole ? $user->role : UserRole::tryFrom($user->role);

        return match ($role) {
            UserRole::ADMIN, UserRole::PROJECT_MANAGER => true,
            UserRole::DEVELOPER => $this->assigned_to === $user->id && in_array($target, [
                IssueStatus::IN_PROGRESS,
                IssueStatus::RESOLVED,
                IssueStatus::OPEN,
            ], true),
            UserRole::QA => in_array($target, [
                IssueStatus::VERIFIED,
                IssueStatus::OPEN,
                IssueStatus::CLOSED,
            ], true),
            default => false,
        };
    }
}

