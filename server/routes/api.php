<?php

use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\ProductController;
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

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
