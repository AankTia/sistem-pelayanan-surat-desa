<?php

use App\Http\Controllers\PublicLetterController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/surat', [PublicLetterController::class, 'index'])->name('public.letter-wizard');
