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
        // Drop the redundant devices table
        Schema::dropIfExists('devices');

        // Make owner_id and plate nullable for auto-registered devices
        Schema::table('buses', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropForeign(['owner_id']);

            // Recreate owner_id as nullable
            $table->foreignId('owner_id')->nullable()->change();

            // Re-add foreign key
            $table->foreign('owner_id')->references('id')->on('users')->nullOnDelete();

            // Make plate nullable with a default
            $table->string('plate')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            $table->dropForeign(['owner_id']);
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete()->change();
            $table->string('plate')->nullable(false)->change();
        });

        // Recreate devices table
        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->string('mac_address')->unique();
            $table->string('name')->nullable();
            $table->foreignId('bus_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }
};
