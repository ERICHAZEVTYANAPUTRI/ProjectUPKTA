<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Dosen;
use App\Models\Matakuliah;
use App\Models\RuanganGKT;
use App\Models\PenjadwalanRuangan;
use App\Models\PengajuanPeminjamanRuangan;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PengajuanPeminjamanRuanganTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function mahasiswa_dapat_mengajukan_peminjaman_ruangan_dengan_data_valid_dan_lengkap()
    {
        $mahasiswa = User::factory()->mahasiswa()->create();
        $dosen = Dosen::factory()->create();
        $matakuliah = Matakuliah::factory()->create();
        $ruangan = RuanganGKT::factory()->create();

        $this->actingAs($mahasiswa);

        $response = $this->postJson('/api/pengajuan-peminjaman', [
            'ruangan_id' => $ruangan->id,
            'dosen_id' => $dosen->id,
            'kodematakuliah' => $matakuliah->kodematakuliah,
            'hari' => 'Senin',
            'tanggal' => now()->toDateString(),
            'jammulai' => '08:00',
            'jamselesai' => '10:00',
            'keperluan' => 'Ujian Tengah Semester'
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'message' => 'Pengajuan berhasil dikirim',
        ]);

        $this->assertDatabaseHas('pengajuan_peminjaman_ruangans', [
            'mahasiswa_id' => $mahasiswa->id,
            'ruangan_id' => $ruangan->id,
            'dosen_id' => $dosen->id,
            'kodematakuliah' => $matakuliah->kodematakuliah,
            'keperluan' => 'Ujian Tengah Semester',
        ]);
    }

    /** @test */
    public function pengajuan_gagal_jika_field_wajib_tidak_diisi()
    {
        $mahasiswa = User::factory()->mahasiswa()->create();
        $this->actingAs($mahasiswa);

        $response = $this->postJson('/api/pengajuan-peminjaman', []);

        $response->assertStatus(422);
        $response->assertJsonStructure([
            'message',
            'errors' => [
                'ruangan_id',
                'dosen_id',
                'kodematakuliah',
                'hari',
                'tanggal',
                'jammulai',
                'jamselesai',
                'keperluan',
            ],
        ]);
    }
    /** @test */
public function pengajuan_gagal_jika_ruangan_dalam_status_diperbaiki()
{
    $mahasiswa = User::factory()->mahasiswa()->create();
    $dosen = Dosen::factory()->create();
    $matakuliah = Matakuliah::factory()->create();
    $ruangan = RuanganGKT::factory()->create(['statusruangan' => 'diperbaiki']);

    $this->actingAs($mahasiswa);

    $response = $this->postJson('/api/pengajuan-peminjaman', [
        'ruangan_id' => $ruangan->id,
        'dosen_id' => $dosen->id,
        'kodematakuliah' => $matakuliah->kodematakuliah,
        'hari' => 'Selasa',
        'tanggal' => now()->toDateString(),
        'jammulai' => '08:00',
        'jamselesai' => '10:00',
        'keperluan' => 'Sidang'
    ]);

    $response->assertStatus(400);
    $response->assertJson([
        'message' => 'Ruangan sedang diperbaiki, tidak dapat dipinjam.'
    ]);
}

/** @test */
public function pengajuan_gagal_jika_ruangan_sedang_dipinjam()
{
    $mahasiswa = User::factory()->mahasiswa()->create();
    $dosen = Dosen::factory()->create();
    $matakuliah = Matakuliah::factory()->create();
    $ruangan = RuanganGKT::factory()->create(['statusruangan' => 'dipinjam']);

    $this->actingAs($mahasiswa);

    $response = $this->postJson('/api/pengajuan-peminjaman', [
        'ruangan_id' => $ruangan->id,
        'dosen_id' => $dosen->id,
        'kodematakuliah' => $matakuliah->kodematakuliah,
        'hari' => 'Rabu',
        'tanggal' => now()->toDateString(),
        'jammulai' => '09:00',
        'jamselesai' => '11:00',
        'keperluan' => 'Ujian'
    ]);

    $response->assertStatus(400);
    $response->assertJson([
        'message' => 'Ruangan sedang dipinjam, tidak dapat dipinjam.'
    ]);
}
/** @test */
public function pengajuan_gagal_jika_bentrok_dengan_penjadwalan_ruangan()
{
    $mahasiswa = User::factory()->mahasiswa()->create();
    $dosen = Dosen::factory()->create();
    $matakuliah = Matakuliah::factory()->create();
    $ruangan = RuanganGKT::factory()->create();

    // Buat penjadwalan ruangan yang bentrok
PenjadwalanRuangan::factory()->create([
    'ruangan_id' => $ruangan->id,
    'hari' => 'Selasa',
    'jammulai' => '08:00:00',
    'jamselesai' => '10:00:00',
    'statusjadwal' => 'aktif',
]);

    $this->actingAs($mahasiswa);

    $response = $this->postJson('/api/pengajuan-peminjaman', [
        'ruangan_id' => $ruangan->id,
        'dosen_id' => $dosen->id,
        'kodematakuliah' => $matakuliah->kodematakuliah,
        'hari' => 'Selasa',
        'tanggal' => now()->toDateString(),
        'jammulai' => '09:00:00',
        'jamselesai' => '11:00:00',
        'keperluan' => 'Ujian'
    ]);

    $response->assertStatus(400);
    $response->assertJson([
    'message' => 'Hari dan jam yang anda ajukan bentrok dengan jadwal kuliah tetap dengan kelas lain, mohon pilih ruangan lain untuk dipinjam.'
    ]);
}
    /** @test */
    public function pengajuan_gagal_jika_bentrok_dengan_pengajuan_lain()
    {
        $mahasiswa = User::factory()->mahasiswa()->create();
        $dosen = Dosen::factory()->create();
        $matakuliah = Matakuliah::factory()->create();
        $ruangan = RuanganGKT::factory()->create();

        PengajuanPeminjamanRuangan::factory()->create([
            'ruangan_id' => $ruangan->id,
            'tanggal' => now()->toDateString(),
            'jammulai' => '08:00:00',
            'jamselesai' => '10:00:00',
            'status' => 'pending',
        ]);

        $this->actingAs($mahasiswa);

        $response = $this->postJson('/api/pengajuan-peminjaman', [
            'ruangan_id' => $ruangan->id,
            'dosen_id' => $dosen->id,
            'kodematakuliah' => $matakuliah->kodematakuliah,
            'hari' => 'Kamis',
            'tanggal' => now()->toDateString(),
            'jammulai' => '09:00',
            'jamselesai' => '11:00',
            'keperluan' => 'Latihan'
        ]);

        $response->assertStatus(400);
        $response->assertJson([
            'message' => 'Tanggal/Hari dan jam yang anda ajukan sudah ada yang mengajukan terlebih dahulu silahkan pilih ruangan lain untuk menghindari bentrok ruangan.'
        ]);
    }

/** @test */
public function pengajuan_gagal_jika_jammulai_lebih_lambat_dari_jamselesai()
{
    $mahasiswa = User::factory()->mahasiswa()->create();
    $dosen = Dosen::factory()->create();
    $matakuliah = Matakuliah::factory()->create();
    $ruangan = RuanganGKT::factory()->create();

    $this->actingAs($mahasiswa);

    $response = $this->postJson('/api/pengajuan-peminjaman', [
        'ruangan_id' => $ruangan->id,
        'dosen_id' => $dosen->id,
        'kodematakuliah' => $matakuliah->kodematakuliah,
        'hari' => 'Jumat',
        'tanggal' => now()->toDateString(),
        'jammulai' => '12:00',
        'jamselesai' => '10:00',
        'keperluan' => 'Praktikum'
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['jamselesai']);
}

}