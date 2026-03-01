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
        Schema::table('buses', function (Blueprint $table) {
            $table->foreignId('mobile_payment_account_id')->nullable()->constrained('bank_accounts')->nullOnDelete();
            $table->foreignId('transfer_account_id')->nullable()->constrained('bank_accounts')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('buses', function (Blueprint $table) {
            $table->dropForeign(['mobile_payment_account_id']);
            $table->dropForeign(['transfer_account_id']);
            $table->dropColumn(['mobile_payment_account_id', 'transfer_account_id']);
        });
    }
};
