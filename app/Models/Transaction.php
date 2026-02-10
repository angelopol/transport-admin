<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'bus_id',
        'amount',
        'payment_method', // cash, digital
        'passenger_type', // standard, student, elderly, disability
        'transaction_date',
    ];

    public function bus()
    {
        return $this->belongsTo(Bus::class);
    }
}
