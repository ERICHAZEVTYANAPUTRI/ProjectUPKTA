<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Dosen;
use App\Models\kelas;
use App\Models\Prodi;
use App\Models\Matakuliah;
use App\Models\RuanganGKT;
use App\Models\TahunAjaran;
use App\Models\PenjadwalanRuangan;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class KirimKeMahasiswaTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function jadwal_dapat_dikirim_ke_mahasiswa_jika_ada_yang_belum_terkirim()
    {
        $adminJurusan = User::factory()->create(['role' => 'admin_jurusan']);

        $this->actingAs($adminJurusan);

        $prodi = Prodi::factory()->create();
        $tahunAjaran = TahunAjaran::factory()->create();
        $dosen = Dosen::factory()->create();
        $kelas = kelas::factory()->create();
        $matkul = Matakuliah::factory()->create();
        $ruangan = RuanganGKT::factory()->create();
        $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);

        $jadwal = PenjadwalanRuangan::create([
            'mahasiswa_id' => $mahasiswa->id,
            'hari' => 'Senin',
            'jammulai' => '08:00',
            'jamselesai' => '10:00',
            'kodematakuliah' => $matkul->kodematakuliah,
            'kebutuhankelas' => 'Lab Komputer',
            'prodi_id' => $prodi->id,
            'tahunajaran_id' => $tahunAjaran->id,
            'adminjurusan_id' => $adminJurusan->id,
            'dosen_id' => $dosen->id,
            'kelas_id' => $kelas->id,
            'ruangan_id' => $ruangan->id,
            'statusterkirim' => 'belumterkirim',
        ]);

        $response = $this->postJson('/api/penjadwalan/kirim');

        $response->assertStatus(200)
                 ->assertJson([
                     'message' => 'Jadwal berhasil dikirim ke mahasiswa.',
                     'jumlah_terkirim' => 1,
                 ]);

        $this->assertDatabaseHas('penjadwalan_ruangans', [
            'id' => $jadwal->id,
            'statusterkirim' => 'terkirim',
        ]);
    }

    /** @test */
    public function jika_tidak_ada_jadwal_yang_perlu_dikirim_mengembalikan_pesan_0_jadwal_berhasil_dikirim_dan_berapa_yang_gagal_dikirim()
    {
        $adminJurusan = User::factory()->create(['role' => 'admin_jurusan']);
        $this->actingAs($adminJurusan);

        $response = $this->postJson('/api/penjadwalan/kirim');

        $response->assertStatus(404)
                 ->assertJson([
                     'message' => 'Tidak ada jadwal yang perlu dikirim.',
                 ]);
    }
}