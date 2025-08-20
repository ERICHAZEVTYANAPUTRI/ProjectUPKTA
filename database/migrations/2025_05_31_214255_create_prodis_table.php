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
        Schema::create('prodis', function (Blueprint $table) {
            $table->id();
            $table->string('kodeprodi')->unique();
            $table->string('namaprodi');
            $table->unsignedBigInteger('id_jurusan');
            $table->unsignedBigInteger('adminjurusan_id');
            $table->foreign('id_jurusan')->references('id')->on('jurusans')->onDelete('cascade');
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
        Schema::dropIfExists('prodis');
    }
};
