<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
{
    protected $fillable = [
        'owner_id',
        'bank_name',
        'account_number',
        'account_type',
        'owner_name',
        'identification_document',
        'phone_number',
        'is_mobile_payment_active',
        'is_transfer_active',
    ];

    protected function casts(): array
    {
        return [
            'is_mobile_payment_active' => 'boolean',
            'is_transfer_active' => 'boolean',
        ];
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function scopeActiveMobilePayment($query)
    {
        return $query->where('is_mobile_payment_active', true);
    }

    public function scopeActiveTransfer($query)
    {
        return $query->where('is_transfer_active', true);
    }

    public function scopeForUser($query, $user)
    {
        if ($user->isAdmin()) {
            return $query;
        }
        return $query->where('owner_id', $user->id);
    }
}
