<?php

namespace Database\Seeders;

use App\Enums\IssuePriority;
use App\Enums\IssueStatus;
use App\Models\Issue;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoProjectSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();
        $pm = User::where('email', 'pm@example.com')->first();
        $developer = User::where('email', 'developer@example.com')->first();
        $qa = User::where('email', 'qa@example.com')->first();

        if (! $pm || ! $developer) {
            return;
        }

        $project = Project::create([
            'name' => 'Healthcare Web Portal',
            'description' => 'Main patient healthcare management web application.',
            'created_by' => $pm->id,
        ]);

        $project->members()->attach([$admin->id, $pm->id, $developer->id, $qa->id]);

        $issue = Issue::create([
            'project_id' => $project->id,
            'title' => 'Login error message not displayed',
            'description' => 'When entering incorrect password on login screen, error message container remains hidden.',
            'priority' => IssuePriority::HIGH->value,
            'status' => IssueStatus::OPEN->value,
            'branch_name' => 'fix/issue-101-login-error',
            'created_by' => $pm->id,
            'assigned_to' => $developer->id,
        ]);
    }
}
