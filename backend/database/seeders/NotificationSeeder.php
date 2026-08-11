<?php

namespace Database\Seeders;

use App\Models\Issue;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $dev1 = User::where('email', 'developer@example.com')->first();
        $dev2 = User::where('email', 'dev2@example.com')->first();
        $pm = User::where('email', 'pm@example.com')->first();
        $qa1 = User::where('email', 'qa@example.com')->first();

        $issue1 = Issue::where('title', 'like', '%Login error message%')->first();
        $issue2 = Issue::where('title', 'like', '%Patient appointment calendar%')->first();
        $issue3 = Issue::where('title', 'like', '%Payment Gateway session%')->first();

        if ($dev1 && $issue1) {
            Notification::create([
                'user_id' => $dev1->id,
                'type' => 'issue_assigned',
                'message' => 'You were assigned to issue: Login error message not displayed on invalid credentials',
                'related_issue_id' => $issue1->id,
                'read_at' => null,
            ]);
        }

        if ($dev2 && $issue2) {
            Notification::create([
                'user_id' => $dev2->id,
                'type' => 'issue_status_updated',
                'message' => 'Issue "Patient appointment calendar timezone offset error" status changed to IN_PROGRESS',
                'related_issue_id' => $issue2->id,
                'read_at' => now()->subHours(2),
            ]);
        }

        if ($pm && $issue3) {
            Notification::create([
                'user_id' => $pm->id,
                'type' => 'comment_added',
                'message' => 'Sophia Chen commented on issue "Payment Gateway session timeout during checkout"',
                'related_issue_id' => $issue3->id,
                'read_at' => null,
            ]);
        }

        if ($qa1 && $issue1) {
            Notification::create([
                'user_id' => $qa1->id,
                'type' => 'issue_resolved',
                'message' => 'Issue "Login error message not displayed on invalid credentials" is ready for QA verification',
                'related_issue_id' => $issue1->id,
                'read_at' => null,
            ]);
        }
    }
}
