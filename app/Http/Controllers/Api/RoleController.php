<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Display a listing of roles
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');

        $query = Role::with('permissions');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        $roles = $query->latest()->paginate($perPage);

        $transformedRoles = $roles->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'guard_name' => $role->guard_name,
                'permissions' => $role->permissions->pluck('name')->toArray(),
                'permissions_count' => $role->permissions->count(),
                'users_count' => $role->users()->count(),
                'created_at' => $role->created_at,
                'updated_at' => $role->updated_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'roles' => $transformedRoles->values()->all(),
                'pagination' => [
                    'current_page' => $roles->currentPage(),
                    'last_page' => $roles->lastPage(),
                    'per_page' => $roles->perPage(),
                    'total' => $roles->total(),
                ],
            ],
        ], 200);
    }

    /**
     * Store a newly created role
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|unique:roles,name|max:255',
            'permissions' => 'sometimes|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $role = Role::create(['name' => $request->name, 'guard_name' => 'web']);

        // Assign permissions if provided
        if ($request->has('permissions')) {
            // Get permission IDs by name for the web guard
            $permissions = Permission::whereIn('name', $request->permissions)
                ->where('guard_name', 'web')
                ->get();
            $role->syncPermissions($permissions);
        }

        $role->load('permissions');

        return response()->json([
            'success' => true,
            'message' => 'Role created successfully',
            'data' => [
                'role' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name,
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                    'permissions_count' => $role->permissions->count(),
                    'users_count' => 0,
                    'created_at' => $role->created_at,
                ],
            ],
        ], 201);
    }

    /**
     * Display the specified role
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $role = Role::with('permissions')->find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'role' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name,
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                    'permissions_count' => $role->permissions->count(),
                    'users_count' => $role->users()->count(),
                    'created_at' => $role->created_at,
                    'updated_at' => $role->updated_at,
                ],
            ],
        ], 200);
    }

    /**
     * Update the specified role
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $role = Role::find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255|unique:roles,name,' . $id,
            'permissions' => 'sometimes|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Update role name if provided
        if ($request->has('name')) {
            $role->name = $request->name;
            $role->save();
        }

        // Update permissions if provided
        if ($request->has('permissions')) {
            // Get permission IDs by name for the web guard
            $permissions = Permission::whereIn('name', $request->permissions)
                ->where('guard_name', 'web')
                ->get();
            $role->syncPermissions($permissions);
        }

        $role->load('permissions');

        return response()->json([
            'success' => true,
            'message' => 'Role updated successfully',
            'data' => [
                'role' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name,
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                    'permissions_count' => $role->permissions->count(),
                    'users_count' => $role->users()->count(),
                    'updated_at' => $role->updated_at,
                ],
            ],
        ], 200);
    }

    /**
     * Remove the specified role
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $role = Role::find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found',
            ], 404);
        }

        // Prevent deleting roles that have users
        $usersCount = $role->users()->count();
        if ($usersCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete role. It is assigned to {$usersCount} user(s).",
            ], 403);
        }

        $role->delete();

        return response()->json([
            'success' => true,
            'message' => 'Role deleted successfully',
        ], 200);
    }

    /**
     * Assign permissions to a role
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function assignPermissions(Request $request, $id)
    {
        $role = Role::find($id);

        if (!$role) {
            return response()->json([
                'success' => false,
                'message' => 'Role not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'permissions' => 'required|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Get permission IDs by name for the web guard
        $permissions = Permission::whereIn('name', $request->permissions)
            ->where('guard_name', 'web')
            ->get();
        $role->syncPermissions($permissions);
        $role->load('permissions');

        return response()->json([
            'success' => true,
            'message' => 'Permissions assigned successfully',
            'data' => [
                'role' => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                    'permissions_count' => $role->permissions->count(),
                ],
            ],
        ], 200);
    }
}
