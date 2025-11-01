<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        // app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Letter Request Permissions
            'view-letter-requests',
            'create-letter-requests',
            'edit-letter-requests',
            'delete-letter-requests',
            'approve-letter-requests',
            'reject-letter-requests',
            'print-letter-requests',

            // User Management Permissions
            'view-users',
            'create-users',
            'edit-users',
            'delete-users',

            // Resident Management Permissions
            'view-residents',
            'create-residents',
            'edit-residents',
            'delete-residents',

            // Role & Permission Management
            'view-roles',
            'create-roles',
            'edit-roles',
            'delete-roles',
            'assign-roles',

            // Reports & Analytics
            'view-reports',
            'generate-reports',
            'view-analytics',
            'view-charts',

            // Settings
            'view-settings',
            'edit-settings',

            // Activity Logs
            'view-logs',
            'delete-logs',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions

        // Super Admin - has all permissions
        $superAdmin = Role::create(['name' => 'Super Admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // Admin - has most permissions except role management
        $admin = Role::create(['name' => 'Admin']);
        $admin->givePermissionTo([
            'view-letter-requests',
            'create-letter-requests',
            'edit-letter-requests',
            'delete-letter-requests',
            'approve-letter-requests',
            'reject-letter-requests',
            'print-letter-requests',
            'view-users',
            'create-users',
            'edit-users',
            'view-residents',
            'create-residents',
            'edit-residents',
            'delete-residents',
            'view-reports',
            'generate-reports',
            'view-analytics',
            'view-charts',
            'view-settings',
            'edit-settings',
            'view-logs',
        ]);

        // Staff - has limited permissions
        $staff = Role::create(['name' => 'Staff']);
        $staff->givePermissionTo([
            'view-letter-requests',
            'create-letter-requests',
            'edit-letter-requests',
            'print-letter-requests',
            'view-residents',
            'create-residents',
            'view-reports',
            'view-charts',
        ]);

        // Operator - can only view and create letter requests
        $operator = Role::create(['name' => 'Operator']);
        $operator->givePermissionTo([
            'view-letter-requests',
            'create-letter-requests',
            'view-residents',
        ]);
    }
}
