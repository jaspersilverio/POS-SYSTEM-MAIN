<?php

namespace Database\Seeders;

use App\Models\Ingredient;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        User::firstOrCreate(
            ['username' => 'cashier'],
            [
                'name' => 'Cashier',
                'password' => Hash::make('password'),
                'role' => 'cashier',
                'status' => 'active',
            ]
        );

        $ingredients = [
            ['name' => 'Espresso Beans', 'category' => 'beans', 'unit' => 'grams', 'stock' => 5000, 'par_level' => 500],
            ['name' => 'Whole Milk', 'category' => 'milk', 'unit' => 'ml', 'stock' => 10000, 'par_level' => 2000],
            ['name' => 'Vanilla Syrup', 'category' => 'syrup', 'unit' => 'ml', 'stock' => 2000, 'par_level' => 300],
            ['name' => 'Caramel Syrup', 'category' => 'syrup', 'unit' => 'ml', 'stock' => 1500, 'par_level' => 300],
            ['name' => 'Cup (Medium)', 'category' => 'consumable', 'unit' => 'pcs', 'stock' => 500, 'par_level' => 100],
            ['name' => 'Lid', 'category' => 'consumable', 'unit' => 'pcs', 'stock' => 500, 'par_level' => 100],
        ];
        foreach ($ingredients as $i) {
            Ingredient::firstOrCreate(
                ['name' => $i['name']],
                array_merge($i, ['status' => 'active'])
            );
        }

        $products = [
            ['name' => 'Espresso', 'category' => 'coffee', 'flavor' => 'Original', 'size' => 'Baby', 'price' => 80],
            ['name' => 'Americano', 'category' => 'coffee', 'flavor' => 'Original', 'size' => 'Baby', 'price' => 95],
            ['name' => 'Latte', 'category' => 'coffee', 'flavor' => 'Vanilla', 'size' => 'Baby', 'price' => 120],
            ['name' => 'Milk Tea', 'category' => 'non-coffee', 'flavor' => 'Vanilla', 'size' => 'Baby', 'price' => 100],
            ['name' => 'Caramel Frappe', 'category' => 'frappe', 'flavor' => 'Caramel', 'size' => 'Baby', 'price' => 140],
        ];
        foreach ($products as $p) {
            Product::firstOrCreate(
                ['name' => $p['name']],
                array_merge($p, ['status' => 'active'])
            );
        }

        $espressoBeans = Ingredient::where('name', 'Espresso Beans')->first();
        $milk = Ingredient::where('name', 'Whole Milk')->first();
        $vanilla = Ingredient::where('name', 'Vanilla Syrup')->first();
        $caramel = Ingredient::where('name', 'Caramel Syrup')->first();
        $cup = Ingredient::where('name', 'Cup (Medium)')->first();
        $lid = Ingredient::where('name', 'Lid')->first();

        $recipe = [
            'Espresso' => [['ingredient' => $espressoBeans, 'qty' => 18], ['ingredient' => $cup, 'qty' => 1], ['ingredient' => $lid, 'qty' => 1]],
            'Americano' => [['ingredient' => $espressoBeans, 'qty' => 18], ['ingredient' => $cup, 'qty' => 1], ['ingredient' => $lid, 'qty' => 1]],
            'Latte' => [['ingredient' => $espressoBeans, 'qty' => 18], ['ingredient' => $milk, 'qty' => 200], ['ingredient' => $cup, 'qty' => 1], ['ingredient' => $lid, 'qty' => 1]],
            'Milk Tea' => [['ingredient' => $milk, 'qty' => 250], ['ingredient' => $vanilla, 'qty' => 30], ['ingredient' => $cup, 'qty' => 1], ['ingredient' => $lid, 'qty' => 1]],
            'Caramel Frappe' => [['ingredient' => $espressoBeans, 'qty' => 15], ['ingredient' => $milk, 'qty' => 150], ['ingredient' => $caramel, 'qty' => 40], ['ingredient' => $cup, 'qty' => 1], ['ingredient' => $lid, 'qty' => 1]],
        ];
        foreach ($recipe as $productName => $lines) {
            $product = Product::where('name', $productName)->first();
            if (!$product) continue;
            foreach ($lines as $line) {
                $product->productIngredients()->firstOrCreate(
                    ['ingredient_id' => $line['ingredient']->id],
                    ['quantity' => $line['qty']]
                );
            }
        }

        $latte = Product::where('name', 'Latte')->first();
        if ($latte && $latte->addons()->count() === 0) {
            $latte->addons()->create(['name' => 'Extra Shot', 'price' => 25]);
            $latte->addons()->create(['name' => 'Oat Milk', 'price' => 30]);
        }

        $this->call(SettingsSeeder::class);
    }
}
