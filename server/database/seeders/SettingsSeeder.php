<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        if (Setting::count() > 0) {
            return;
        }
        Setting::create([
            'store_name' => 'My Store',
            'store_address' => '',
            'store_contact' => '',
            'store_logo' => null,
            'tax_rate' => 0,
            'service_charge' => 0,
            'currency' => '₱',
            'low_stock_threshold' => 5,
            'auto_print_receipt' => false,
            'enable_addons' => true,
            'default_size' => 'baby',
            'receipt_header' => null,
            'receipt_footer' => null,
            'show_cashier_name' => true,
            'show_tax_breakdown' => true,
            'idle_timeout_minutes' => 30,
        ]);
    }
}
