<?php

namespace Database\Factories;

use App\Models\kelas;
use App\Models\Matakuliah;
use App\Models\User;
use App\Models\Dosen;
use App\Models\Prodi;
use App\Models\RuanganGKT;
use App\Models\TahunAjaran;
use App\Models\PenjadwalanRuangan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PenjadwalanRuangan>
 */
class PenjadwalanRuanganFactory extends Factory
{
    protected $model = PenjadwalanRuangan::class;

    public function definition(): array
    {
        return [
            'mahasiswa_id' => User::factory(), // pastikan role-nya "mahasiswa"
            'adminjurusan_id' => User::factory(),
            'prodi_id' => Prodi::factory(),
            'dosen_id' => Dosen::factory(),
            'tahunajaran_id' => TahunAjaran::factory(),
            'kelas_id' => kelas::factory(),
            'hari' => $this->faker->randomElement(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']),
            'jammulai' => '08:00:00',
            'jamselesai' => '10:00:00',
            'ruangan_id' => RuanganGKT::factory(),
            'kodematakuliah' => Matakuliah::factory()->create()->kodematakuliah, // asumsi kolom ini unik
            'kebutuhankelas' => 'LCD, AC',
            'statusjadwal' => 'aktif',
            'statusterkirim' => 'belumterkirim',
            'statuspeminjaman' => 'belumdipinjam',
            'statusuploadvidio' => 'pending',
            'statusdigunakan' => null,
            'statustidakdigunakan' => null,
            'statusdialihkan' => null,
        ];
    }
}