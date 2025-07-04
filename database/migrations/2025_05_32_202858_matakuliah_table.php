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
    Schema::create('matakuliahs', function (Blueprint $table) {
        $table->id();
        $table->string('kodematakuliah');
        $table->unique(['kodematakuliah', 'adminjurusan_id']); // composite unique
        $table->string('namamatakuliah');
        $table->unsignedBigInteger('tahunajaran_id'); // ✅ baru
        $table->unsignedBigInteger('kurikulum_id');
        $table->unsignedBigInteger('prodi_id');
        $table->enum('tipe', ['teori', 'praktikum']);
        $table->string('semester');
        $table->integer('sks_total');
        $table->unsignedBigInteger('adminjurusan_id');
        $table->timestamps();


        // Foreign keys
        $table->foreign('tahunajaran_id')->references('id')->on('tahunajarans')->onDelete('cascade'); // ✅ pastikan nama tabel benar
        $table->foreign('adminjurusan_id')->references('id')->on('users')->onDelete('cascade');
        $table->foreign('kurikulum_id')->references('id')->on('kurikulums')->onDelete('cascade');
        $table->foreign('prodi_id')->references('id')->on('prodis')->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matakuliahs');
    }
};