<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();
        $pm = User::where('email', 'pm@example.com')->first();
        $pm2 = User::where('email', 'pm2@example.com')->first();
        $dev1 = User::where('email', 'developer@example.com')->first();
        $dev2 = User::where('email', 'dev2@example.com')->first();
        $dev3 = User::where('email', 'dev3@example.com')->first();
        $qa1 = User::where('email', 'qa@example.com')->first();
        $qa2 = User::where('email', 'qa2@example.com')->first();

        if (! $pm || ! $admin) {
            return;
        }

        // Project 1: Healthcare Patient Portal
        $project1 = Project::updateOrCreate(
            ['name' => 'Healthcare Web Portal'],
            [
                'description' => 'Main patient healthcare management web application featuring telehealth consultations, appointment scheduling, and electronic health records.',
                'created_by' => $pm->id,
            ]
        );
        $project1->members()->syncWithoutDetaching([
            $admin->id,
            $pm->id,
            $dev1->id,
            $dev2->id,
            $qa1->id,
        ]);

        // Project 2: E-Commerce Inventory & Logistics
        $project2 = Project::updateOrCreate(
            ['name' => 'E-Commerce Logistics Hub'],
            [
                'description' => 'Real-time warehouse inventory management system, automated shipping status tracking, and order fulfillment integration.',
                'created_by' => $pm2->id,
            ]
        );
        $project2->members()->syncWithoutDetaching([
            $admin->id,
            $pm2->id,
            $dev2->id,
            $dev3->id,
            $qa2->id,
        ]);

        // Project 3: TRACER Core Analytics Platform
        $project3 = Project::updateOrCreate(
            ['name' => 'TRACER Core Analytics'],
            [
                'description' => 'Internal high-performance issue tracking and workflow automation platform for development and quality assurance teams.',
                'created_by' => $admin->id,
            ]
        );
        $project3->members()->syncWithoutDetaching([
            $admin->id,
            $pm->id,
            $pm2->id,
            $dev1->id,
            $dev3->id,
            $qa1->id,
            $qa2->id,
        ]);
    }
}
