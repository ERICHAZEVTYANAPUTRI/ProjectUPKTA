<?php

namespace Database\Factories;

use App\Models\Matakuliah;
use App\Models\PengajuanPeminjamanRuangan;
use App\Models\RuanganGKT;
use App\Models\User;
use App\Models\Dosen;
use Illuminate\Database\Eloquent\Factories\Factory;

class PengajuanPeminjamanRuanganFactory extends Factory
{
    protected $model = PengajuanPeminjamanRuangan::class;

    public function definition(): array
    {
        return [
            'mahasiswa_id' => User::factory()->create(['role' => 'mahasiswa'])->id,
            'ruangan_id' => RuanganGKT::factory(),
            'dosen_id' => Dosen::factory(),
            'kodematakuliah' => Matakuliah::factory()->create()->kodematakuliah, // asumsi kolom ini unik
            'hari' => 'Selasa',
            'tanggal' => now()->format('Y-m-d'),
            'jammulai' => '08:00:00',
            'jamselesai' => '10:00:00',
            'keperluan' => 'Presentasi',
            'status' => 'diterima',
            'statuspeminjaman' => 'pending',
            'statusuploadvidio' => 'pending',
        ];
    }
}