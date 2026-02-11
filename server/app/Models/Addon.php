<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Addon extends Model
{
    protected $fillable = ['name', 'image', 'price'];

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
}
