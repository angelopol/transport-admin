<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('routes', function (Blueprint $table) {
            $table->decimal('fare_student', 8, 2)->default(0)->after('fare');
            $table->decimal('fare_senior', 8, 2)->default(0)->after('fare_student');
            $table->decimal('fare_disabled', 8, 2)->default(0)->after('fare_senior');
            $table->decimal('fare_sunday', 8, 2)->default(0)->after('fare_disabled');
        });

        Schema::create('manual_revenue_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('route_id')->constrained('routes')->cascadeOnDelete();
            $table->decimal('amount', 8, 2);
            $table->enum('user_type', ['general', 'student', 'senior', 'disabled']);
            $table->enum('payment_method', ['cash', 'digital']);
            $table->timestamp('registered_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('manual_revenue_entries');
        Schema::table('routes', function (Blueprint $table) {
            $table->dropColumn(['fare_student', 'fare_senior', 'fare_disabled', 'fare_sunday']);
        });
    }
};
