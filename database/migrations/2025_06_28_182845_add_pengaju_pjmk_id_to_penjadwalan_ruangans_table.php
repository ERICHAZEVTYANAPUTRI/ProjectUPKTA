<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up()
{
    Schema::table('penjadwalan_ruangans', function (Blueprint $table) {
        $table->unsignedBigInteger('pengaju_pjmk_id')->nullable()->after('status_pengajuan_pjmk');
        $table->foreign('pengaju_pjmk_id')->references('id')->on('users')->onDelete('set null');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penjadwalan_ruangans', function (Blueprint $table) {
            //
        });
    }
};