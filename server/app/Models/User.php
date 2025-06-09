<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;
    protected $table = 'tbl_users';
    protected $primaryKey = 'user_id';
    protected $fillable = [
        'profile_picture',
        'first_name',
        'middle_name',
        'last_name',
        'suffix_name',
        'age',
        'gender',
        'contact',
        'address',
        'role_id',
        'email',
        'password',

    ];

    protected $hidden = [
        'password',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id', 'role_id');
    }
}
