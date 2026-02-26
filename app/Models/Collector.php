<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Storage;

class Collector extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'cedula',
        'phone',
        'photo_path',
        'is_active',
        'owner_id',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

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

    protected $appends = [
        'photo_url',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path
            ? asset('storage/' . $this->photo_path)
            : null;
    }

    /**
     * Get the buses assigned to this collector.
     */
    public function buses(): BelongsToMany
    {
        return $this->belongsToMany(Bus::class);
    }

    /**
     * Scope for active collectors.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
