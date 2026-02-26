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
        Schema::table('users', function (Blueprint $table) {
            // Change enum to string to support 'operative' role without constraints
            $table->string('role')->default('owner')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // In SQLite, reverting back to enum can be tricky, so we'll leave it as string in down()
            // or just define the original string length.
            $table->string('role')->default('owner')->change();
        });
    }
};
