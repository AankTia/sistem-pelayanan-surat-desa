<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LetterCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class LetterCategoryController extends Controller
{
    /**
     * Display a listing of letter categories
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');
        $status = $request->input('status');

        $query = LetterCategory::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        $categories = $query->orderBy('order')->paginate($perPage);

        $transformedCategories = $categories->map(function ($category) {
            // Count templates associated with this category
            $templatesCount = DB::table('letter_templates')
                ->where('letter_category_id', $category->id)
                ->whereNull('deleted_at')
                ->count();

            return [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'icon' => $category->icon,
                'order' => $category->order,
                'status' => $category->status,
                'templates_count' => $templatesCount,
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'categories' => $transformedCategories->values()->all(),
                'pagination' => [
                    'current_page' => $categories->currentPage(),
                    'last_page' => $categories->lastPage(),
                    'per_page' => $categories->perPage(),
                    'total' => $categories->total(),
                ],
            ],
        ], 200);
    }

    /**
     * Get all categories in a simple list format (no pagination)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function all()
    {
        $categories = LetterCategory::where('status', 'active')
            ->orderBy('order')
            ->get(['id', 'name', 'slug', 'icon']);

        return response()->json([
            'success' => true,
            'data' => [
                'categories' => $categories,
                'total' => $categories->count(),
            ],
        ], 200);
    }

    /**
     * Store a newly created letter category
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:letter_categories,name',
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|string|max:255',
            'order' => 'nullable|integer|min:1',
            'status' => 'required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // If no order is provided, set it to the next available number
        if (!$request->has('order')) {
            $maxOrder = LetterCategory::max('order');
            $request->merge(['order' => $maxOrder ? $maxOrder + 1 : 1]);
        }

        $category = LetterCategory::create($request->only([
            'name',
            'description',
            'icon',
            'order',
            'status',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Letter category created successfully',
            'data' => [
                'category' => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'icon' => $category->icon,
                    'order' => $category->order,
                    'status' => $category->status,
                    'templates_count' => 0,
                    'created_at' => $category->created_at,
                ],
            ],
        ], 201);
    }

    /**
     * Display the specified letter category
     *
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $category = LetterCategory::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Letter category not found',
            ], 404);
        }

        // Count templates associated with this category
        $templatesCount = DB::table('letter_templates')
            ->where('letter_category_id', $category->id)
            ->whereNull('deleted_at')
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'category' => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'icon' => $category->icon,
                    'order' => $category->order,
                    'status' => $category->status,
                    'templates_count' => $templatesCount,
                    'created_at' => $category->created_at,
                    'updated_at' => $category->updated_at,
                ],
            ],
        ], 200);
    }

    /**
     * Update the specified letter category
     *
     * @param Request $request
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $category = LetterCategory::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Letter category not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255|unique:letter_categories,name,' . $id,
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|string|max:255',
            'order' => 'nullable|integer|min:1',
            'status' => 'sometimes|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $category->update($request->only([
            'name',
            'description',
            'icon',
            'order',
            'status',
        ]));

        // Count templates associated with this category
        $templatesCount = DB::table('letter_templates')
            ->where('letter_category_id', $category->id)
            ->whereNull('deleted_at')
            ->count();

        return response()->json([
            'success' => true,
            'message' => 'Letter category updated successfully',
            'data' => [
                'category' => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'icon' => $category->icon,
                    'order' => $category->order,
                    'status' => $category->status,
                    'templates_count' => $templatesCount,
                    'updated_at' => $category->updated_at,
                ],
            ],
        ], 200);
    }

    /**
     * Remove the specified letter category
     *
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $category = LetterCategory::find($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Letter category not found',
            ], 404);
        }

        // Check if category has associated templates
        $templatesCount = DB::table('letter_templates')
            ->where('letter_category_id', $category->id)
            ->whereNull('deleted_at')
            ->count();

        if ($templatesCount > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete category. It has {$templatesCount} associated template(s).",
            ], 403);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Letter category deleted successfully',
        ], 200);
    }

    /**
     * Reorder letter categories
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function reorder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'categories' => 'required|array',
            'categories.*.id' => 'required|string|exists:letter_categories,id',
            'categories.*.order' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        foreach ($request->categories as $categoryData) {
            LetterCategory::where('id', $categoryData['id'])
                ->update(['order' => $categoryData['order']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Categories reordered successfully',
        ], 200);
    }
}
