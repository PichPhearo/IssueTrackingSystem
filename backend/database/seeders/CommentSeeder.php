<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Issue;
use App\Models\User;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    public function run(): void
    {
        $pm = User::where('email', 'pm@example.com')->first();
        $pm2 = User::where('email', 'pm2@example.com')->first();
        $dev1 = User::where('email', 'developer@example.com')->first();
        $dev2 = User::where('email', 'dev2@example.com')->first();
        $dev3 = User::where('email', 'dev3@example.com')->first();
        $qa1 = User::where('email', 'qa@example.com')->first();
        $qa2 = User::where('email', 'qa2@example.com')->first();

        $issue1 = Issue::where('title', 'like', '%Login error message%')->first();
        $issue2 = Issue::where('title', 'like', '%Patient appointment calendar%')->first();
        $issue3 = Issue::where('title', 'like', '%Payment Gateway session%')->first();
        $issue4 = Issue::where('title', 'like', '%Warehouse inventory bulk%')->first();

        if ($issue1 && $dev1 && $pm) {
            Comment::create([
                'issue_id' => $issue1->id,
                'user_id' => $pm->id,
                'body' => 'This issue was reported by multiple users trying to log in on mobile browsers. Please investigate the error state container.',
            ]);

            Comment::create([
                'issue_id' => $issue1->id,
                'user_id' => $dev1->id,
                'body' => 'I have traced the issue to a missing state update in the catch block of LoginForm.jsx. Preparing fix branch fix/issue-101-login-error.',
            ]);
        }

        if ($issue2 && $dev2 && $qa1) {
            Comment::create([
                'issue_id' => $issue2->id,
                'user_id' => $qa1->id,
                'body' => 'Reproduced on Chrome v126 with EST timezone. Saved dates shift +5 hours after refresh.',
            ]);

            Comment::create([
                'issue_id' => $issue2->id,
                'user_id' => $dev2->id,
                'body' => 'Working on converting datetime strings to ISO 8601 UTC before storing in DB.',
            ]);
        }

        if ($issue3 && $dev3 && $pm2) {
            Comment::create([
                'issue_id' => $issue3->id,
                'user_id' => $pm2->id,
                'body' => 'Payment drop-off rate increased by 4% due to timeout. Setting priority to CRITICAL.',
            ]);

            Comment::create([
                'issue_id' => $issue3->id,
                'user_id' => $dev3->id,
                'body' => 'Extended Redis session timeout TTL to 3600 seconds and added automatic session refresh Ping during card details entry.',
            ]);
        }

        if ($issue4 && $qa2 && $dev2) {
            Comment::create([
                'issue_id' => $issue4->id,
                'user_id' => $dev2->id,
                'body' => 'Implemented chunked CSV stream parsing using Laravel LazyCollection.',
            ]);

            Comment::create([
                'issue_id' => $issue4->id,
                'user_id' => $qa2->id,
                'body' => 'Verified with 50,000 inventory records test dataset. Memory consumption remained below 16MB. Marking as VERIFIED.',
            ]);
        }
    }
}
