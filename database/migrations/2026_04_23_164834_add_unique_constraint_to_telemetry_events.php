<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('telemetry_events', function (Blueprint $table) {
            // Eliminar el índice simple y reemplazarlo por uno único para evitar carreras en concurrencia
            $table->dropIndex(['bus_id', 'event_timestamp']);
            $table->unique(['bus_id', 'event_timestamp'], 'telemetry_events_unique_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('telemetry_events', function (Blueprint $table) {
            $table->dropUnique('telemetry_events_unique_idx');
            $table->index(['bus_id', 'event_timestamp']);
        });
    }
};
