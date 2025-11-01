<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LetterTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LetterTemplateController extends Controller
{
    /**
     * Display a listing of letter templates
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search');
        $status = $request->input('status');
        $categoryId = $request->input('category_id');

        $query = LetterTemplate::with('category:id,name,slug');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($categoryId) {
            $query->where('letter_category_id', $categoryId);
        }

        $templates = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $transformedTemplates = $templates->map(function ($template) {
            return [
                'id' => $template->id,
                'name' => $template->name,
                'code' => $template->code,
                'fields' => $template->fields,
                'template_html' => $template->template_html,
                'signature_type' => $template->signature_type,
                'status' => $template->status,
                'letter_category' => $template->category ? [
                    'id' => $template->category->id,
                    'name' => $template->category->name,
                    'slug' => $template->category->slug,
                ] : null,
                'created_at' => $template->created_at,
                'updated_at' => $template->updated_at,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'templates' => $transformedTemplates->values()->all(),
                'pagination' => [
                    'current_page' => $templates->currentPage(),
                    'last_page' => $templates->lastPage(),
                    'per_page' => $templates->perPage(),
                    'total' => $templates->total(),
                ],
            ],
        ], 200);
    }

    /**
     * Get all templates in a simple list format (no pagination)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function all(Request $request)
    {
        $categoryId = $request->input('category_id');

        $query = LetterTemplate::where('status', 'active')
            ->orderBy('name');

        if ($categoryId) {
            $query->where('letter_category_id', $categoryId);
        }

        $templates = $query->get(['id', 'name', 'code', 'letter_category_id']);

        return response()->json([
            'success' => true,
            'data' => [
                'templates' => $templates,
                'total' => $templates->count(),
            ],
        ], 200);
    }

    /**
     * Store a newly created letter template
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'letter_category_id' => 'required|string|exists:letter_categories,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:letter_templates,code',
            'fields' => 'required|array',
            'fields.*.name' => 'required|string',
            'fields.*.label' => 'required|string',
            'fields.*.type' => 'required|string|in:text,textarea,number,date,select,checkbox,radio',
            'fields.*.placeholder' => 'nullable|string',
            'fields.*.required' => 'required|boolean',
            'fields.*.options' => 'nullable|array',
            'template_html' => 'required|string',
            'signature_type' => 'required|in:digital,manual',
            'status' => 'required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $template = LetterTemplate::create($request->only([
            'letter_category_id',
            'name',
            'code',
            'fields',
            'template_html',
            'signature_type',
            'status',
        ]));

        $template->load('category:id,name,slug');

        return response()->json([
            'success' => true,
            'message' => 'Letter template created successfully',
            'data' => [
                'template' => [
                    'id' => $template->id,
                    'name' => $template->name,
                    'code' => $template->code,
                    'fields' => $template->fields,
                    'template_html' => $template->template_html,
                    'signature_type' => $template->signature_type,
                    'status' => $template->status,
                    'letter_category' => $template->letterCategory ? [
                        'id' => $template->letterCategory->id,
                        'name' => $template->letterCategory->name,
                        'slug' => $template->letterCategory->slug,
                    ] : null,
                    'created_at' => $template->created_at,
                ],
            ],
        ], 201);
    }

    /**
     * Display the specified letter template
     *
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $template = LetterTemplate::with('category:id,name,slug')->find($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Letter template not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'template' => [
                    'id' => $template->id,
                    'name' => $template->name,
                    'code' => $template->code,
                    'fields' => $template->fields,
                    'template_html' => $template->template_html,
                    'signature_type' => $template->signature_type,
                    'status' => $template->status,
                    'letter_category' => $template->letterCategory ? [
                        'id' => $template->letterCategory->id,
                        'name' => $template->letterCategory->name,
                        'slug' => $template->letterCategory->slug,
                    ] : null,
                    'created_at' => $template->created_at,
                    'updated_at' => $template->updated_at,
                ],
            ],
        ], 200);
    }

    /**
     * Update the specified letter template
     *
     * @param Request $request
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $template = LetterTemplate::find($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Letter template not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'letter_category_id' => 'sometimes|string|exists:letter_categories,id',
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:letter_templates,code,' . $id,
            'fields' => 'sometimes|array',
            'fields.*.name' => 'required|string',
            'fields.*.label' => 'required|string',
            'fields.*.type' => 'required|string|in:text,textarea,number,date,select,checkbox,radio',
            'fields.*.placeholder' => 'nullable|string',
            'fields.*.required' => 'required|boolean',
            'fields.*.options' => 'nullable|array',
            'template_html' => 'sometimes|string',
            'signature_type' => 'sometimes|in:digital,manual',
            'status' => 'sometimes|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $template->update($request->only([
            'letter_category_id',
            'name',
            'code',
            'fields',
            'template_html',
            'signature_type',
            'status',
        ]));

        $template->load('category:id,name,slug');

        return response()->json([
            'success' => true,
            'message' => 'Letter template updated successfully',
            'data' => [
                'template' => [
                    'id' => $template->id,
                    'name' => $template->name,
                    'code' => $template->code,
                    'fields' => $template->fields,
                    'template_html' => $template->template_html,
                    'signature_type' => $template->signature_type,
                    'status' => $template->status,
                    'letter_category' => $template->letterCategory ? [
                        'id' => $template->letterCategory->id,
                        'name' => $template->letterCategory->name,
                        'slug' => $template->letterCategory->slug,
                    ] : null,
                    'updated_at' => $template->updated_at,
                ],
            ],
        ], 200);
    }

    /**
     * Remove the specified letter template
     *
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $template = LetterTemplate::find($id);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Letter template not found',
            ], 404);
        }

        // TODO: Check if template has associated letter requests before deletion
        // For now, we'll allow deletion

        $template->delete();

        return response()->json([
            'success' => true,
            'message' => 'Letter template deleted successfully',
        ], 200);
    }
}
