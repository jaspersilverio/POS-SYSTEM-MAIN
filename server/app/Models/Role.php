<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;

class Role extends Model
{
    use HasFactory, Notifiable;

    protected $table = 'tbl_roles'; // Custom table name
    protected $primaryKey = 'role_id'; // Custom primary key
    public $timestamps = true; // Ensure timestamps are enabled

    // Fields allowed for mass assignment
    protected $fillable = [
        'role_name',
        'description',
    ];

    // Relationship: one role has many users
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'role_id', 'role_id');
    }
}
