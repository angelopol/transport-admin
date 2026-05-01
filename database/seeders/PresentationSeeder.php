<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Route;
use App\Models\Bus;
use App\Models\Driver;
use App\Models\Collector;
use App\Models\Device;
use App\Models\BankAccount;
use App\Models\ManualRevenueEntry;
use App\Models\TelemetryEvent;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

class PresentationSeeder extends Seeder
{
    // Coordenadas de Caracas (zona Petare–Plaza Venezuela)
    private array $zones = [
        ['lat' => 10.4806,  'lon' => -66.9036, 'name' => 'Petare'],
        ['lat' => 10.4973,  'lon' => -66.8965, 'name' => 'La California'],
        ['lat' => 10.5009,  'lon' => -66.9135, 'name' => 'Chacaíto'],
        ['lat' => 10.4921,  'lon' => -66.9182, 'name' => 'Altamira'],
        ['lat' => 10.4884,  'lon' => -66.8799, 'name' => 'Palo Verde'],
        ['lat' => 10.4814,  'lon' => -66.9333, 'name' => 'El Silencio'],
        ['lat' => 10.4744,  'lon' => -66.8897, 'name' => 'Guarenas'],
        ['lat' => 10.4993,  'lon' => -66.8711, 'name' => 'Los Dos Caminos'],
    ];

    public function run(): void
    {
        DB::statement('PRAGMA foreign_keys = OFF;');

        // ──────────────────────────────────────
        // 1. OWNER (empresa de transporte)
        // ──────────────────────────────────────
        $owner = User::firstOrCreate(
            ['email' => 'owner@owner.com'],
            [
                'name'         => 'Owner Demo',
                'password'     => bcrypt('ownerowner'),
                'role'         => 'owner',
                'phone'        => '04141234567',
                'company_name' => 'Transporte SIMCI C.A.',
                'rif'          => 'J-12345678-9',
            ]
        );

        $owner2 = User::firstOrCreate(
            ['email' => 'empresa2@demo.com'],
            [
                'name'         => 'Línea Caracas',
                'password'     => bcrypt('password'),
                'role'         => 'owner',
                'phone'        => '04169876543',
                'company_name' => 'Línea Caracas Express C.A.',
                'rif'          => 'J-98765432-1',
            ]
        );

        // ──────────────────────────────────────
        // 2. USUARIOS OPERATIVOS (conductores/colectores)
        // ──────────────────────────────────────
        $operativeUsers = [];
        $operativeNames = [
            ['Carlos Martínez', 'cmartinez@simci.com', '04141000001'],
            ['José Rodríguez',  'jrodriguez@simci.com', '04241000002'],
            ['Luis González',   'lgonzalez@simci.com', '04141000003'],
            ['Pedro Flores',    'pflores@simci.com', '04261000004'],
            ['Miguel Torres',   'mtorres@simci.com', '04141000005'],
            ['Ana Díaz',        'adiaz@simci.com', '04141000006'],
        ];
        foreach ($operativeNames as $on) {
            $operativeUsers[] = User::firstOrCreate(
                ['email' => $on[1]],
                [
                    'name'     => $on[0],
                    'password' => bcrypt('password'),
                    'role'     => 'operative',
                    'phone'    => $on[2],
                ]
            );
        }

        // ──────────────────────────────────────
        // 3. RUTAS
        // ──────────────────────────────────────
        $routesData = [
            [
                'name' => 'Petare – Plaza Venezuela',
                'origin' => 'Petare', 'destination' => 'Plaza Venezuela',
                'fare' => 8.00, 'fare_student' => 50, 'fare_senior' => 4.00,
                'fare_disabled' => 0, 'fare_sunday' => 10.00,
                'is_student_percentage' => true, 'is_senior_percentage' => false,
                'is_disabled_percentage' => false,
                'is_suburban' => false, 'owner_id' => $owner->id,
            ],
            [
                'name' => 'Los Dos Caminos – El Silencio',
                'origin' => 'Los Dos Caminos', 'destination' => 'El Silencio',
                'fare' => 7.00, 'fare_student' => 50, 'fare_senior' => 3.50,
                'fare_disabled' => 0, 'fare_sunday' => 9.00,
                'is_student_percentage' => true, 'is_senior_percentage' => false,
                'is_disabled_percentage' => false,
                'is_suburban' => false, 'owner_id' => $owner->id,
            ],
            [
                'name' => 'Guarenas – Chacaíto (Suburbana)',
                'origin' => 'Guarenas', 'destination' => 'Chacaíto',
                'fare' => 15.00, 'fare_urban' => 8.00,
                'fare_student' => 50, 'fare_senior' => 7.50,
                'fare_disabled' => 0, 'fare_sunday' => 18.00,
                'is_student_percentage' => true, 'is_senior_percentage' => false,
                'is_disabled_percentage' => false,
                'is_suburban' => true, 'owner_id' => $owner->id,
            ],
            [
                'name' => 'Altamira – Palo Verde',
                'origin' => 'Altamira', 'destination' => 'Palo Verde',
                'fare' => 6.00, 'fare_student' => 50, 'fare_senior' => 3.00,
                'fare_disabled' => 0, 'fare_sunday' => 8.00,
                'is_student_percentage' => true, 'is_senior_percentage' => false,
                'is_disabled_percentage' => false,
                'is_suburban' => false, 'owner_id' => $owner2->id,
            ],
        ];

        $routes = [];
        foreach ($routesData as $rd) {
            $routes[] = Route::firstOrCreate(
                ['name' => $rd['name'], 'owner_id' => $rd['owner_id']],
                $rd
            );
        }

        // ──────────────────────────────────────
        // 4. CUENTAS BANCARIAS
        // ──────────────────────────────────────
        $bankAcc1 = BankAccount::firstOrCreate(
            ['owner_id' => $owner->id, 'bank_name' => 'Banesco'],
            [
                'account_number'         => '0134-0001-12-0011234567',
                'account_type'           => 'Ahorro',
                'owner_name'             => 'Transporte SIMCI C.A.',
                'identification_document'=> 'J-12345678-9',
                'phone_number'           => '04141234567',
                'is_mobile_payment_active' => true,
                'is_transfer_active'     => true,
            ]
        );
        $bankAcc2 = BankAccount::firstOrCreate(
            ['owner_id' => $owner->id, 'bank_name' => 'Mercantil'],
            [
                'account_number'         => '0105-0002-51-1051234567',
                'account_type'           => 'Corriente',
                'owner_name'             => 'Transporte SIMCI C.A.',
                'identification_document'=> 'J-12345678-9',
                'phone_number'           => '04169990001',
                'is_mobile_payment_active' => false,
                'is_transfer_active'     => true,
            ]
        );

        // ──────────────────────────────────────
        // 5. DISPOSITIVOS
        // ──────────────────────────────────────
        $deviceMacs = ['AA:BB:CC:DD:EE:01', 'AA:BB:CC:DD:EE:02', 'AA:BB:CC:DD:EE:03',
                       'AA:BB:CC:DD:EE:04', 'AA:BB:CC:DD:EE:05', 'AA:BB:CC:DD:EE:06'];
        $devices = [];
        foreach ($deviceMacs as $mac) {
            $devices[] = Device::firstOrCreate(
                ['mac_address' => $mac],
                ['api_token' => Str::random(64), 'owner_id' => $owner->id, 'is_active' => true]
            );
        }

        // ──────────────────────────────────────
        // 6. AUTOBUSES
        // ──────────────────────────────────────
        $busesData = [
            ['plate' => 'AB123CD', 'model' => 'Encava ENT-610', 'capacity' => 45, 'route' => $routes[0], 'mac' => $deviceMacs[0]],
            ['plate' => 'EF456GH', 'model' => 'Encava ENT-710', 'capacity' => 50, 'route' => $routes[0], 'mac' => $deviceMacs[1]],
            ['plate' => 'IJ789KL', 'model' => 'Yutong ZK6128',  'capacity' => 55, 'route' => $routes[1], 'mac' => $deviceMacs[2]],
            ['plate' => 'MN012OP', 'model' => 'Encava ENT-610', 'capacity' => 45, 'route' => $routes[1], 'mac' => $deviceMacs[3]],
            ['plate' => 'QR345ST', 'model' => 'Higer KLQ6109',  'capacity' => 50, 'route' => $routes[2], 'mac' => $deviceMacs[4]],
            ['plate' => 'UV678WX', 'model' => 'Yutong ZK6128',  'capacity' => 55, 'route' => $routes[3], 'mac' => $deviceMacs[5]],
        ];

        $buses = [];
        foreach ($busesData as $i => $bd) {
            $bus = Bus::firstOrCreate(
                ['plate' => $bd['plate']],
                [
                    'owner_id'                 => $owner->id,
                    'device_mac'               => $bd['mac'],
                    'model'                    => $bd['model'],
                    'capacity'                 => $bd['capacity'],
                    'route_id'                 => $bd['route']->id,
                    'mobile_payment_account_id'=> $bankAcc1->id,
                    'transfer_account_id'      => $bankAcc2->id,
                    'is_active'                => true,
                    'last_seen_at'             => now()->subMinutes(rand(2, 90)),
                    'last_latitude'            => $this->zones[$i % count($this->zones)]['lat'] + (rand(-50, 50) / 10000),
                    'last_longitude'           => $this->zones[$i % count($this->zones)]['lon'] + (rand(-50, 50) / 10000),
                    'api_token'                => Str::random(64),
                ]
            );
            $buses[] = $bus;
        }

        // ──────────────────────────────────────
        // 7. CONDUCTORES Y COLECTORES
        // ──────────────────────────────────────
        $driverNames = [
            [$operativeUsers[0], 'V-10234567'],
            [$operativeUsers[1], 'V-15678901'],
            [$operativeUsers[2], 'V-18345678'],
        ];
        $drivers = [];
        foreach ($driverNames as $i => $dn) {
            $driver = Driver::firstOrCreate(
                ['user_id' => $dn[0]->id],
                [
                    'name'           => $dn[0]->name,
                    'cedula'         => $dn[1],
                    'license_number' => 'LC-' . str_pad($i + 1, 5, '0', STR_PAD_LEFT),
                    'phone'          => $dn[0]->phone,
                    'owner_id'       => $owner->id,
                ]
            );
            // Asignar bus
            if (isset($buses[$i])) {
                $buses[$i]->drivers()->syncWithoutDetaching([$driver->id]);
            }
            $drivers[] = $driver;
        }

        $collectorNames = [
            [$operativeUsers[3], 'V-20111222'],
            [$operativeUsers[4], 'V-22333444'],
            [$operativeUsers[5], 'V-25555666'],
        ];
        $collectors = [];
        foreach ($collectorNames as $i => $cn) {
            $collector = Collector::firstOrCreate(
                ['user_id' => $cn[0]->id],
                [
                    'name'     => $cn[0]->name,
                    'cedula'   => $cn[1],
                    'phone'    => $cn[0]->phone,
                    'owner_id' => $owner->id,
                ]
            );
            if (isset($buses[$i])) {
                $buses[$i]->collectors()->syncWithoutDetaching([$collector->id]);
            }
            $collectors[] = $collector;
        }

        // ──────────────────────────────────────
        // 7.5 AUDITORÍA (Logs de Configuración Inicial)
        // ──────────────────────────────────────
        $auditLogs = [];
        $nowTs = Carbon::now()->format('Y-m-d H:i:s');

        $auditLogs[] = [
            'user_id' => $owner->id,
            'action' => 'Cuenta Principal Creada',
            'details' => json_encode(['company' => $owner->company_name]),
            'ip_address' => '127.0.0.1',
            'created_at' => $nowTs,
            'updated_at' => $nowTs,
        ];

        foreach ($operativeUsers as $op) {
            $auditLogs[] = [
                'user_id' => $owner->id,
                'action' => 'Usuario Operativo Registrado',
                'details' => json_encode(['email' => $op->email, 'role' => 'operative']),
                'ip_address' => '127.0.0.1',
                'created_at' => $nowTs, 'updated_at' => $nowTs,
            ];
        }

        foreach ($routes as $route) {
            $auditLogs[] = [
                'user_id' => $route->owner_id,
                'action' => 'Ruta Configurada',
                'details' => json_encode(['name' => $route->name, 'fare' => $route->fare]),
                'ip_address' => '127.0.0.1',
                'created_at' => $nowTs, 'updated_at' => $nowTs,
            ];
        }

        foreach ([$bankAcc1, $bankAcc2] as $acc) {
            $auditLogs[] = [
                'user_id' => $acc->owner_id,
                'action' => 'Cuenta Bancaria Registrada',
                'details' => json_encode(['bank' => $acc->bank_name, 'type' => $acc->account_type]),
                'ip_address' => '127.0.0.1',
                'created_at' => $nowTs, 'updated_at' => $nowTs,
            ];
        }

        foreach ($devices as $device) {
            $auditLogs[] = [
                'user_id' => $device->owner_id,
                'action' => 'Dispositivo IoT Vinculado',
                'details' => json_encode(['mac' => $device->mac_address]),
                'ip_address' => '127.0.0.1',
                'created_at' => $nowTs, 'updated_at' => $nowTs,
            ];
        }

        foreach ($buses as $bus) {
            $auditLogs[] = [
                'user_id' => $bus->owner_id,
                'action' => 'Autobús Registrado',
                'details' => json_encode(['plate' => $bus->plate, 'model' => $bus->model]),
                'ip_address' => '127.0.0.1',
                'created_at' => $nowTs, 'updated_at' => $nowTs,
            ];
        }

        foreach ($drivers as $driver) {
            $auditLogs[] = [
                'user_id' => $driver->owner_id,
                'action' => 'Conductor Contratado',
                'details' => json_encode(['name' => $driver->name, 'cedula' => $driver->cedula]),
                'ip_address' => '127.0.0.1',
                'created_at' => $nowTs, 'updated_at' => $nowTs,
            ];
        }

        foreach ($collectors as $collector) {
            $auditLogs[] = [
                'user_id' => $collector->owner_id,
                'action' => 'Colector Contratado',
                'details' => json_encode(['name' => $collector->name, 'cedula' => $collector->cedula]),
                'ip_address' => '127.0.0.1',
                'created_at' => $nowTs, 'updated_at' => $nowTs,
            ];
        }

        DB::table('audit_logs')->insert($auditLogs);


        // ──────────────────────────────────────
        // 8. EVENTOS DE TELEMETRÍA (últimos 30 días)
        // ──────────────────────────────────────
        $this->seedTelemetry($buses);

        // ──────────────────────────────────────
        // 9. INGRESOS MANUALES (últimos 30 días)
        // ──────────────────────────────────────
        $this->seedManualEntries($buses, $routes, $owner, $operativeUsers);

        DB::statement('PRAGMA foreign_keys = ON;');

        $this->command->info('✅ PresentationSeeder completado con éxito.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    private function seedTelemetry(array $buses): void
    {
        // Evitar duplicados: obtenemos timestamps existentes por bus
        $existing = DB::table('telemetry_events')
            ->select('bus_id', 'event_timestamp')
            ->get()
            ->groupBy('bus_id')
            ->map(fn ($g) => $g->pluck('event_timestamp')->flip());

        $rows = [];
        $now  = Carbon::now();

        foreach ($buses as $bus) {
            $busExisting = $existing->get($bus->id, collect());
            $zone = $this->zones[$bus->id % count($this->zones)];

            // Generar datos para los últimos 30 días
            for ($dayOffset = 30; $dayOffset >= 0; $dayOffset--) {
                $day = $now->copy()->subDays($dayOffset)->startOfDay();

                // Saltar domingos aleatoriamente (30% chance de no operar)
                if ($day->isSunday() && rand(0, 9) < 3) continue;

                // 2 sesiones por día (mañana y tarde)
                $sessions = [
                    ['start' => 6,  'end' => 12, 'peak_start' => 7,  'peak_end' => 9],
                    ['start' => 13, 'end' => 19, 'peak_start' => 16, 'peak_end' => 18],
                ];

                foreach ($sessions as $session) {
                    $sessionStart = $day->copy()->setHour($session['start'])->setMinute(rand(0, 30));
                    $sessionEnd   = $day->copy()->setHour($session['end'])->setMinute(rand(0, 30));
                    $current      = $sessionStart->copy();

                    while ($current->lt($sessionEnd)) {
                        // Hora pico → más eventos
                        $inPeak = $current->hour >= $session['peak_start']
                               && $current->hour <  $session['peak_end'];
                        $intervalMin = $inPeak ? rand(1, 4) : rand(3, 12);
                        $current->addMinutes($intervalMin);

                        if ($current->gt($sessionEnd)) break;

                        $ts = $current->format('Y-m-d H:i:s');
                        if ($busExisting->has($ts)) continue;

                        // Generar un patrón de circuito (Lissajous) basado en la hora para simular una ruta
                        $cycleDuration = 5400; // 90 min por ciclo completo
                        $progress = ($current->timestamp % $cycleDuration) / $cycleDuration;
                        $angle = $progress * 2 * pi();
                        
                        // Radios del recorrido (aprox 600m - 800m) y un ruido leve para evitar líneas superpuestas perfectas
                        $lat = $zone['lat'] + (0.006 * sin($angle)) + (rand(-50, 50) / 100000);
                        $lon = $zone['lon'] + (0.008 * sin(2 * $angle)) + (rand(-50, 50) / 100000);

                        $rows[] = [
                            'bus_id'          => $bus->id,
                            'event_timestamp' => $ts,
                            'passenger_count' => $inPeak ? rand(2, 6) : rand(1, 3),
                            'latitude'        => round($lat, 7),
                            'longitude'       => round($lon, 7),
                            'location_source' => 'gps',
                            'event_type'      => 'boarding',
                            'synced_at'       => $ts,
                            'created_at'      => $ts,
                            'updated_at'      => $ts,
                        ];

                        // Chunks de 500
                        if (count($rows) >= 500) {
                            DB::table('telemetry_events')->insertOrIgnore($rows);
                            $rows = [];
                        }
                    }

                    // Heartbeat al inicio de cada sesión
                    $hbTs = $sessionStart->format('Y-m-d H:i:s');
                    if (!$busExisting->has($hbTs)) {
                        $hbProgress = ($sessionStart->timestamp % 5400) / 5400;
                        $hbAngle = $hbProgress * 2 * pi();
                        $rows[] = [
                            'bus_id'          => $bus->id,
                            'event_timestamp' => $hbTs,
                            'passenger_count' => 0,
                            'latitude'        => round($zone['lat'] + (0.006 * sin($hbAngle)), 7),
                            'longitude'       => round($zone['lon'] + (0.008 * sin(2 * $hbAngle)), 7),
                            'location_source' => 'gps',
                            'event_type'      => 'heartbeat',
                            'synced_at'       => $hbTs,
                            'created_at'      => $hbTs,
                            'updated_at'      => $hbTs,
                        ];
                    }
                }
            }
        }

        if (!empty($rows)) {
            DB::table('telemetry_events')->insertOrIgnore($rows);
        }

        // Actualizar last_seen_at de cada bus al evento más reciente
        foreach ($buses as $bus) {
            $latest = DB::table('telemetry_events')
                ->where('bus_id', $bus->id)
                ->orderBy('event_timestamp', 'desc')
                ->first();
            if ($latest) {
                $bus->update([
                    'last_seen_at'    => $latest->event_timestamp,
                    'last_latitude'   => $latest->latitude,
                    'last_longitude'  => $latest->longitude,
                ]);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    private function seedManualEntries(array $buses, array $routes, User $owner, array $operativeUsers): void
    {
        $userTypes      = ['general', 'general', 'general', 'student', 'senior', 'disabled'];
        $paymentMethods = ['cash', 'cash', 'digital'];
        $now            = Carbon::now();
        $rows           = [];

        foreach ($buses as $bus) {
            $route = collect($routes)->firstWhere('id', $bus->route_id);
            if (!$route) continue;

            for ($dayOffset = 30; $dayOffset >= 0; $dayOffset--) {
                $day = $now->copy()->subDays($dayOffset)->startOfDay();
                if ($day->isSunday() && rand(0, 9) < 4) continue;

                // Entre 20 y 60 ingresos por bus por día
                $entriesPerDay = rand(20, 60);
                for ($e = 0; $e < $entriesPerDay; $e++) {
                    $hour   = rand(6, 19);
                    $minute = rand(0, 59);
                    $regAt  = $day->copy()->setHour($hour)->setMinute($minute)->setSecond(rand(0, 59));

                    $userType      = $userTypes[array_rand($userTypes)];
                    $paymentMethod = $paymentMethods[array_rand($paymentMethods)];

                    // Calcular monto según tarifas
                    $isSunday = $day->isSunday();
                    $baseFare = $isSunday && $route->fare_sunday > 0 ? $route->fare_sunday : $route->fare;

                    $amount = match ($userType) {
                        'student'  => $route->is_student_percentage
                            ? $baseFare - ($baseFare * ($route->fare_student / 100))
                            : ($route->fare_student > 0 ? $route->fare_student : $baseFare),
                        'senior'   => $route->is_senior_percentage
                            ? $baseFare - ($baseFare * ($route->fare_senior / 100))
                            : ($route->fare_senior > 0 ? $route->fare_senior : $baseFare),
                        'disabled' => $route->fare_disabled > 0 ? $route->fare_disabled : 0,
                        default    => $baseFare,
                    };
                    $amount = max(0, round($amount, 2));

                    // Quién registró: 70% operative, 30% owner
                    $registeredBy = rand(0, 9) < 7
                        ? $operativeUsers[array_rand($operativeUsers)]
                        : $owner;

                    $row = [
                        'owner_id'         => $owner->id,
                        'user_id'          => $registeredBy->id,
                        'route_id'         => $route->id,
                        'bus_id'           => $bus->id,
                        'amount'           => $amount,
                        'user_type'        => $userType,
                        'payment_method'   => $paymentMethod,
                        'registered_at'    => $regAt->format('Y-m-d H:i:s'),
                        'reference_number' => $paymentMethod === 'digital' ? strtoupper(Str::random(8)) : null,
                        'created_at'       => $regAt->format('Y-m-d H:i:s'),
                        'updated_at'       => $regAt->format('Y-m-d H:i:s'),
                    ];

                    $rows[] = $row;

                    if (count($rows) >= 500) {
                        DB::table('manual_revenue_entries')->insert($rows);
                        $rows = [];
                    }
                }
            }
        }

        if (!empty($rows)) {
            DB::table('manual_revenue_entries')->insert($rows);
        }
    }
}
