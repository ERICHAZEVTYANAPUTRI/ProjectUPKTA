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
        Schema::create('penjadwalan_ruangans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mahasiswa_id')->nullable();
            $table->unsignedBigInteger('adminjurusan_id');
            $table->unsignedBigInteger('prodi_id');
            $table->unsignedBigInteger('dosen_id');
            $table->unsignedBigInteger('tahunajaran_id');
            $table->unsignedBigInteger('kelas_id');
            $table->string('hari');
            $table->time('jammulai');
            $table->time('jamselesai');
            $table->unsignedBigInteger('ruangan_id')->nullable();
            $table->string('kodematakuliah');
            $table->string('kebutuhankelas');
            $table->text('statusjadwal')->default('aktif');
            $table->text('statusterkirim')->default('belumterkirim');
            $table->text('statuspeminjaman')->default('belumdipinjam');
            $table->text('statusuploadvidio')->default('pending');
            $table->string('statusdigunakan')->nullable();
            $table->string('statustidakdigunakan')->nullable();
            $table->string('statusdialihkan')->nullable();
            $table->timestamps();
            $table->unique(['ruangan_id', 'hari', 'jammulai', 'jamselesai'], 'unique_ruangan_hari_waktu');
            $table->foreign('ruangan_id')
                ->references('id')->on('ruangan_g_k_t_s')
                ->onDelete('set null');
            $table->foreign('prodi_id')
                ->references('id')->on('prodis')
                ->onDelete('cascade');
            $table->foreign('kelas_id')
                ->references('id')->on('kelas')
                ->onDelete('cascade');
            $table->foreign('dosen_id')
                ->references('id')->on('dosens')
                ->onDelete('cascade');
            $table->foreign('tahunajaran_id')
                ->references('id')->on('tahunajarans')
                ->onDelete('cascade');
            $table->foreign('adminjurusan_id')
                ->references('id')->on('users')
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
        Schema::dropIfExists('penjadwalan_ruangans');
    }
};
