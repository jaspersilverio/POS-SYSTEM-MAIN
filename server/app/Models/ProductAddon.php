<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductAddon extends Model
{
    protected $fillable = ['product_id', 'name', 'price', 'image'];

    protected $appends = ['image_url'];

    protected function casts(): array
    {
        return ['price' => 'decimal:2'];
    }

    public function getImageUrlAttribute(): ?string
    {
        if (empty($this->image)) {
            return null;
        }
        $base = request() ? request()->getSchemeAndHttpHost() : config('app.url');
        return rtrim($base, '/') . '/storage/' . ltrim($this->image, '/');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
