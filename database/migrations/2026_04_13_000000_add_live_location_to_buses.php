<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            $table->decimal('last_latitude', 10, 7)->nullable()->after('last_seen_at');
            $table->decimal('last_longitude', 10, 7)->nullable()->after('last_latitude');
        });
    }

    public function down(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            $table->dropColumn(['last_latitude', 'last_longitude']);
        });
    }
};
