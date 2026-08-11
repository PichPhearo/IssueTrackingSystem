<?php

namespace Database\Seeders;

use App\Enums\IssuePriority;
use App\Enums\IssueStatus;
use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class IssueSeeder extends Seeder
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

        $project1 = Project::where('name', 'Healthcare Web Portal')->first();
        $project2 = Project::where('name', 'E-Commerce Logistics Hub')->first();
        $project3 = Project::where('name', 'TRACER Core Analytics')->first();

        if (! $project1 || ! $project2 || ! $project3) {
            return;
        }

        $issues = [
            // Project 1 Issues
            [
                'project_id' => $project1->id,
                'title' => 'Login error message not displayed on invalid credentials',
                'description' => 'When entering an incorrect password on the login screen, the error message banner remains hidden instead of showing feedback.',
                'priority' => IssuePriority::HIGH->value,
                'status' => IssueStatus::OPEN->value,
                'branch_name' => 'fix/issue-101-login-error',
                'created_by' => $pm->id,
                'assigned_to' => $dev1->id,
            ],
            [
                'project_id' => $project1->id,
                'title' => 'Patient appointment calendar timezone offset error',
                'description' => 'Appointments scheduled across different timezones shift by +5 hours upon saving due to UTC serialization mismatches.',
                'priority' => IssuePriority::CRITICAL->value,
                'status' => IssueStatus::IN_PROGRESS->value,
                'branch_name' => 'fix/issue-102-calendar-timezone',
                'created_by' => $qa1->id,
                'assigned_to' => $dev2->id,
            ],
            [
                'project_id' => $project1->id,
                'title' => 'Prescription PDF download fails with 500 error',
                'description' => 'Clicking the download prescription PDF button triggers a server exception when patient history contains non-ASCII characters.',
                'priority' => IssuePriority::MEDIUM->value,
                'status' => IssueStatus::RESOLVED->value,
                'branch_name' => 'fix/issue-103-pdf-utf8',
                'created_by' => $pm->id,
                'assigned_to' => $dev1->id,
            ],

            // Project 2 Issues
            [
                'project_id' => $project2->id,
                'title' => 'Payment Gateway session timeout during checkout',
                'description' => 'Stripe checkout modal times out prematurely if user takes longer than 3 minutes to fill credit card billing details.',
                'priority' => IssuePriority::CRITICAL->value,
                'status' => IssueStatus::IN_PROGRESS->value,
                'branch_name' => 'fix/checkout-session-ttl',
                'created_by' => $pm2->id,
                'assigned_to' => $dev3->id,
            ],
            [
                'project_id' => $project2->id,
                'title' => 'Warehouse inventory bulk CSV import memory limit exceeded',
                'description' => 'Uploading inventory CSV files larger than 10MB crashes worker threads due to unpaginated database batch inserts.',
                'priority' => IssuePriority::HIGH->value,
                'status' => IssueStatus::VERIFIED->value,
                'branch_name' => 'feature/csv-stream-parser',
                'created_by' => $qa2->id,
                'assigned_to' => $dev2->id,
            ],

            // Project 3 Issues
            [
                'project_id' => $project3->id,
                'title' => 'Dark mode contrast ratio insufficient on badge component',
                'description' => 'Text inside status badges on dark mode background fails WCAG 2.1 AA accessibility contrast standards.',
                'priority' => IssuePriority::LOW->value,
                'status' => IssueStatus::CLOSED->value,
                'branch_name' => 'ui/badge-darkmode-contrast',
                'created_by' => $qa1->id,
                'assigned_to' => $dev1->id,
            ],
            [
                'project_id' => $project3->id,
                'title' => 'Mobile screen restriction guard banner implementation',
                'description' => 'Add responsive mobile restriction guard blocking screen sizes under 1024px width with desktop recommendation message.',
                'priority' => IssuePriority::MEDIUM->value,
                'status' => IssueStatus::VERIFIED->value,
                'branch_name' => 'feature/mobile-guard-ui',
                'created_by' => $pm->id,
                'assigned_to' => $dev3->id,
            ],
        ];

        foreach ($issues as $issueData) {
            Issue::updateOrCreate(
                [
                    'project_id' => $issueData['project_id'],
                    'title' => $issueData['title'],
                ],
                $issueData
            );
        }
    }
}
