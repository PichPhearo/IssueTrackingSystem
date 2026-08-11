<?php

namespace App\Enums;

enum IssueStatus: string
{
    case OPEN = 'open';
    case IN_PROGRESS = 'in_progress';
    case RESOLVED = 'resolved';
    case VERIFIED = 'verified';
    case CLOSED = 'closed';

    /**
     * Get allowed target statuses for a transition from the current status.
     *
     * @return array<IssueStatus>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::OPEN => [self::IN_PROGRESS, self::CLOSED],
            self::IN_PROGRESS => [self::RESOLVED, self::OPEN],
            self::RESOLVED => [self::VERIFIED, self::OPEN, self::IN_PROGRESS],
            self::VERIFIED => [self::CLOSED, self::OPEN],
            self::CLOSED => [self::OPEN],
        };
    }

    /**
     * Determine if a transition from current status to target status is valid.
     */
    public function canTransitionTo(self|string $targetStatus): bool
    {
        $target = $targetStatus instanceof self ? $targetStatus : self::tryFrom($targetStatus);

        if (! $target) {
            return false;
        }

        if ($this === $target) {
            return true;
        }

        return in_array($target, $this->allowedTransitions(), true);
    }
}

