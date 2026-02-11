<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function __construct(
        private OrderService $orderService
    ) {}

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'payment_method' => 'required|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.size' => 'nullable|string|in:Baby,Giant',
            'items.*.addons' => 'nullable|array',
            'items.*.addons.*.name' => 'nullable|string|max:255',
            'items.*.addons.*.price' => 'nullable|numeric|min:0',
        ]);

        try {
            $order = $this->orderService->createOrder(
                $request->user(),
                $request->input('items'),
                $request->input('payment_method')
            );
            return response()->json($order, 201);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Order failed.', 'errors' => $e->errors()], 422);
        }
    }
}
