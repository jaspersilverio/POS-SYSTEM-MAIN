<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'store_name',
        'store_address',
        'store_contact',
        'store_logo',
        'tax_rate',
        'service_charge',
        'currency',
        'low_stock_threshold',
        'auto_print_receipt',
        'enable_addons',
        'default_size',
        'receipt_header',
        'receipt_footer',
        'show_cashier_name',
        'show_tax_breakdown',
        'idle_timeout_minutes',
    ];

    protected function casts(): array
    {
        return [
            'tax_rate' => 'decimal:2',
            'service_charge' => 'decimal:2',
            'low_stock_threshold' => 'integer',
            'auto_print_receipt' => 'boolean',
            'enable_addons' => 'boolean',
            'show_cashier_name' => 'boolean',
            'show_tax_breakdown' => 'boolean',
            'idle_timeout_minutes' => 'integer',
        ];
    }

    public static function get(): self
    {
        $setting = self::first();
        if (!$setting) {
            $setting = self::create([
                'store_name' => 'My Store',
                'store_address' => '',
                'store_contact' => '',
                'currency' => '₱',
                'low_stock_threshold' => 5,
                'enable_addons' => true,
                'default_size' => 'baby',
                'show_cashier_name' => true,
                'show_tax_breakdown' => true,
                'idle_timeout_minutes' => 30,
            ]);
        }
        return $setting;
    }
}
