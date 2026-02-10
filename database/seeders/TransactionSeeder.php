<?php

namespace Database\Seeders;

use App\Models\Bus;
use App\Models\Transaction;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $buses = Bus::all();

        if ($buses->isEmpty()) {
            return;
        }

        foreach ($buses as $bus) {
            // Generate 50 transactions for each bus over the last 30 days
            for ($i = 0; $i < 50; $i++) {
                $date = Carbon::now()->subDays(rand(0, 30))->setTime(rand(6, 22), rand(0, 59));

                $passengerType = $this->randomPassengerType();
                $amount = $this->getFareForType($passengerType);

                Transaction::create([
                    'bus_id' => $bus->id,
                    'amount' => $amount,
                    'payment_method' => rand(0, 10) > 8 ? 'digital' : 'cash', // Mostly cash
                    'passenger_type' => $passengerType,
                    'transaction_date' => $date,
                    'created_at' => $date,
                    'updated_at' => $date,
                ]);
            }
        }
    }

    private function randomPassengerType()
    {
        $rand = rand(1, 100);
        if ($rand <= 70)
            return 'standard';
        if ($rand <= 85)
            return 'student';
        if ($rand <= 95)
            return 'elderly';
        return 'disability';
    }

    private function getFareForType($type)
    {
        switch ($type) {
            case 'standard':
                return 15.00;
            case 'student':
                return 5.00; // Subsidized
            case 'elderly':
                return 0.00; // Free or highly subsidized
            case 'disability':
                return 0.00;
            default:
                return 15.00;
        }
    }
}
