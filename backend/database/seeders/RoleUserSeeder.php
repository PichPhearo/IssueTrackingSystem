<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleUserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password123');

        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'System Admin', 'password' => $password, 'role' => UserRole::ADMIN->value, 'is_active' => true]
        );

        User::updateOrCreate(
            ['email' => 'pm@example.com'],
            ['name' => 'Project Manager', 'password' => $password, 'role' => UserRole::PROJECT_MANAGER->value, 'is_active' => true]
        );

        User::updateOrCreate(
            ['email' => 'developer@example.com'],
            ['name' => 'John Developer', 'password' => $password, 'role' => UserRole::DEVELOPER->value, 'is_active' => true]
        );

        User::updateOrCreate(
            ['email' => 'qa@example.com'],
            ['name' => 'Sarah QA', 'password' => $password, 'role' => UserRole::QA->value, 'is_active' => true]
        );
    }
}
