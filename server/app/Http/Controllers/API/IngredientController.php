<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\IngredientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IngredientController extends Controller
{
    public function __construct(
        private IngredientService $ingredientService
    ) {}

    public function index(): JsonResponse
    {
        $ingredients = $this->ingredientService->list();
        return response()->json($ingredients);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'unit' => 'required|string|max:50',
            'stock' => 'nullable|numeric|min:0',
            'par_level' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive',
        ]);

        $data = $request->only('name', 'category', 'unit', 'stock', 'par_level', 'status');
        $data['stock'] = $data['stock'] ?? 0;
        $data['par_level'] = $data['par_level'] ?? 0;
        $data['status'] = $data['status'] ?? 'active';

        $ingredient = $this->ingredientService->store($data);
        return response()->json($ingredient, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'category' => 'sometimes|string|max:255',
            'unit' => 'sometimes|string|max:50',
            'stock' => 'sometimes|numeric|min:0',
            'par_level' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $data = $request->only('name', 'category', 'unit', 'stock', 'par_level', 'status');
        $ingredient = $this->ingredientService->update($id, $data);
        return response()->json($ingredient);
    }
}
