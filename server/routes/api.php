<?php

use App\Http\Controllers\Api\AddonController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\IngredientController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UserManagementController;
use Illuminate\Support\Facades\Route;

// Public
Route::post('/login', [AuthController::class, 'login']);

// Authenticated
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/ingredients', [IngredientController::class, 'index']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/addons', [AddonController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);

    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingsController::class, 'index']);
        Route::get('/system-info', [SettingsController::class, 'systemInfo']);
        Route::put('/', [SettingsController::class, 'update'])->middleware('admin');
        Route::get('/users', [UserManagementController::class, 'index'])->middleware('admin');
        Route::post('/users', [UserManagementController::class, 'store'])->middleware('admin');
        Route::put('/users/{id}', [UserManagementController::class, 'update'])->middleware('admin');
        Route::patch('/users/{id}/status', [UserManagementController::class, 'status'])->middleware('admin');
        Route::post('/users/{id}/reset-password', [UserManagementController::class, 'resetPassword']);
    });

    Route::get('/products/{id}/ingredients', [ProductController::class, 'ingredients']);
    Route::post('/products/{id}/ingredients', [ProductController::class, 'storeIngredients'])->middleware('admin');

    // Admin only
    Route::middleware('admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::post('/ingredients', [IngredientController::class, 'store']);
        Route::put('/ingredients/{id}', [IngredientController::class, 'update']);
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::post('/addons', [AddonController::class, 'store']);
    });
});
