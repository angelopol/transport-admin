<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Route extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'origin',
        'destination',
        'fare',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'fare' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the buses assigned to this route.
     */
    public function buses(): HasMany
    {
        return $this->hasMany(Bus::class);
    }

    /**
     * Scope for active routes.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
