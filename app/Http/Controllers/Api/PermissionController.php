<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * Display a listing of permissions
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 100);
        $search = $request->input('search');
        $grouped = $request->input('grouped', false);

        $query = Permission::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($grouped) {
            // Return permissions grouped by category
            $permissions = Permission::all();

            $groupedPermissions = [
                'Letter Requests' => [],
                'Users' => [],
                'Residents' => [],
                'Roles' => [],
                'Reports & Analytics' => [],
                'Settings' => [],
                'Logs' => [],
            ];

            foreach ($permissions as $permission) {
                $name = $permission->name;

                if (str_contains($name, 'letter-request')) {
                    $groupedPermissions['Letter Requests'][] = [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'guard_name' => $permission->guard_name,
                        'created_at' => $permission->created_at,
                    ];
                } elseif (str_contains($name, 'user')) {
                    $groupedPermissions['Users'][] = [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'guard_name' => $permission->guard_name,
                        'created_at' => $permission->created_at,
                    ];
                } elseif (str_contains($name, 'resident')) {
                    $groupedPermissions['Residents'][] = [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'guard_name' => $permission->guard_name,
                        'created_at' => $permission->created_at,
                    ];
                } elseif (str_contains($name, 'role')) {
                    $groupedPermissions['Roles'][] = [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'guard_name' => $permission->guard_name,
                        'created_at' => $permission->created_at,
                    ];
                } elseif (str_contains($name, 'report') || str_contains($name, 'analytics') || str_contains($name, 'chart')) {
                    $groupedPermissions['Reports & Analytics'][] = [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'guard_name' => $permission->guard_name,
                        'created_at' => $permission->created_at,
                    ];
                } elseif (str_contains($name, 'setting')) {
                    $groupedPermissions['Settings'][] = [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'guard_name' => $permission->guard_name,
                        'created_at' => $permission->created_at,
                    ];
                } elseif (str_contains($name, 'log')) {
                    $groupedPermissions['Logs'][] = [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'guard_name' => $permission->guard_name,
                        'created_at' => $permission->created_at,
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'permissions' => $groupedPermissions,
                    'total' => $permissions->count(),
                ],
            ], 200);
        }

        // Return paginated list
        $permissions = $query->latest()->paginate($perPage);

        $transformedPermissions = $permissions->map(function ($permission) {
            return [
                'id' => $permission->id,
                'name' => $permission->name,
                'guard_name' => $permission->guard_name,
                'created_at' => $permission->created_at,
                'updated_at' => $permission->updated_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'permissions' => $transformedPermissions->values()->all(),
                'pagination' => [
                    'current_page' => $permissions->currentPage(),
                    'last_page' => $permissions->lastPage(),
                    'per_page' => $permissions->perPage(),
                    'total' => $permissions->total(),
                ],
            ],
        ], 200);
    }

    /**
     * Display the specified permission
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $permission = Permission::find($id);

        if (!$permission) {
            return response()->json([
                'success' => false,
                'message' => 'Permission not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'permission' => [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'guard_name' => $permission->guard_name,
                    'created_at' => $permission->created_at,
                    'updated_at' => $permission->updated_at,
                ],
            ],
        ], 200);
    }

    /**
     * Get all permissions in a simple list format
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function all()
    {
        $permissions = Permission::all()->pluck('name');

        return response()->json([
            'success' => true,
            'data' => [
                'permissions' => $permissions,
                'total' => $permissions->count(),
            ],
        ], 200);
    }
}
