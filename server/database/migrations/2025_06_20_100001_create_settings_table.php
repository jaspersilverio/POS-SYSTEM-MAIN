<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('store_name')->default('My Store');
            $table->string('store_address')->default('');
            $table->string('store_contact')->default('');
            $table->string('store_logo')->nullable();
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('service_charge', 5, 2)->default(0);
            $table->string('currency', 10)->default('₱');
            $table->unsignedInteger('low_stock_threshold')->default(5);
            $table->boolean('auto_print_receipt')->default(false);
            $table->boolean('enable_addons')->default(true);
            $table->enum('default_size', ['baby', 'giant'])->default('baby');
            $table->text('receipt_header')->nullable();
            $table->text('receipt_footer')->nullable();
            $table->boolean('show_cashier_name')->default(true);
            $table->boolean('show_tax_breakdown')->default(true);
            $table->unsignedInteger('idle_timeout_minutes')->default(30);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
