<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bus_driver', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bus_id')->constrained()->cascadeOnDelete();
            $table->foreignId('driver_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['bus_id', 'driver_id']);
        });

        Schema::create('bus_collector', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bus_id')->constrained()->cascadeOnDelete();
            $table->foreignId('collector_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['bus_id', 'collector_id']);
        });

        // Migrate existing driver_id data
        DB::table('buses')->whereNotNull('driver_id')->get()->each(function ($bus) {
            DB::table('bus_driver')->insert([
                'bus_id' => $bus->id,
                'driver_id' => $bus->driver_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        Schema::table('buses', function (Blueprint $table) {
            $table->dropForeign(['driver_id']);
            $table->dropColumn('driver_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            $table->foreignId('driver_id')->nullable()->constrained()->nullOnDelete();
        });

        // Try to restore first driver ID to buses
        DB::table('bus_driver')->orderBy('created_at')->get()->groupBy('bus_id')->each(function ($drivers, $bus_id) {
            DB::table('buses')->where('id', $bus_id)->update(['driver_id' => $drivers->first()->driver_id]);
        });

        Schema::dropIfExists('bus_collector');
        Schema::dropIfExists('bus_driver');
    }
};
