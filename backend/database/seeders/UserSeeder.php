<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password123');

        $users = [
            [
                'email' => 'admin@example.com',
                'name' => 'System Admin',
                'role' => UserRole::ADMIN->value,
                'is_active' => true,
            ],
            [
                'email' => 'pm@example.com',
                'name' => 'Alex Turner (PM)',
                'role' => UserRole::PROJECT_MANAGER->value,
                'is_active' => true,
            ],
            [
                'email' => 'pm2@example.com',
                'name' => 'Elena Rostova (PM)',
                'role' => UserRole::PROJECT_MANAGER->value,
                'is_active' => true,
            ],
            [
                'email' => 'developer@example.com',
                'name' => 'John Developer',
                'role' => UserRole::DEVELOPER->value,
                'is_active' => true,
            ],
            [
                'email' => 'dev2@example.com',
                'name' => 'David Miller (Dev)',
                'role' => UserRole::DEVELOPER->value,
                'is_active' => true,
            ],
            [
                'email' => 'dev3@example.com',
                'name' => 'Sophia Chen (Dev)',
                'role' => UserRole::DEVELOPER->value,
                'is_active' => true,
            ],
            [
                'email' => 'qa@example.com',
                'name' => 'Sarah QA',
                'role' => UserRole::QA->value,
                'is_active' => true,
            ],
            [
                'email' => 'qa2@example.com',
                'name' => 'Robert Vance (QA)',
                'role' => UserRole::QA->value,
                'is_active' => true,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                array_merge($userData, ['password' => $password])
            );
        }
    }
}
