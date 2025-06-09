<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;

class Category extends Model
{
    use HasFactory, Notifiable;

    protected $table = 'tbl_categories';
    protected $primaryKey = 'category_id';
    protected $fillable = [
        'category_name'
    ];

    public function products(): HasMany
    {
        return $this->hasmany(Product::class, 'category_id', 'category_id');
    }
}
