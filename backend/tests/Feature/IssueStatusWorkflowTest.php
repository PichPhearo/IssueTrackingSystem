<?php

namespace Tests\Feature;

use App\Enums\IssueStatus;
use App\Enums\UserRole;
use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IssueStatusWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $developer;
    private User $qa;
    private Project $project;
    private Issue $issue;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $this->developer = User::factory()->create(['role' => UserRole::DEVELOPER]);
        $this->qa = User::factory()->create(['role' => UserRole::QA]);

        $this->project = Project::factory()->create(['created_by' => $this->admin->id]);
        $this->issue = Issue::factory()->create([
            'project_id' => $this->project->id,
            'created_by' => $this->admin->id,
            'assigned_to' => $this->developer->id,
            'status' => IssueStatus::OPEN,
        ]);
    }

    public function test_assigned_developer_can_start_and_resolve_issue(): void
    {
        // 1. Move OPEN -> IN_PROGRESS
        $response = $this->actingAs($this->developer)
            ->patchJson("/api/issues/{$this->issue->id}/status", [
                'status' => 'in_progress',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('issues', [
            'id' => $this->issue->id,
            'status' => 'in_progress',
        ]);

        // 2. Move IN_PROGRESS -> RESOLVED
        $response = $this->actingAs($this->developer)
            ->patchJson("/api/issues/{$this->issue->id}/status", [
                'status' => 'resolved',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('issues', [
            'id' => $this->issue->id,
            'status' => 'resolved',
        ]);
    }

    public function test_developer_cannot_verify_or_close_issue(): void
    {
        $this->issue->update(['status' => IssueStatus::RESOLVED]);

        $response = $this->actingAs($this->developer)
            ->patchJson("/api/issues/{$this->issue->id}/status", [
                'status' => 'verified',
            ]);

        $response->assertStatus(403);
    }

    public function test_unassigned_developer_cannot_update_status(): void
    {
        $otherDeveloper = User::factory()->create(['role' => UserRole::DEVELOPER]);

        $response = $this->actingAs($otherDeveloper)
            ->patchJson("/api/issues/{$this->issue->id}/status", [
                'status' => 'in_progress',
            ]);

        $response->assertStatus(403);
    }

    public function test_qa_can_verify_and_close_resolved_issue(): void
    {
        $this->issue->update(['status' => IssueStatus::RESOLVED]);

        // RESOLVED -> VERIFIED
        $response = $this->actingAs($this->qa)
            ->patchJson("/api/issues/{$this->issue->id}/status", [
                'status' => 'verified',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('issues', [
            'id' => $this->issue->id,
            'status' => 'verified',
        ]);

        // VERIFIED -> CLOSED
        $response = $this->actingAs($this->qa)
            ->patchJson("/api/issues/{$this->issue->id}/status", [
                'status' => 'closed',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('issues', [
            'id' => $this->issue->id,
            'status' => 'closed',
        ]);
    }

    public function test_qa_can_reopen_resolved_issue(): void
    {
        $this->issue->update(['status' => IssueStatus::RESOLVED]);

        $response = $this->actingAs($this->qa)
            ->patchJson("/api/issues/{$this->issue->id}/status", [
                'status' => 'reopened',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('issues', [
            'id' => $this->issue->id,
            'status' => 'reopened',
        ]);
    }

    public function test_invalid_transition_returns_422_unprocessable_entity(): void
    {
        // Transition directly from OPEN -> VERIFIED is invalid according to state machine
        $response = $this->actingAs($this->admin)
            ->patchJson("/api/issues/{$this->issue->id}/status", [
                'status' => 'verified',
            ]);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            'message' => "Invalid status transition from 'open' to 'verified'.",
        ]);
    }
}
