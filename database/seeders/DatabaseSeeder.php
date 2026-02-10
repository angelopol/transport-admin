<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            TransactionSeeder::class,
        ]);
        // Admin
        User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('adminadmin'),
                'role' => 'admin',
                'phone' => '0000000000',
            ]
        );

        // Sample Owner
        $owner = User::firstOrCreate(
            ['email' => 'owner@transport.com'],
            [
                'name' => 'Transportista Demo',
                'password' => bcrypt('password'),
                'role' => 'owner',
                'phone' => '04121234567',
            ]
        );

        // Sample Route
        $route = \App\Models\Route::firstOrCreate(
            ['name' => 'Ruta Centro - Plaza'],
            [
                'origin' => 'Centro',
                'destination' => 'Plaza Bolívar',
                'fare' => 15.00,
            ]
        );

        // Sample Driver
        $driver = \App\Models\Driver::firstOrCreate(
            ['cedula' => 'V-12345678'],
            [
                'name' => 'Juan Pérez',
                'phone' => '04121234567',
                'license_number' => 'LIC-12345',
            ]
        );

        // Sample Bus
        if (!\App\Models\Bus::where('plate', 'ABC1234')->exists()) {
            \App\Models\Bus::create([
                'owner_id' => $owner->id,
                'driver_id' => $driver->id,
                'route_id' => $route->id,
                'plate' => 'ABC1234',
                'device_mac' => 'c8:1f:66:47:a7:77', // Matched with Python test
                'model' => 'Encava E-NT610',
                'capacity' => 32,
                'api_token' => 'test_token_12345',
                'is_active' => true,
            ]);
        }
    }
}
