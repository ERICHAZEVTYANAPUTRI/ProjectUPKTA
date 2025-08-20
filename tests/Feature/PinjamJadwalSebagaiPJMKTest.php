<?php

namespace Tests\Feature;

use Carbon\Carbon;
use Tests\TestCase;
use App\Models\User;
use App\Models\RuanganGKT;
use App\Models\TahunAjaran;
use App\Models\PenjadwalanRuangan;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PinjamJadwalSebagaiPJMKTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function mahasiswa_dapat_meminjam_jadwal_yang_valid()
    {
        $this->travelTo(Carbon::parse('2025-07-01 08:00:00')); // Setelah jam 08:00

        $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);
        $tahun = TahunAjaran::factory()->create(['is_aktif' => true]);
        $ruangan = RuanganGKT::factory()->create(['statusruangan' => 'kosong']);

        $jadwal = PenjadwalanRuangan::factory()->create([
            'mahasiswa_id' => $mahasiswa->id,
            'hari' => 'Selasa',
            'jammulai' => '08:00:00',
            'statuspeminjaman' => 'belumdipinjam',
            'ruangan_id' => $ruangan->id,
            'tahunajaran_id' => $tahun->id,
        ]);

        $this->actingAs($mahasiswa)
            ->postJson("/api/pinjam-jadwal/{$jadwal->id}", [
                'statuspeminjaman' => 'dipinjam',
            ])
            ->assertStatus(200)
            ->assertJson([
                'message' => 'Jadwal berhasil dipinjam.',
                'jadwal' => ['id' => $jadwal->id],
            ]);

        $this->assertDatabaseHas('penjadwalan_ruangans', [
            'id' => $jadwal->id,
            'statuspeminjaman' => 'dipinjam',
        ]);

        $this->assertDatabaseHas('ruangan_g_k_t_s', [
            'id' => $ruangan->id,
            'statusruangan' => 'dipinjam',
        ]);
    }

    /** @test */
    public function gagal_meminjam_jika_bukan_mahasiswa()
    {
        $admin = User::factory()->create(['role' => 'admin_jurusan']);
        $jadwal = PenjadwalanRuangan::factory()->create();

        $this->actingAs($admin)
            ->postJson("/api/pinjam-jadwal/{$jadwal->id}", [
                'statuspeminjaman' => 'dipinjam',
            ])
            ->assertStatus(403);
    }

    /** @test */
    public function gagal_meminjam_jika_jadwal_milik_orang_lain()
    {
        $mahasiswa1 = User::factory()->create(['role' => 'mahasiswa']);
        $mahasiswa2 = User::factory()->create(['role' => 'mahasiswa']);
        $jadwal = PenjadwalanRuangan::factory()->create(['mahasiswa_id' => $mahasiswa1->id]);

        $this->actingAs($mahasiswa2)
            ->postJson("/api/pinjam-jadwal/{$jadwal->id}", [
                'statuspeminjaman' => 'dipinjam',
            ])
            ->assertStatus(403)
            ->assertJson([
                'message' => 'Anda tidak memiliki akses ke jadwal ini.'
            ]);
    }

    /** @test */
    public function gagal_meminjam_jika_status_sudah_dipinjam()
    {
        $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);
        $jadwal = PenjadwalanRuangan::factory()->create([
            'mahasiswa_id' => $mahasiswa->id,
            'statuspeminjaman' => 'dipinjam',
        ]);

        $this->actingAs($mahasiswa)
            ->postJson("/api/pinjam-jadwal/{$jadwal->id}", [
                'statuspeminjaman' => 'dipinjam',
            ])
            ->assertStatus(400)
            ->assertJson([
                'message' => 'Jadwal sudah dipinjam.'
            ]);
    }

    /** @test */
public function gagal_meminjam_jika_status_peminjaman_adalah_prosespengembalian()
{
    $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);
    $tahun = TahunAjaran::factory()->create(['is_aktif' => true]);

    $jadwal = PenjadwalanRuangan::factory()->create([
        'mahasiswa_id' => $mahasiswa->id,
        'statuspeminjaman' => 'prosespengembalian',
        'tahunajaran_id' => $tahun->id,
        'hari' => now()->locale('id')->isoFormat('dddd'),
        'jammulai' => now()->subMinute()->format('H:i:s'),
        'jamselesai' => now()->addHour()->format('H:i:s'),
    ]);

    $this->actingAs($mahasiswa)
        ->postJson("/api/pinjam-jadwal/{$jadwal->id}", [
            'statuspeminjaman' => 'dipinjam',
        ])
        ->assertStatus(400)
        ->assertJson(['message' => 'Jadwal sedang dalam proses pengembalian.']);
}


    /** @test */
    public function gagal_meminjam_jika_hari_tidak_sesuai()
    {
        $this->travelTo(Carbon::parse('2025-07-01 07:55:00'));

        $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);
        $jadwal = PenjadwalanRuangan::factory()->create([
            'mahasiswa_id' => $mahasiswa->id,
            'hari' => 'Rabu',
            'jammulai' => '08:00:00',
            'statuspeminjaman' => 'belumdipinjam',
        ]);

        $this->actingAs($mahasiswa)
            ->postJson("/api/pinjam-jadwal/{$jadwal->id}", [
                'statuspeminjaman' => 'dipinjam',
            ])
            ->assertStatus(400)
            ->assertJson([
                'message' => 'Jadwal ini hanya dapat dipinjam pada hari Rabu pukul 08:00 - 10:00.'
            ]);
    }

        /** @test */
public function gagal_meminjam_jika_waktu_sekarang_di_luar_jam_jadwal()
{
    $this->travelTo(Carbon::parse('2025-07-01 07:00:00'));

    $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);
    $tahun = TahunAjaran::factory()->create(['is_aktif' => true]);

    $jadwal = PenjadwalanRuangan::factory()->create([
        'mahasiswa_id' => $mahasiswa->id,
        'hari' => 'Selasa',
        'jammulai' => '08:00:00',
        'jamselesai' => '10:00:00',
        'statuspeminjaman' => 'belumdipinjam',
        'tahunajaran_id' => $tahun->id,
    ]);

    $this->actingAs($mahasiswa)
        ->postJson("/api/pinjam-jadwal/{$jadwal->id}", [
            'statuspeminjaman' => 'dipinjam',
        ])
        ->assertStatus(400)
        ->assertJson([
            'message' => "Peminjaman hanya dapat dilakukan antara pukul 08:00 hingga 10:00."
        ]);
}
    /** @test */
    public function gagal_meminjam_jika_tahun_ajaran_tidak_aktif()
    {
        $this->travelTo(Carbon::parse('2025-07-01 07:55:00'));

        $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);
        $tahun = TahunAjaran::factory()->create(['is_aktif' => false]);
        $jadwal = PenjadwalanRuangan::factory()->create([
            'mahasiswa_id' => $mahasiswa->id,
            'tahunajaran_id' => $tahun->id,
            'hari' => 'Selasa',
            'jammulai' => '08:00:00',
            'statuspeminjaman' => 'belumdipinjam',
        ]);

        $this->actingAs($mahasiswa)
            ->postJson("/api/pinjam-jadwal/{$jadwal->id}", [
                'statuspeminjaman' => 'dipinjam',
            ])
            ->assertStatus(400)
            ->assertJson([
                'message' => 'Tahun ajaran tidak aktif.'
            ]);
    }
    

/** @test */
public function gagal_meminjam_jika_status_ruangan_sedang_dipinjam()
{
    $this->travelTo(Carbon::parse('2025-07-01 08:30:00'));

    $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);
    $tahun = TahunAjaran::factory()->create(['is_aktif' => true]);
    $ruangan = RuanganGKT::factory()->create(['statusruangan' => 'dipinjam']);

    $jadwal = PenjadwalanRuangan::factory()->create([
        'mahasiswa_id' => $mahasiswa->id,
        'hari' => 'Selasa',
        'jammulai' => '08:00:00',
        'jamselesai' => '10:00:00',
        'statuspeminjaman' => 'belumdipinjam',
        'tahunajaran_id' => $tahun->id,
        'ruangan_id' => $ruangan->id,
    ]);

    $this->actingAs($mahasiswa)
        ->postJson("/api/pinjam-jadwal/{$jadwal->id}", [
            'statuspeminjaman' => 'dipinjam',
        ])
        ->assertStatus(400)
        ->assertJson([
            'message' => 'Ruangan sedang dipinjam, tidak bisa dipinjam.'
        ]);
}
/** @test */

public function gagal_meminjam_jika_status_ruangan_sedang_diperbaiki()
{
    $this->travelTo(Carbon::parse('2025-07-01 08:30:00'));

    $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);
    $tahun = TahunAjaran::factory()->create(['is_aktif' => true]);
    $ruangan = RuanganGKT::factory()->create(['statusruangan' => 'diperbaiki']);

    $jadwal = PenjadwalanRuangan::factory()->create([
        'mahasiswa_id' => $mahasiswa->id,
        'hari' => 'Selasa',
        'jammulai' => '08:00:00',
        'jamselesai' => '10:00:00',
        'statuspeminjaman' => 'belumdipinjam',
        'tahunajaran_id' => $tahun->id,
        'ruangan_id' => $ruangan->id,
    ]);

    $this->actingAs($mahasiswa)
        ->postJson("/api/pinjam-jadwal/{$jadwal->id}", [
            'statuspeminjaman' => 'dipinjam',
        ])
        ->assertStatus(400)
        ->assertJson([
            'message' => 'Ruangan sedang diperbaiki, tidak bisa dipinjam.'
        ]);
}

}