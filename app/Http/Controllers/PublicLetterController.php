<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PublicLetterController extends Controller
{
    public function index()
    {
        return view('public.letter-wizard');
    }
}
