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
        Schema::create('kurikulums', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->unsignedBigInteger('prodi_id');
            $table->year('tahun_mulai');
            $table->year('tahun_selesai')->nullable();
            $table->integer('total_sks')->nullable();
            $table->boolean('is_aktif')->default(true);
            $table->text('deskripsi')->nullable();
            $table->unsignedBigInteger('adminjurusan_id');
            $table->foreign('adminjurusan_id')
                ->references('id')->on('users')
                ->onDelete('cascade');
            $table->foreign('prodi_id')->references('id')->on('prodis')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kurikulums');
    }
};
