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
        Schema::create('peminjamanselesaisesuaijdwals', function (Blueprint $table) {
            $table->id();

            // Relasi pengguna & entitas lainnya
            $table->unsignedBigInteger('mahasiswa_id');
            $table->unsignedBigInteger('adminjurusan_id');
            $table->unsignedBigInteger('prodi_id');
            $table->unsignedBigInteger('tahunajaran_id');
            $table->unsignedBigInteger('dosen_id');
            $table->unsignedBigInteger('ruangan_id');
            $table->unsignedBigInteger('kelas_id');

            // Informasi jadwal & ruangan
            $table->string('hari');
            $table->time('jammulai');
            $table->time('jamselesai');
            $table->string('kodematakuliah');
            $table->string('kebutuhankelas');

            // Status-status peminjaman saat selesai
            $table->string('statusuploadvidio')->nullable();  // ex: pending, diverifikasi
            $table->string('statusjadwal')->nullable();       // ex: aktif
            $table->string('statusterkirim')->nullable();     // ex: terkirim, belumterkirim
            $table->string('statuspeminjaman')->nullable();   // ex: selesai
            $table->string('statusdigunakan')->nullable();
            $table->string('statustidakdigunakan')->nullable();
            $table->string('statusdialihkan')->nullable();

            $table->timestamp('waktu_pengembalian')->nullable(); // waktu pengembalian disetujui

            $table->timestamps();

            // Foreign keys
            $table->foreign('kelas_id')->references('id')->on('kelas')->onDelete('cascade');
            $table->foreign('dosen_id')->references('id')->on('dosens')->onDelete('cascade');
            $table->foreign('ruangan_id')->references('id')->on('ruangan_g_k_t_s')->onDelete('cascade');
            $table->foreign('mahasiswa_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('adminjurusan_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('prodi_id')->references('id')->on('prodis')->onDelete('cascade');
            $table->foreign('tahunajaran_id')->references('id')->on('tahunajarans')->onDelete('cascade');
            $table->foreign('kodematakuliah')->references('kodematakuliah')->on('matakuliahs')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peminjamanselesaisesuaijdwals');
    }
};