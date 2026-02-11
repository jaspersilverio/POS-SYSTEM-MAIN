<?php

namespace App\Repositories;

use App\Models\Ingredient;
use Illuminate\Database\Eloquent\Collection;

class IngredientRepository
{
    public function getAll(): Collection
    {
        return Ingredient::orderBy('name')->get();
    }

    public function findById(int $id): ?Ingredient
    {
        return Ingredient::find($id);
    }

    public function create(array $data): Ingredient
    {
        return Ingredient::create($data);
    }

    public function update(Ingredient $ingredient, array $data): bool
    {
        return $ingredient->update($data);
    }

    public function getLowStock(): Collection
    {
        return Ingredient::whereColumn('stock', '<', 'par_level')->get();
    }
}
