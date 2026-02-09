<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TelemetryEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'bus_id',
        'event_timestamp',
        'passenger_count',
        'latitude',
        'longitude',
        'location_source',
        'event_type',
        'face_id',
        'synced_at',
    ];

    protected function casts(): array
    {
        return [
            'event_timestamp' => 'datetime',
            'passenger_count' => 'integer',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'synced_at' => 'datetime',
        ];
    }

    /**
     * Get the bus that generated this event.
     */
    public function bus(): BelongsTo
    {
        return $this->belongsTo(Bus::class);
    }

    /**
     * Scope for events within a date range.
     */
    public function scopeInDateRange($query, $start, $end)
    {
        return $query->whereBetween('event_timestamp', [$start, $end]);
    }

    /**
     * Scope for today's events.
     */
    public function scopeToday($query)
    {
        return $query->whereDate('event_timestamp', today());
    }

    /**
     * Scope for events with location.
     */
    public function scopeWithLocation($query)
    {
        return $query->whereNotNull('latitude')->whereNotNull('longitude');
    }

    /**
     * Check if event has valid coordinates.
     */
    public function hasLocation(): bool
    {
        return $this->latitude !== null && $this->longitude !== null;
    }
}
