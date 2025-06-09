<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function loadProducts()
    {
        $products = Product::with('category')->get();
        return response()->json([
            'products' => $products,
        ], 200);
    }

    public function storeProduct(Request $request)
    {
        $validated = $request->validate([
            'productName' => ['required', 'min: 3', 'max: 100'],
            'description' => ['nullable', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'categoryId' => ['required', 'exists:tbl_categories,category_id'],
            'image' => ['nullable', 'image', 'max:2048'],
        ]);

        $product = Product::create([
            'product_name' => $validated['productName'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'stock' => $validated['stock'],
            'category_id' => $validated['categoryId'],
            'image' => $request->hasFile('image') ? $request->file('image')->store('products', 'public') : null,
        ]);

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product,
        ], 200);
    }

    public function updateProduct(Request $request, $id)
    {
        $validated = $request->validate([
            'productName' => ['required', 'min: 3', 'max: 100'],
            'description' => ['nullable', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'categoryId' => ['required', 'exists:tbl_categories,category_id'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
        ]);

        $product = Product::findOrFail($id);

        $product->update([
            'product_name' => $validated['productName'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'stock' => $validated['stock'],
            'category_id' => $validated['categoryId'],
            'image' => $request->hasFile('image') ? $request->file('image')->store('products', 'public') : $product->image,
        ]);

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product,
        ], 200);
    }

    public function deleteProduct($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ], 200);
    }
}
