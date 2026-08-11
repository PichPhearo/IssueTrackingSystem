<?php

namespace Tests\Feature;

use App\Enums\IssuePriority;
use App\Enums\IssueStatus;
use App\Enums\UserRole;
use App\Models\Comment;
use App\Models\Issue;
use App\Models\Notification;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_fetch_their_notifications(): void
    {
        $user = User::factory()->create(['role' => UserRole::DEVELOPER]);
        $otherUser = User::factory()->create(['role' => UserRole::DEVELOPER]);

        Notification::create([
            'user_id' => $user->id,
            'type' => 'comment',
            'message' => 'New comment on your issue',
        ]);
        Notification::create([
            'user_id' => $otherUser->id,
            'type' => 'comment',
            'message' => 'Notification for other user',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/notifications');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('data.0.message', 'New comment on your issue');
    }

    public function test_user_can_mark_notification_as_read(): void
    {
        $user = User::factory()->create(['role' => UserRole::DEVELOPER]);
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => 'status_changed',
            'message' => 'Status changed',
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/notifications/{$notification->id}/read");

        $response->assertOk()
            ->assertJsonPath('unread_count', 0)
            ->assertJsonPath('notification.is_read', true);

        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_user_cannot_mark_another_users_notification(): void
    {
        $user = User::factory()->create(['role' => UserRole::DEVELOPER]);
        $otherUser = User::factory()->create(['role' => UserRole::DEVELOPER]);
        $notification = Notification::create([
            'user_id' => $otherUser->id,
            'type' => 'status_changed',
            'message' => 'Status changed',
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/notifications/{$notification->id}/read");

        $response->assertForbidden();
    }

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        $user = User::factory()->create(['role' => UserRole::DEVELOPER]);
        Notification::create([
            'user_id' => $user->id,
            'type' => 'comment',
            'message' => 'Comment 1',
        ]);
        Notification::create([
            'user_id' => $user->id,
            'type' => 'comment',
            'message' => 'Comment 2',
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson('/api/notifications/read-all');

        $response->assertOk()
            ->assertJsonPath('unread_count', 0);

        $this->assertEquals(0, $user->notifications()->whereNull('read_at')->count());
    }

    public function test_comment_creation_triggers_notification(): void
    {
        $creator = User::factory()->create(['role' => UserRole::DEVELOPER]);
        $assignee = User::factory()->create(['role' => UserRole::DEVELOPER]);
        $commenter = User::factory()->create(['role' => UserRole::DEVELOPER]);

        $project = Project::factory()->create(['created_by' => $creator->id]);
        $issue = Issue::factory()->create([
            'project_id' => $project->id,
            'created_by' => $creator->id,
            'assigned_to' => $assignee->id,
        ]);

        Sanctum::actingAs($commenter);

        $response = $this->postJson("/api/issues/{$issue->id}/comments", [
            'body' => 'This is a test comment',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('notifications', [
            'user_id' => $creator->id,
            'type' => 'comment',
            'related_issue_id' => $issue->id,
        ]);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $assignee->id,
            'type' => 'comment',
            'related_issue_id' => $issue->id,
        ]);

        // Commenter should not receive a notification
        $this->assertDatabaseMissing('notifications', [
            'user_id' => $commenter->id,
        ]);
    }
}
