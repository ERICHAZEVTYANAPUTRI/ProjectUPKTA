<?php

namespace Tests\Feature;

use Carbon\Carbon;
use Tests\TestCase;
use App\Models\User;
use App\Models\RuanganGKT;
use App\Models\PengajuanPeminjamanRuangan;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PinjamRuanganDiluarJadwaltest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function berhasil_meminjam_jika_hari_tanggal_dan_status_valid()
    {
        $this->travelTo(Carbon::parse('2025-07-01 08:01:00'));

        $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);
        $ruangan = RuanganGKT::factory()->create(['statusruangan' => 'kosong']);

        $pengajuan = PengajuanPeminjamanRuangan::factory()->create([
            'mahasiswa_id' => $mahasiswa->id,
            'ruangan_id' => $ruangan->id,
            'status' => 'diterima',
            'statuspeminjaman' => 'pending',
            'hari' => 'Selasa',
            'jammulai' => '08:00:00',
        ]);

        $this->actingAs($mahasiswa)
            ->postJson("/api/pengajuan-pinjamsaya/{$pengajuan->id}")
            ->assertStatus(200)
            ->assertJson([
                'message' => 'Peminjaman dimulai. Selamat menggunakan ruangan!',
            ]);

        $this->assertDatabaseHas('pengajuan_peminjaman_ruangans', [
            'id' => $pengajuan->id,
            'statuspeminjaman' => 'dipinjam',
        ]);

        $this->assertDatabaseHas('ruangan_g_k_t_s', [
            'id' => $ruangan->id,
            'statusruangan' => 'dipinjam',
        ]);
    }

    /** @test */
    public function gagal_meminjam_diluar_hari_pengajuan()
    {
        $this->travelTo(Carbon::parse('2025-07-01 08:01:00'));

        $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);
        $ruangan = RuanganGKT::factory()->create(['statusruangan' => 'kosong']);

        $pengajuan = PengajuanPeminjamanRuangan::factory()->create([
            'mahasiswa_id' => $mahasiswa->id,
            'ruangan_id' => $ruangan->id,
            'status' => 'diterima',
            'statuspeminjaman' => 'pending',
            'hari' => 'Rabu', // Jadwalnya Rabu
            'jammulai' => '08:00:00',
        ]);

        $this->actingAs($mahasiswa)
            ->postJson("/api/pengajuan-pinjamsaya/{$pengajuan->id}")
            ->assertStatus(400)
            ->assertJson([
                'message' => 'Hari ini bukan jadwal peminjaman ruangan Anda.',
            ]);
    }

    /** @test */
    public function gagal_meminjam_jika_status_bukan_diterima()
    {
        $this->travelTo(Carbon::parse('2025-07-01 08:01:00'));

        $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);
        $ruangan = RuanganGKT::factory()->create(['statusruangan' => 'kosong']);

        $pengajuan = PengajuanPeminjamanRuangan::factory()->create([
            'mahasiswa_id' => $mahasiswa->id,
            'ruangan_id' => $ruangan->id,
            'status' => 'pending', // Belum diterima
            'statuspeminjaman' => 'pending',
            'hari' => 'Selasa',
            'jammulai' => '08:00:00',
        ]);

        $this->actingAs($mahasiswa)
            ->postJson("/api/pengajuan-pinjamsaya/{$pengajuan->id}")
            ->assertStatus(400)
            ->assertJson([
                'message' => 'Pengajuan belum siap dipinjam atau sudah dipinjam.',
            ]);
    }

    /** @test */
    public function gagal_meminjam_jika_status_ruangan_dipinjam_atau_diperbaiki()
    {
        $this->travelTo(Carbon::parse('2025-07-01 08:01:00'));

        $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);
        $ruangan = RuanganGKT::factory()->create(['statusruangan' => 'diperbaiki']);

        $pengajuan = PengajuanPeminjamanRuangan::factory()->create([
            'mahasiswa_id' => $mahasiswa->id,
            'ruangan_id' => $ruangan->id,
            'status' => 'diterima',
            'statuspeminjaman' => 'pending',
            'hari' => 'Selasa',
            'jammulai' => '08:00:00',
        ]);

        $this->actingAs($mahasiswa)
            ->postJson("/api/pengajuan-pinjamsaya/{$pengajuan->id}")
            ->assertStatus(400)
            ->assertJson([
                'message' => 'Ruangan sedang diperbaiki, tidak bisa dipinjam.',
            ]);
    }
}
