<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tahunajarans', function (Blueprint $table) {
            $table->id();
            $table->string('tahun'); // e.g. "2024/2025"
            $table->enum('semester', ['ganjil', 'genap']);
            $table->boolean('is_aktif')->default(true);
            $table->unsignedBigInteger('adminjurusan_id');
            $table->foreign('adminjurusan_id')
                ->references('id')->on('users')
                ->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tahunajarans');
    }
};
