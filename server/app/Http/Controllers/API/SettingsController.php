<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingsController extends Controller
{
    public function systemInfo(): JsonResponse
    {
        $settings = Setting::first();
        $totalUsers = User::count();
        $totalProducts = Product::count();
        $databaseStatus = 'ok';
        try {
            DB::connection()->getPdo();
        } catch (\Throwable) {
            $databaseStatus = 'error';
        }
        return response()->json([
            'total_users' => $totalUsers,
            'total_products' => $totalProducts,
            'system_version' => '1.0.0',
            'last_updated' => $settings ? $settings->updated_at?->toIso8601String() : null,
            'database_status' => $databaseStatus,
        ]);
    }

    public function index(): JsonResponse
    {
        $settings = Setting::get();
        return response()->json($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'store_name' => 'sometimes|string|max:255',
            'store_address' => 'sometimes|string|max:500',
            'store_contact' => 'sometimes|string|max:255',
            'store_logo' => 'nullable|string|max:500',
            'tax_rate' => 'sometimes|numeric|min:0|max:100',
            'service_charge' => 'sometimes|numeric|min:0',
            'currency' => 'sometimes|string|max:10',
            'low_stock_threshold' => 'sometimes|integer|min:0',
            'auto_print_receipt' => 'sometimes|boolean',
            'enable_addons' => 'sometimes|boolean',
            'default_size' => 'sometimes|in:baby,giant',
            'receipt_header' => 'nullable|string|max:2000',
            'receipt_footer' => 'nullable|string|max:2000',
            'show_cashier_name' => 'sometimes|boolean',
            'show_tax_breakdown' => 'sometimes|boolean',
            'idle_timeout_minutes' => 'sometimes|integer|min:5',
        ]);

        $setting = Setting::get();
        $setting->update($request->only([
            'store_name', 'store_address', 'store_contact', 'store_logo',
            'tax_rate', 'service_charge', 'currency', 'low_stock_threshold',
            'auto_print_receipt', 'enable_addons', 'default_size',
            'receipt_header', 'receipt_footer',
            'show_cashier_name', 'show_tax_breakdown', 'idle_timeout_minutes',
        ]));

        return response()->json($setting->fresh());
    }
}
