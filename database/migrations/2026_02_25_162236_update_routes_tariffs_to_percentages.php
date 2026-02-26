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
        Schema::table('routes', function (Blueprint $table) {
            $table->boolean('is_student_percentage')->default(false)->after('fare_student');
            $table->boolean('is_senior_percentage')->default(false)->after('fare_senior');
            $table->boolean('is_disabled_percentage')->default(false)->after('fare_disabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('routes', function (Blueprint $table) {
            $table->dropColumn([
                'is_student_percentage',
                'is_senior_percentage',
                'is_disabled_percentage',
            ]);
        });
    }
};
