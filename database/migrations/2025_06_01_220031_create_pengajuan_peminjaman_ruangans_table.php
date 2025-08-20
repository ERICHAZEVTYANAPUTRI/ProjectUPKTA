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
        Schema::create('pengajuan_peminjaman_ruangans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mahasiswa_id');
            $table->unsignedBigInteger('ruangan_id');
            $table->unsignedBigInteger('dosen_id');
            $table->string('kodematakuliah');
            $table->string('hari');
            $table->date('tanggal');
            $table->time('jammulai');
            $table->time('jamselesai');
            $table->text('keperluan');
            $table->foreign('dosen_id')
                ->references('id')->on('dosens')
                ->onDelete('cascade');
            $table->string('status')->default('pending');
            $table->text('statuspeminjaman')->default('pending');
            $table->text('statusuploadvidio')->default('pending');
            $table->timestamps();
            $table->foreign('ruangan_id')
                ->references('id')->on('ruangan_g_k_t_s')
                ->onDelete('cascade');
            $table->foreign('mahasiswa_id')
                ->references('id')->on('users')
                ->onDelete('cascade');
            $table->foreign('kodematakuliah')
                ->references('kodematakuliah')->on('matakuliahs')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengajuan_peminjaman_ruangans');
    }
};
