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
        'is_suburban',
        'fare',
        'fare_urban',
        'fare_student',
        'fare_senior',
        'fare_disabled',
        'fare_sunday',
        'is_student_percentage',
        'is_senior_percentage',
        'is_disabled_percentage',
        'is_active',
        'owner_id',
        'official_gazette_path',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function scopeForUser($query, $user)
    {
        if ($user->isAdmin()) {
            return $query;
        }
        return $query->where('owner_id', $user->id);
    }

    protected function casts(): array
    {
        return [
            'is_suburban' => 'boolean',
            'fare' => 'decimal:2',
            'fare_urban' => 'decimal:2',
            'fare_student' => 'decimal:2',
            'fare_senior' => 'decimal:2',
            'fare_disabled' => 'decimal:2',
            'fare_sunday' => 'decimal:2',
            'is_student_percentage' => 'boolean',
            'is_senior_percentage' => 'boolean',
            'is_disabled_percentage' => 'boolean',
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
