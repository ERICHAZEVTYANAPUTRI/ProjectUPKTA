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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('foto')->nullable();
            $table->string('username');
            $table->string('nama_lengkap')->nullable();
            $table->string('nim')->nullable();
            $table->integer('smester')->nullable();
            $table->string('jabatan')->nullable();
            $table->string('nip_nik_nipppk')->nullable();
            $table->string('kodejurusan')->nullable();
            $table->string('jurusan')->nullable();
            $table->unsignedBigInteger('prodi_id')->nullable();
            $table->unsignedBigInteger('jurusanmahasiswa_id')->nullable();
            $table->unsignedBigInteger('kelas_id')->nullable();
            $table->string('notlp')->nullable();
            $table->string('password');
            $table->enum('role', ['mahasiswa', 'admin_jurusan', 'pengelola_gkt', 'admin_pengelola_gkt']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};