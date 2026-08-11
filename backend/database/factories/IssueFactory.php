<?php

namespace Database\Factories;

use App\Models\Issue;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Issue>
 */
class IssueFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => \App\Models\Project::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'priority' => \App\Enums\IssuePriority::MEDIUM,
            'status' => \App\Enums\IssueStatus::OPEN,
            'branch_name' => 'fix/issue-'.fake()->numberBetween(100, 999),
            'created_by' => \App\Models\User::factory(),
            'assigned_to' => null,
        ];
    }
}
