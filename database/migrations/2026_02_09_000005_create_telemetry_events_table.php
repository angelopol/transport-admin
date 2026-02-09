<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('telemetry_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bus_id')->constrained()->cascadeOnDelete();
            $table->timestamp('event_timestamp')->comment('When the event occurred on the device');
            $table->integer('passenger_count')->default(1);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('location_source', 20)->nullable()->comment('gps, serial, ip, none');
            $table->string('event_type', 50)->default('boarding');
            $table->string('face_id')->nullable()->comment('Unique face identifier from FaceTracker');
            $table->timestamp('synced_at')->nullable()->comment('When received by server');
            $table->timestamps();

            $table->index(['bus_id', 'event_timestamp']);
            $table->index(['event_timestamp']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('telemetry_events');
    }
};
