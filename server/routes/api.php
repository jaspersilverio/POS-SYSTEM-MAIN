<?php

use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::controller(RoleController::class)->group(function () {
    Route::get('/loadRoles', 'loadRoles');
    Route::post('/storeRole', 'storeRole');
    Route::put('/updateRole/{id}', 'updateRole');
    Route::delete('/deleteRole/{id}', 'deleteRole');
});

Route::controller(ProductController::class)->group(function () {
    Route::get('/loadProducts', 'loadProducts');
    Route::post('/storeProduct', 'storeProduct');
    Route::put('/updateProduct/{id}', 'updateProduct');
    Route::delete('/deleteProduct/{id}', 'deleteProduct');
});

// User routes
Route::get('/users', [\App\Http\Controllers\UserController::class, 'index']);
Route::post('/users', [\App\Http\Controllers\UserController::class, 'store']);
Route::get('/users/{id}', [\App\Http\Controllers\UserController::class, 'show']);
Route::put('/users/{id}', [\App\Http\Controllers\UserController::class, 'update']);
Route::delete('/users/{id}', [\App\Http\Controllers\UserController::class, 'destroy']);

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
