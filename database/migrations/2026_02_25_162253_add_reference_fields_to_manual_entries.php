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
        Schema::table('manual_revenue_entries', function (Blueprint $table) {
            // Bus linking
            $table->foreignId('bus_id')->nullable()->constrained()->nullOnDelete()->after('route_id');

            // Reference data for digital payments
            $table->string('reference_image_path')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('identification')->nullable();
            $table->string('phone_or_account')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('manual_revenue_entries', function (Blueprint $table) {
            $table->dropForeign(['bus_id']);
            $table->dropColumn([
                'bus_id',
                'reference_image_path',
                'reference_number',
                'identification',
                'phone_or_account',
            ]);
        });
    }
};
