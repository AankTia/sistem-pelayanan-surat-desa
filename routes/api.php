<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\LetterCategoryController;
use App\Http\Controllers\Api\LetterTemplateController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // User Management
    Route::apiResource('users', UserController::class);

    // Role Management
    Route::apiResource('roles', RoleController::class);
    Route::post('roles/{id}/permissions', [RoleController::class, 'assignPermissions']);

    // Permission Management
    Route::get('permissions/all', [PermissionController::class, 'all']);
    Route::apiResource('permissions', PermissionController::class)->only(['index', 'show']);

    // Letter Category Management
    Route::get('letter-categories/all', [LetterCategoryController::class, 'all']);
    Route::post('letter-categories/reorder', [LetterCategoryController::class, 'reorder']);
    Route::apiResource('letter-categories', LetterCategoryController::class);

    // Letter Template Management
    Route::get('letter-templates/all', [LetterTemplateController::class, 'all']);
    Route::apiResource('letter-templates', LetterTemplateController::class);

    // Legacy route for compatibility
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
