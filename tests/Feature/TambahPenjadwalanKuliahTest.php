<?php

namespace Tests\Feature;

use App\Models\Dosen;
use App\Models\Prodi;
use App\Models\TahunAjaran;
use App\Models\Kelas;
use App\Models\Matakuliah;
use App\Models\PenjadwalanRuangan;
use App\Models\RuanganGKT;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TambahPenjadwalanKuliahTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function Jadwal_bisa_ditambahkan_jika_tidak_bentrok()
    {
        $adminJurusan = User::factory()->create(['role' => 'admin_jurusan']);
        $this->actingAs($adminJurusan);

        $prodi = Prodi::factory()->create();
        $tahunAjaran = TahunAjaran::factory()->create();
        $dosen = Dosen::factory()->create();
        $kelas = Kelas::factory()->create();
        $matakuliah = Matakuliah::factory()->create();
        $ruangan = RuanganGKT::factory()->create();
        $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);

        $response = $this->postJson('/api/penjadwalanruangan', [
            'mahasiswa_id' => $mahasiswa->id,
            'hari' => 'Senin',
            'jammulai' => '08:00',
            'jamselesai' => '10:00',
            'kodematakuliah' => $matakuliah->kodematakuliah,
            'kebutuhankelas' => 'Lab Komputer',
            'prodi_id' => $prodi->id,
            'tahunajaran_id' => $tahunAjaran->id,
            'adminjurusan_id' => $adminJurusan->id,
            'dosen_id' => $dosen->id,
            'kelas_id' => $kelas->id,
            'ruangan_id' => $ruangan->id,
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'message' => 'Jadwal ruangan  berhasil disimpan'
        ]);
    }

    /** @test */
    public function jadwal_tidak_bisa_ditambahkan_jika__bentrok_dengan_jadwal_lain()
    {
        $adminJurusan = User::factory()->create(['role' => 'admin_jurusan']);
        $this->actingAs($adminJurusan);

        $prodi = Prodi::factory()->create();
        $tahunAjaran = TahunAjaran::factory()->create();
        $dosen = Dosen::factory()->create();
        $kelas = Kelas::factory()->create();
        $matakuliah = Matakuliah::factory()->create();
        $ruangan = RuanganGKT::factory()->create();
        $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);

        $this->postJson('/api/penjadwalanruangan', [
            'mahasiswa_id' => $mahasiswa->id,
            'hari' => 'Senin',
            'jammulai' => '08:00',
            'jamselesai' => '10:00',
            'kodematakuliah' => $matakuliah->kodematakuliah,
            'kebutuhankelas' => 'Lab Komputer',
            'prodi_id' => $prodi->id,
            'tahunajaran_id' => $tahunAjaran->id,
            'adminjurusan_id' => $adminJurusan->id,
            'dosen_id' => $dosen->id,
            'kelas_id' => $kelas->id,
            'ruangan_id' => $ruangan->id,
        ]);

        $response = $this->postJson('/api/penjadwalanruangan', [
            'mahasiswa_id' => $mahasiswa->id, 
            'hari' => 'Senin',
            'jammulai' => '08:00',
            'jamselesai' => '10:00',
            'kodematakuliah' => $matakuliah->kodematakuliah,
            'kebutuhankelas' => 'Lab Komputer 2',
            'prodi_id' => $prodi->id,
            'tahunajaran_id' => $tahunAjaran->id,
            'adminjurusan_id' => $adminJurusan->id,
            'dosen_id' => $dosen->id,
            'kelas_id' => $kelas->id,
            'ruangan_id' => $ruangan->id,
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'message' => 'Kelas ini sudah memiliki jadwal lain di hari dan jam yang sama.'
        ]);
    }

/** @test */
public function ruangan_tidak_dapat_dijadwalkan_jika_sudah_dijadwalkan_untuk_jadwal_lain()
{
    $adminPengelola = User::factory()->create(['role' => 'admin_pengelola_gkt']);
    $this->actingAs($adminPengelola);

    $prodi = Prodi::factory()->create();
    $tahunAjaran = TahunAjaran::factory()->create();
    $dosen = Dosen::factory()->create();
    $kelas = Kelas::factory()->create();
    $matakuliah = Matakuliah::factory()->create();
    $ruangan = RuanganGKT::factory()->create();
    $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);

    $jadwalBentrok = PenjadwalanRuangan::create([
        'mahasiswa_id' => $mahasiswa->id,
        'hari' => 'Senin',
        'jammulai' => '08:00',
        'jamselesai' => '10:00',
        'kodematakuliah' => $matakuliah->kodematakuliah,
        'kebutuhankelas' => 'Lab Komputer',
        'prodi_id' => $prodi->id,
        'tahunajaran_id' => $tahunAjaran->id,
        'adminjurusan_id' => $adminPengelola->id,
        'dosen_id' => $dosen->id,
        'kelas_id' => $kelas->id,
        'ruangan_id' => $ruangan->id,
    ]);

    $jadwal = PenjadwalanRuangan::create([
        'mahasiswa_id' => $mahasiswa->id,
        'hari' => 'Selasa',
        'jammulai' => '13:00',
        'jamselesai' => '14:00',
        'kodematakuliah' => $matakuliah->kodematakuliah,
        'kebutuhankelas' => 'Lab Komputer',
        'prodi_id' => $prodi->id,
        'tahunajaran_id' => $tahunAjaran->id,
        'adminjurusan_id' => $adminPengelola->id,
        'dosen_id' => $dosen->id,
        'kelas_id' => $kelas->id,
        'ruangan_id' => $ruangan->id,
    ]);

    $response = $this->putJson('/api/penjadwalanruanganadminpengelola/updateruangan/' . $jadwal->id, [
        'ruangan_id' => $ruangan->id,
        'hari' => 'Senin',
        'jammulai' => '08:00',
        'jamselesai' => '10:00',
    ]);

    $response->assertStatus(422);
    $response->assertJson([
        'error' => 'Ruangan sudah dijadwalkan pada waktu tersebut'
    ]);
}
    /** @test */
    public function ruangan_dapat_dijadwalkan_jika_belum_dijadwalkan_untuk_jadwal_lain()
    {
        $adminPengelola = User::factory()->create(['role' => 'admin_pengelola_gkt']);
        $this->actingAs($adminPengelola);

        $prodi = Prodi::factory()->create();
        $tahunAjaran = TahunAjaran::factory()->create();
        $dosen = Dosen::factory()->create();
        $kelas = Kelas::factory()->create();
        $matakuliah = Matakuliah::factory()->create();
        $ruangan = RuanganGKT::factory()->create();
        $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);

        $response = $this->postJson('/api/penjadwalanruangan', [
            'mahasiswa_id' => $mahasiswa->id,
            'hari' => 'Senin',
            'jammulai' => '10:00',
            'jamselesai' => '12:00',
            'kodematakuliah' => $matakuliah->kodematakuliah,
            'kebutuhankelas' => 'Lab Komputer',
            'prodi_id' => $prodi->id,
            'tahunajaran_id' => $tahunAjaran->id,
            'adminjurusan_id' => $adminPengelola->id,
            'dosen_id' => $dosen->id,
            'kelas_id' => $kelas->id,
            'ruangan_id' => $ruangan->id,
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'message' => 'Jadwal ruangan  berhasil disimpan'
        ]);
    }
}