<?php

namespace App\Services;

use App\Models\Ingredient;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    /**
     * Create order and deduct inventory. Rolls back on insufficient ingredients.
     *
     * @param array $items [['product_id' => int, 'quantity' => int, 'addons' => [['name' => string, 'price' => float]]]]
     * @return Order
     * @throws ValidationException
     */
    public function createOrder(User $cashier, array $items, string $paymentMethod): Order
    {
        $this->validateProductsExistAndHaveRecipes($items);

        return DB::transaction(function () use ($cashier, $items, $paymentMethod) {
            $order = new Order();
            $order->cashier_id = $cashier->id;
            $order->payment_method = $paymentMethod;
            $order->total_amount = 0;
            $order->save();

            $total = 0;

            foreach ($items as $item) {
                $product = Product::with('productIngredients.ingredient')->findOrFail($item['product_id']);
                $quantity = (int) ($item['quantity'] ?? 1);
                if ($quantity < 1) {
                    throw ValidationException::withMessages(['items' => ['Invalid quantity for product.']]);
                }

                $ingredientIds = $product->productIngredients->pluck('ingredient_id')->unique()->values()->all();
                $ingredientsLocked = Ingredient::whereIn('id', $ingredientIds)->lockForUpdate()->get()->keyBy('id');

                foreach ($product->productIngredients as $recipe) {
                    $ingredient = $ingredientsLocked->get($recipe->ingredient_id);
                    $needed = $recipe->quantity * $quantity;
                    if (!$ingredient || (float) $ingredient->stock < $needed) {
                        $name = $ingredient ? $ingredient->name : 'Unknown';
                        throw ValidationException::withMessages([
                            'items' => ["Insufficient stock for ingredient: {$name}. Required: {$needed}, available: " . ($ingredient ? $ingredient->stock : 0) . '.'],
                        ]);
                    }
                }

                $sizePrices = is_array($product->size_prices ?? null) ? $product->size_prices : [];
                $size = $item['size'] ?? null;
                $unitPrice = 0;
                if ($size && isset($sizePrices[$size]) && is_numeric($sizePrices[$size])) {
                    $unitPrice = (float) $sizePrices[$size];
                } else {
                    $unitPrice = (float) ($product->price ?? $product->base_price ?? 0);
                }
                $itemPrice = $unitPrice * $quantity;
                $addonsTotal = 0;
                if (!empty($item['addons'])) {
                    foreach ($item['addons'] as $addon) {
                        $addonsTotal += (float) ($addon['price'] ?? 0) * $quantity;
                    }
                }
                $lineTotal = $itemPrice + $addonsTotal;
                $total += $lineTotal;

                $orderItem = $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'price' => $unitPrice,
                ]);

                if (!empty($item['addons'])) {
                    foreach ($item['addons'] as $addon) {
                        $orderItem->addons()->create([
                            'addon_name' => $addon['name'] ?? 'Addon',
                            'price' => (float) ($addon['price'] ?? 0),
                        ]);
                    }
                }

                foreach ($product->productIngredients as $recipe) {
                    $deduct = $recipe->quantity * $quantity;
                    Ingredient::where('id', $recipe->ingredient_id)->decrement('stock', $deduct);
                }
            }

            $order->update(['total_amount' => $total]);

            return $order->load(['items.product', 'items.addons']);
        });
    }

    private function validateProductsExistAndHaveRecipes(array $items): void
    {
        foreach ($items as $item) {
            $product = Product::with('productIngredients')->find($item['product_id'] ?? 0);
            if (!$product) {
                throw ValidationException::withMessages(['items' => ['Product not found.']]);
            }
            if ($product->productIngredients->isEmpty()) {
                throw ValidationException::withMessages([
                    'items' => ["Product \"{$product->name}\" has no recipe. Add ingredients before selling."],
                ]);
            }
        }
    }
}
