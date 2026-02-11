<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Device extends Model
{
    protected $fillable = [
        'mac_address',
        'api_token',
        'is_active',
        'last_seen_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_seen_at' => 'datetime',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($device) {
            if (empty($device->api_token)) {
                $device->api_token = Str::random(64);
            }
        });
    }

    /**
     * Get the bus linked to this device (via device_mac on buses table).
     */
    public function bus()
    {
        return $this->hasOne(Bus::class, 'device_mac', 'mac_address');
    }

    /**
     * Check if device is linked to any bus.
     */
    public function isLinked(): bool
    {
        return $this->bus()->exists();
    }

    /**
     * Check if device is online (seen in last 5 minutes).
     */
    public function isOnline(): bool
    {
        if (!$this->last_seen_at) {
            return false;
        }
        return $this->last_seen_at->diffInMinutes(now()) < 5;
    }
}
