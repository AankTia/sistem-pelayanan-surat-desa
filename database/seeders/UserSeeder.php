<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Super Admin
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'superadmin@example.com',
            'username' => 'superadmin',
            'password' => Hash::make('password'),
        ]);
        $superAdmin->assignRole('Super Admin');

        // Create Admin
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'username' => 'admin',
            'password' => Hash::make('password'),
        ]);
        $admin->assignRole('Admin');

        // Create Staff users
        $staff1 = User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'username' => 'budi',
            'password' => Hash::make('password'),
        ]);
        $staff1->assignRole('Staff');

        $staff2 = User::create([
            'name' => 'Siti Nurhaliza',
            'email' => 'siti@example.com',
            'username' => 'siti',
            'password' => Hash::make('password'),
        ]);
        $staff2->assignRole('Staff');

        // Create Operator
        $operator = User::create([
            'name' => 'Ahmad Yani',
            'email' => 'ahmad@example.com',
            'username' => 'ahmad',
            'password' => Hash::make('password'),
        ]);
        $operator->assignRole('Operator');

        $this->command->info('Users created successfully!');
        $this->command->info('Super Admin: superadmin@example.com / password');
        $this->command->info('Admin: admin@example.com / password');
        $this->command->info('Staff: budi@example.com / password');
        $this->command->info('Staff: siti@example.com / password');
        $this->command->info('Operator: ahmad@example.com / password');
    }
}
