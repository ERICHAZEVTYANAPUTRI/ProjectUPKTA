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
        Schema::create('pengajuan_kegiatan', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mahasiswa_id');
            $table->unsignedBigInteger('ruangan_id');
            $table->date('tanggal');
            $table->time('jammulai');
            $table->time('jamselesai');
            $table->string('jenis_kegiatan');
            $table->text('keperluan');
            $table->enum('status', ['pending', 'diterima', 'ditolak', 'dipinjam', 'prosespengembalian', 'selesai', 'dibatalkanpengelola'])->default('pending');
            $table->timestamps();
            $table->text('statusuploadvidio')->default('pending');
            $table->foreign('ruangan_id')
                ->references('id')->on('ruangan_g_k_t_s')
                ->onDelete('cascade');
            $table->foreign('mahasiswa_id')
                ->references('id')->on('users')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengajuan_kegiatan');
    }
};
