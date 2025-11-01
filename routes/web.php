<?php

use App\Http\Controllers\PublicLetterController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PublicLetterController::class, 'index'])->name('public.letter-wizard');
