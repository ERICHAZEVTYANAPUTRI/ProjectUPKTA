<?php

use Carbon\Carbon;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/
Route::get('/cek-waktu', function () {
    return Carbon::now(); // waktu sekarang sesuai timezone Laravel
});

Route::get('/Beranda', function () {
    return view('welcome');
});