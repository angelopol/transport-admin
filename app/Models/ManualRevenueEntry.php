<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ManualRevenueEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'route_id',
        'amount',
        'user_type',
        'payment_method',
        'registered_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'registered_at' => 'datetime',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class);
    }

    public function scopeForUser($query, $user)
    {
        if ($user->isAdmin()) {
            return $query;
        }
        return $query->where('owner_id', $user->id);
    }
}
