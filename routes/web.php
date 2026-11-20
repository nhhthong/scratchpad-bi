<?php

use App\Http\Controllers\LocaleController;
use Illuminate\Support\Facades\Route;

// Guests are sent on to /login by the `auth` middleware of /dashboard.
Route::redirect('/', '/dashboard')->name('home');
Route::post('locale', LocaleController::class)->name('locale.update');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'sales/Chains')->name('dashboard');
    Route::inertia('sales/stores', 'sales/Stores')->name('sales.stores');
    Route::inertia('sales/products', 'sales/Products')->name('sales.products');

    Route::inertia('mypage', 'mypage/Index')->name('mypage');
    // Access control is mock for now; the page checks the mock role in the browser.
    Route::inertia('admin/permissions', 'admin/Permissions')->name('admin.permissions');
});

require __DIR__.'/settings.php';
