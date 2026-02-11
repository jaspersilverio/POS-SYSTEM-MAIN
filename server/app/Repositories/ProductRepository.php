<?php

namespace App\Repositories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class ProductRepository
{
    public function getAll(): Collection
    {
        return Product::with(['addons', 'productIngredients.ingredient'])->orderBy('name')->get();
    }

    public function findById(int $id): ?Product
    {
        return Product::with(['addons', 'productIngredients.ingredient'])->find($id);
    }

    public function create(array $data): Product
    {
        return Product::create($data);
    }

    public function update(Product $product, array $data): bool
    {
        return $product->update($data);
    }
}
