<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Bus extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'device_mac',
        'plate',
        'model',
        'capacity',
        'route_id',
        'driver_id',
        'api_token',
        'is_active',
        'last_seen_at',
    ];

    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
            'is_active' => 'boolean',
            'last_seen_at' => 'datetime',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Generate API token on create
        static::creating(function ($bus) {
            if (empty($bus->api_token)) {
                $bus->api_token = Str::random(64);
            }
        });
    }

    /**
     * Get the owner of this bus.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get the route assigned to this bus.
     */
    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class);
    }

    /**
     * Get the driver assigned to this bus.
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    /**
     * Get telemetry events for this bus.
     */
    public function telemetryEvents(): HasMany
    {
        return $this->hasMany(TelemetryEvent::class);
    }

    /**
     * Scope for active buses.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for buses owned by a specific user.
     */
    public function scopeOwnedBy($query, $userId)
    {
        return $query->where('owner_id', $userId);
    }

    public function scopeForUser($query, $user)
    {
        if ($user->isAdmin()) {
            return $query;
        }
        return $query->where('owner_id', $user->id);
    }

    /**
     * Check if the bus is online (seen in last 5 minutes).
     */
    public function isOnline(): bool
    {
        if (!$this->last_seen_at) {
            return false;
        }
        return $this->last_seen_at->diffInMinutes(now()) < 5;
    }

    /**
     * Update last seen timestamp.
     */
    public function markAsSeen(): void
    {
        $this->update(['last_seen_at' => now()]);
    }

    /**
     * Get today's passenger count.
     */
    public function getTodayPassengerCount(): int
    {
        return $this->telemetryEvents()
            ->whereDate('event_timestamp', today())
            ->sum('passenger_count');
    }

    /**
     * Regenerate API token.
     */
    public function regenerateToken(): string
    {
        $this->api_token = Str::random(64);
        $this->save();
        return $this->api_token;
    }

    /**
     * Find bus by API token.
     */
    public static function findByToken(string $token): ?self
    {
        return static::where('api_token', $token)->first();
    }
}
