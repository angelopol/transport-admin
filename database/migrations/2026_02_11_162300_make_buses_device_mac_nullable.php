<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Make device_mac nullable on buses since devices are now 
     * separate entities and a bus may not have a device linked yet.
     */
    public function up(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            $table->string('device_mac')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            $table->string('device_mac')->nullable(false)->change();
        });
    }
};
