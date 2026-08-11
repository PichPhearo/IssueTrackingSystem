<?php

namespace Tests\Unit;

use App\Enums\IssueStatus;
use PHPUnit\Framework\TestCase;

class IssueStatusTransitionTest extends TestCase
{
    public function test_open_status_transitions(): void
    {
        $status = IssueStatus::OPEN;

        $this->assertTrue($status->canTransitionTo(IssueStatus::IN_PROGRESS));
        $this->assertTrue($status->canTransitionTo(IssueStatus::CLOSED));
        $this->assertTrue($status->canTransitionTo(IssueStatus::OPEN)); // idempotent

        $this->assertFalse($status->canTransitionTo(IssueStatus::RESOLVED));
        $this->assertFalse($status->canTransitionTo(IssueStatus::VERIFIED));
        $this->assertFalse($status->canTransitionTo(IssueStatus::REOPENED));
    }

    public function test_in_progress_status_transitions(): void
    {
        $status = IssueStatus::IN_PROGRESS;

        $this->assertTrue($status->canTransitionTo(IssueStatus::RESOLVED));
        $this->assertTrue($status->canTransitionTo(IssueStatus::OPEN));

        $this->assertFalse($status->canTransitionTo(IssueStatus::VERIFIED));
        $this->assertFalse($status->canTransitionTo(IssueStatus::CLOSED));
        $this->assertFalse($status->canTransitionTo(IssueStatus::REOPENED));
    }

    public function test_resolved_status_transitions(): void
    {
        $status = IssueStatus::RESOLVED;

        $this->assertTrue($status->canTransitionTo(IssueStatus::VERIFIED));
        $this->assertTrue($status->canTransitionTo(IssueStatus::REOPENED));
        $this->assertTrue($status->canTransitionTo(IssueStatus::IN_PROGRESS));

        $this->assertFalse($status->canTransitionTo(IssueStatus::OPEN));
        $this->assertFalse($status->canTransitionTo(IssueStatus::CLOSED));
    }

    public function test_verified_status_transitions(): void
    {
        $status = IssueStatus::VERIFIED;

        $this->assertTrue($status->canTransitionTo(IssueStatus::CLOSED));
        $this->assertTrue($status->canTransitionTo(IssueStatus::REOPENED));

        $this->assertFalse($status->canTransitionTo(IssueStatus::OPEN));
        $this->assertFalse($status->canTransitionTo(IssueStatus::IN_PROGRESS));
        $this->assertFalse($status->canTransitionTo(IssueStatus::RESOLVED));
    }

    public function test_reopened_status_transitions(): void
    {
        $status = IssueStatus::REOPENED;

        $this->assertTrue($status->canTransitionTo(IssueStatus::IN_PROGRESS));
        $this->assertTrue($status->canTransitionTo(IssueStatus::RESOLVED));

        $this->assertFalse($status->canTransitionTo(IssueStatus::OPEN));
        $this->assertFalse($status->canTransitionTo(IssueStatus::VERIFIED));
        $this->assertFalse($status->canTransitionTo(IssueStatus::CLOSED));
    }

    public function test_closed_status_transitions(): void
    {
        $status = IssueStatus::CLOSED;

        $this->assertTrue($status->canTransitionTo(IssueStatus::REOPENED));

        $this->assertFalse($status->canTransitionTo(IssueStatus::OPEN));
        $this->assertFalse($status->canTransitionTo(IssueStatus::IN_PROGRESS));
        $this->assertFalse($status->canTransitionTo(IssueStatus::RESOLVED));
        $this->assertFalse($status->canTransitionTo(IssueStatus::VERIFIED));
    }
}
