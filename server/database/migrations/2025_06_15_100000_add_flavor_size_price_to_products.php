<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('flavor')->nullable()->after('category');
            $table->string('size', 20)->default('Baby')->after('flavor');
        });

        if (Schema::hasColumn('products', 'base_price') && !Schema::hasColumn('products', 'price')) {
            Schema::table('products', function (Blueprint $table) {
                $table->decimal('price', 10, 2)->default(0)->after('size');
            });
            DB::table('products')->update(['price' => DB::raw('base_price')]);
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('base_price');
            });
        }
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['flavor', 'size']);
        });
        if (Schema::hasColumn('products', 'price')) {
            Schema::table('products', function (Blueprint $table) {
                $table->decimal('base_price', 10, 2)->default(0)->after('category');
            });
            DB::table('products')->update(['base_price' => DB::raw('price')]);
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('price');
            });
        }
    }
};
