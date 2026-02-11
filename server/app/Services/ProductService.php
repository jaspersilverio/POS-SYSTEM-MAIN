<?php

namespace App\Services;

use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;

class ProductService
{
    public function __construct(
        private ProductRepository $productRepository
    ) {}

    public function list(): Collection
    {
        return $this->productRepository->getAll();
    }

    public function store(array $data): Product
    {
        $product = $this->productRepository->create([
            'name' => $data['name'],
            'category' => $data['category'],
            'flavor' => $data['flavor'] ?? '',
            'size' => $data['size'] ?? 'Baby',
            'price' => $data['price'] ?? $data['base_price'] ?? 0,
            'size_prices' => $data['size_prices'] ?? null,
            'status' => $data['status'] ?? 'active',
            'image' => $data['image'] ?? null,
        ]);

        if (!empty($data['addons'])) {
            foreach ($data['addons'] as $addon) {
                $product->addons()->create([
                    'name' => $addon['name'],
                    'price' => $addon['price'],
                    'image' => $addon['image'] ?? null,
                ]);
            }
        }

        return $this->productRepository->findById($product->id);
    }

    public function update(int $id, array $data): Product
    {
        $product = $this->productRepository->findById($id);
        if (!$product) {
            throw new \InvalidArgumentException('Product not found.');
        }

        if (isset($data['image']) && $product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->update([
            'name' => $data['name'] ?? $product->name,
            'category' => $data['category'] ?? $product->category,
            'flavor' => $data['flavor'] ?? $product->flavor,
            'size' => $data['size'] ?? $product->size,
            'price' => $data['price'] ?? $data['base_price'] ?? $product->price,
            'size_prices' => $data['size_prices'] ?? $product->size_prices,
            'status' => $data['status'] ?? $product->status,
            'image' => $data['image'] ?? $product->image,
        ]);

        if (isset($data['addons'])) {
            foreach ($product->addons as $old) {
                if ($old->image) {
                    Storage::disk('public')->delete($old->image);
                }
            }
            $product->addons()->delete();
            foreach ($data['addons'] as $addon) {
                $product->addons()->create([
                    'name' => $addon['name'],
                    'price' => $addon['price'],
                    'image' => $addon['image'] ?? null,
                ]);
            }
        }

        return $this->productRepository->findById($product->id);
    }

    public function getRecipe(int $productId): Product
    {
        $product = $this->productRepository->findById($productId);
        if (!$product) {
            throw new \InvalidArgumentException('Product not found.');
        }
        return $product;
    }

    public function setRecipe(int $productId, array $ingredients): Product
    {
        $product = $this->productRepository->findById($productId);
        if (!$product) {
            throw new \InvalidArgumentException('Product not found.');
        }

        $product->productIngredients()->delete();
        foreach ($ingredients as $item) {
            $product->productIngredients()->create([
                'ingredient_id' => $item['ingredient_id'],
                'quantity' => $item['quantity'],
            ]);
        }

        return $this->productRepository->findById($product->id);
    }
}
