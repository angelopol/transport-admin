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
        'user_id',
        'route_id',
        'bus_id',
        'amount',
        'user_type',
        'payment_method',
        'registered_at',
        'reference_number',
        'identification',
        'phone_or_account',
        'reference_image_path',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'registered_at' => 'datetime',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function registeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class);
    }

    public function bus(): BelongsTo
    {
        return $this->belongsTo(Bus::class);
    }

    public function scopeForUser($query, $user)
    {
        if ($user->isAdmin()) {
            return $query;
        }
        if ($user->isOperative()) {
            return $query->where('user_id', $user->id);
        }
        return $query->where('owner_id', $user->id);
    }
}
