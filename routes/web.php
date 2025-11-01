<?php

use App\Http\Controllers\PublicLetterController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/', [PublicLetterController::class, 'index'])->name('public.letter-wizard');

// Admin routes (React Router handles sub-routes)
Route::get('/admin/{any?}', [AdminController::class, 'index'])->where('any', '.*')->name('admin.index');
