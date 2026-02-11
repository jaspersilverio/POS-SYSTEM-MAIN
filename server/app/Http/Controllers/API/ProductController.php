<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        private ProductService $productService
    ) {}

    public function index(): JsonResponse
    {
        $products = $this->productService->list();
        return response()->json($products);
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->has('addons') && is_string($request->input('addons'))) {
            $request->merge(['addons' => json_decode($request->input('addons'), true) ?? []]);
        }
        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|in:coffee,non-coffee,frappe,slush',
            'flavor' => 'required|string|max:255',
            'sizes' => 'required|array|min:1',
            'sizes.*.size' => 'required|in:Baby,Giant',
            'sizes.*.price' => 'required|numeric|min:0',
            'status' => 'nullable|in:active,inactive',
            'addons' => 'nullable|array',
            'addons.*.name' => 'required_with:addons|string|max:255',
            'addons.*.price' => 'required_with:addons|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $sizePrices = [];
        foreach ($request->input('sizes') as $row) {
            $sizePrices[$row['size']] = (float) $row['price'];
        }
        $data = $request->only('name', 'category', 'flavor', 'status', 'addons');
        $data['size_prices'] = $sizePrices;
        $data['size'] = array_key_first($sizePrices) ?? 'Baby';
        $data['price'] = $sizePrices['Baby'] ?? $sizePrices['Giant'] ?? 0;
        $data['status'] = $data['status'] ?? 'active';
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }
        if (!empty($data['addons'])) {
            foreach ($data['addons'] as $i => &$addon) {
                $addon['image'] = null;
                if ($request->hasFile('addon_image_' . $i)) {
                    $file = $request->file('addon_image_' . $i);
                    if ($file->isValid()) {
                        $addon['image'] = $file->store('addons', 'public');
                    }
                }
            }
        }

        $product = $this->productService->store($data);
        return response()->json($product, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        if ($request->has('addons') && is_string($request->input('addons'))) {
            $request->merge(['addons' => json_decode($request->input('addons'), true) ?? []]);
        }
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'category' => 'sometimes|in:coffee,non-coffee,frappe,slush',
            'flavor' => 'sometimes|string|max:255',
            'sizes' => 'sometimes|array|min:1',
            'sizes.*.size' => 'required_with:sizes|in:Baby,Giant',
            'sizes.*.price' => 'required_with:sizes|numeric|min:0',
            'status' => 'sometimes|in:active,inactive',
            'addons' => 'nullable|array',
            'addons.*.name' => 'required_with:addons|string|max:255',
            'addons.*.price' => 'required_with:addons|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        $data = $request->only('name', 'category', 'flavor', 'status', 'addons');
        if ($request->has('sizes')) {
            $sizePrices = [];
            foreach ($request->input('sizes') as $row) {
                $sizePrices[$row['size']] = (float) $row['price'];
            }
            $data['size_prices'] = $sizePrices;
            $data['size'] = array_key_first($sizePrices) ?? 'Baby';
            $data['price'] = $sizePrices['Baby'] ?? $sizePrices['Giant'] ?? 0;
        }
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }
        if (!empty($data['addons'])) {
            foreach ($data['addons'] as $i => &$addon) {
                $addon['image'] = $addon['image'] ?? null;
                if ($request->hasFile('addon_image_' . $i)) {
                    $file = $request->file('addon_image_' . $i);
                    if ($file->isValid()) {
                        $addon['image'] = $file->store('addons', 'public');
                    }
                }
            }
        }
        $product = $this->productService->update($id, $data);
        return response()->json($product);
    }

    public function ingredients(int $id): JsonResponse
    {
        $product = $this->productService->getRecipe($id);
        return response()->json($product->productIngredients->load('ingredient'));
    }

    public function storeIngredients(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'ingredients' => 'required|array|min:1',
            'ingredients.*.ingredient_id' => 'required|exists:ingredients,id',
            'ingredients.*.quantity' => 'required|numeric|min:0',
        ]);

        $product = $this->productService->setRecipe($id, $request->input('ingredients'));
        return response()->json($product->productIngredients->load('ingredient'), 201);
    }
}
