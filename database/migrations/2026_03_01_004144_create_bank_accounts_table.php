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
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('bank_name');
            $table->string('account_number')->nullable();
            $table->string('account_type')->nullable(); // e.g., Ahorro, Corriente
            $table->string('owner_name');
            $table->string('identification_document'); // RIF/Cédula
            $table->string('phone_number')->nullable();
            $table->boolean('is_mobile_payment_active')->default(true);
            $table->boolean('is_transfer_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');
    }
};
