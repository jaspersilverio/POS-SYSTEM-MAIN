<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Ingredient extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'category', 'unit', 'stock', 'par_level', 'status'];

    protected function casts(): array
    {
        return [
            'stock' => 'decimal:2',
            'par_level' => 'decimal:2',
        ];
    }

    public function isLowStock(): bool
    {
        return $this->stock < $this->par_level;
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_ingredients')
            ->withPivot('quantity')
            ->withTimestamps();
    }
}
