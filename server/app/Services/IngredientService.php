<?php

namespace App\Services;

use App\Models\Ingredient;
use App\Repositories\IngredientRepository;
use Illuminate\Database\Eloquent\Collection;

class IngredientService
{
    public function __construct(
        private IngredientRepository $ingredientRepository
    ) {}

    public function list(): Collection
    {
        return $this->ingredientRepository->getAll();
    }

    public function store(array $data): Ingredient
    {
        return $this->ingredientRepository->create($data);
    }

    public function update(int $id, array $data): Ingredient
    {
        $ingredient = $this->ingredientRepository->findById($id);
        if (!$ingredient) {
            throw new \InvalidArgumentException('Ingredient not found.');
        }
        $this->ingredientRepository->update($ingredient, $data);
        return $ingredient->fresh();
    }
}
