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
        Schema::create('ruangan_g_k_t_s', function (Blueprint $table) {
            $table->id();
            $table->string('gambar');
            $table->string('name');
            $table->string('gedung');
            $table->string('lantai');
            $table->string('kapasitas');
            $table->string('jeniskelas');
            $table->string('modelkelas');
            $table->string('saranakelas');
            $table->text('statusruangan')->default('kosong');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ruangan_g_k_t_s');
    }
};