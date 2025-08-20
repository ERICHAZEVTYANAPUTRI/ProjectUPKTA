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
    public function jadwal_bisa_ditambahkan_jika_tidak_bentrok()
    {
        $admin = User::factory()->create(['role' => 'admin_jurusan']);
        $this->actingAs($admin);

        $prodi = Prodi::factory()->create();
        $tahunAjaran = TahunAjaran::factory()->create();
        $dosen = Dosen::factory()->create();
        $kelas = Kelas::factory()->create();
        $matakuliah = Matakuliah::factory()->create();
        $ruangan = RuanganGKT::factory()->create();
        $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);

        $response = $this->postJson('/api/penjadwalanruangan', [
            'jadwal' => [[
                'mahasiswa_id' => $mahasiswa->id,
                'hari' => 'Senin',
                'jammulai' => '08:00',
                'jamselesai' => '10:00',
                'kodematakuliah' => $matakuliah->kodematakuliah,
                'kebutuhankelas' => 'Lab Komputer',
                'prodi_id' => $prodi->id,
                'tahunajaran_id' => $tahunAjaran->id,
                'adminjurusan_id' => $admin->id,
                'dosen_id' => $dosen->id,
                'kelas_id' => $kelas->id,
                'ruangan_id' => $ruangan->id,
            ]]
        ]);

        $response->assertStatus(201);
        $response->assertJsonFragment([
            'message' => 'Semua jadwal berhasil disimpan.'
        ]);
    }

    /** @test */
    public function jadwal_tidak_bisa_ditambahkan_jika_bentrok_dengan_jadwal_lain()
    {
        $admin = User::factory()->create(['role' => 'admin_jurusan']);
        $this->actingAs($admin);

        $prodi = Prodi::factory()->create();
        $tahunAjaran = TahunAjaran::factory()->create();
        $dosen = Dosen::factory()->create();
        $kelas = Kelas::factory()->create();
        $matakuliah = Matakuliah::factory()->create();
        $ruangan = RuanganGKT::factory()->create();
        $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);

        PenjadwalanRuangan::create([
            'mahasiswa_id' => $mahasiswa->id,
            'hari' => 'Senin',
            'jammulai' => '08:00',
            'jamselesai' => '10:00',
            'kodematakuliah' => $matakuliah->kodematakuliah,
            'kebutuhankelas' => 'Lab Komputer',
            'prodi_id' => $prodi->id,
            'tahunajaran_id' => $tahunAjaran->id,
            'adminjurusan_id' => $admin->id,
            'dosen_id' => $dosen->id,
            'kelas_id' => $kelas->id,
            'ruangan_id' => $ruangan->id,
        ]);

        $response = $this->postJson('/api/penjadwalanruangan', [
            'jadwal' => [[
                'mahasiswa_id' => $mahasiswa->id,
                'hari' => 'Senin',
                'jammulai' => '08:00',
                'jamselesai' => '10:00',
                'kodematakuliah' => $matakuliah->kodematakuliah,
                'kebutuhankelas' => 'Lab Komputer 2',
                'prodi_id' => $prodi->id,
                'tahunajaran_id' => $tahunAjaran->id,
                'adminjurusan_id' => $admin->id,
                'dosen_id' => $dosen->id,
                'kelas_id' => $kelas->id,
                'ruangan_id' => $ruangan->id,
            ]]
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            'message' => 'Beberapa jadwal gagal disimpan.',
        ]);
    }
    
    /** @test */
public function gagal_menyimpan_jika_ada_yang_bentrok()
{
    $admin = User::factory()->create(['role' => 'admin_jurusan']);
    $this->actingAs($admin);

    $prodi = Prodi::factory()->create();
    $tahunAjaran = TahunAjaran::factory()->create();
    $dosen = Dosen::factory()->create();
    $kelas = Kelas::factory()->create();
    $matakuliah = Matakuliah::factory()->create();
    $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);

    // Jadwal pertama disimpan
    PenjadwalanRuangan::create([
        'mahasiswa_id' => $mahasiswa->id,
        'hari' => 'Senin',
        'jammulai' => '08:00',
        'jamselesai' => '10:00',
        'kodematakuliah' => $matakuliah->kodematakuliah,
        'kebutuhankelas' => 'Lab 1',
        'prodi_id' => $prodi->id,
        'tahunajaran_id' => $tahunAjaran->id,
        'adminjurusan_id' => $admin->id,
        'dosen_id' => $dosen->id,
        'kelas_id' => $kelas->id,
    ]);

    $newData = [
        [
            'mahasiswa_id' => $mahasiswa->id,
            'hari' => 'Senin',
            'jammulai' => '09:00',
            'jamselesai' => '11:00', // <== BENTROK
            'kodematakuliah' => $matakuliah->kodematakuliah,
            'kebutuhankelas' => 'Lab Bentrok',
            'prodi_id' => $prodi->id,
            'tahunajaran_id' => $tahunAjaran->id,
            'adminjurusan_id' => $admin->id,
            'dosen_id' => $dosen->id,
            'kelas_id' => $kelas->id,
        ]
    ];

    $response = $this->postJson('/api/penjadwalanruangan', [
        'jadwal' => $newData,
    ]);

    $response->assertStatus(422);
    $response->assertJson([
        'message' => 'Beberapa jadwal gagal disimpan.',
    ]);
}
/** @test */
public function dapat_menambahkan_satu_jadwal_ruangan()
{
    $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);
    $prodi = Prodi::factory()->create();
    $tahunAjaran = TahunAjaran::factory()->create(['is_aktif' => true]);
    $adminJurusan = User::factory()->create(['role' => 'admin_jurusan']);
    $dosen = Dosen::factory()->create();
    $kelas = Kelas::factory()->create();
    $matkul = MataKuliah::factory()->create();

    $data = [
        [
            'mahasiswa_id' => $mahasiswa->id,
            'hari' => 'Senin',
            'jammulai' => '08:00',
            'jamselesai' => '10:00',
            'kodematakuliah' => $matkul->kodematakuliah,
            'kebutuhankelas' => 'Proyektor',
            'prodi_id' => $prodi->id,
            'tahunajaran_id' => $tahunAjaran->id,
            'adminjurusan_id' => $adminJurusan->id,
            'dosen_id' => $dosen->id,
            'kelas_id' => $kelas->id,
        ]
    ];

    $response = $this->postJson('/api/penjadwalanruangan', [
        'jadwal' => $data,
    ]);

    $response->assertStatus(201);
    $response->assertJson([
        'message' => 'Semua jadwal berhasil disimpan.',
    ]);
}
/** @test */
public function dapat_menambahkan_banyak_jadwal_ruangan()
{
    $admin = User::factory()->create(['role' => 'admin_jurusan']);
    $this->actingAs($admin);

    $prodi = Prodi::factory()->create();
    $tahunAjaran = TahunAjaran::factory()->create();
    $dosen = Dosen::factory()->create();
    $kelas1 = Kelas::factory()->create();
    $kelas2 = Kelas::factory()->create();
    $matakuliah = Matakuliah::factory()->create();
    $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);

    $data = [
        [
            'mahasiswa_id' => $mahasiswa->id,
            'hari' => 'Senin',
            'jammulai' => '08:00',
            'jamselesai' => '10:00',
            'kodematakuliah' => $matakuliah->kodematakuliah,
            'kebutuhankelas' => 'Lab 1',
            'prodi_id' => $prodi->id,
            'tahunajaran_id' => $tahunAjaran->id,
            'adminjurusan_id' => $admin->id,
            'dosen_id' => $dosen->id,
            'kelas_id' => $kelas1->id,
        ],
        [
            'mahasiswa_id' => $mahasiswa->id,
            'hari' => 'Selasa',
            'jammulai' => '10:00',
            'jamselesai' => '12:00',
            'kodematakuliah' => $matakuliah->kodematakuliah,
            'kebutuhankelas' => 'Lab 2',
            'prodi_id' => $prodi->id,
            'tahunajaran_id' => $tahunAjaran->id,
            'adminjurusan_id' => $admin->id,
            'dosen_id' => $dosen->id,
            'kelas_id' => $kelas2->id,
        ]
    ];

    $response = $this->postJson('/api/penjadwalanruangan', [
        'jadwal' => $data,
    ]);

    $response->assertStatus(201);
    $response->assertJson([
    'message' => 'Semua jadwal berhasil disimpan.',
    ]);
}


    /** @test */
    public function ruangan_tidak_dapat_dijadwalkan_jika_sudah_terpakai()
    {
        $admin = User::factory()->create(['role' => 'admin_pengelola_gkt']);
        $this->actingAs($admin);

        $prodi = Prodi::factory()->create();
        $tahunAjaran = TahunAjaran::factory()->create();
        $dosen = Dosen::factory()->create();
        $kelas = Kelas::factory()->create();
        $matakuliah = Matakuliah::factory()->create();
        $ruangan = RuanganGKT::factory()->create();
        $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);

        PenjadwalanRuangan::create([
            'mahasiswa_id' => $mahasiswa->id,
            'hari' => 'Senin',
            'jammulai' => '08:00',
            'jamselesai' => '10:00',
            'kodematakuliah' => $matakuliah->kodematakuliah,
            'kebutuhankelas' => 'Lab Komputer',
            'prodi_id' => $prodi->id,
            'tahunajaran_id' => $tahunAjaran->id,
            'adminjurusan_id' => $admin->id,
            'dosen_id' => $dosen->id,
            'kelas_id' => $kelas->id,
            'ruangan_id' => $ruangan->id,
        ]);

        $jadwalLain = PenjadwalanRuangan::create([
            'mahasiswa_id' => $mahasiswa->id,
            'hari' => 'Selasa',
            'jammulai' => '13:00',
            'jamselesai' => '14:00',
            'kodematakuliah' => $matakuliah->kodematakuliah,
            'kebutuhankelas' => 'Lab Komputer',
            'prodi_id' => $prodi->id,
            'tahunajaran_id' => $tahunAjaran->id,
            'adminjurusan_id' => $admin->id,
            'dosen_id' => $dosen->id,
            'kelas_id' => $kelas->id,
            'ruangan_id' => $ruangan->id,
        ]);

        $response = $this->putJson('/api/penjadwalanruanganadminpengelola/updateruangan/' . $jadwalLain->id, [
            'ruangan_id' => $ruangan->id,
            'hari' => 'Senin',
            'jammulai' => '08:00',
            'jamselesai' => '10:00',
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            'error' => 'Ruangan sudah dijadwalkan pada waktu tersebut'
        ]);
    }

    /** @test */
    public function ruangan_dapat_dijadwalkan_jika_belum_terpakai()
    {
        $admin = User::factory()->create(['role' => 'admin_pengelola_gkt']);
        $this->actingAs($admin);

        $prodi = Prodi::factory()->create();
        $tahunAjaran = TahunAjaran::factory()->create();
        $dosen = Dosen::factory()->create();
        $kelas = Kelas::factory()->create();
        $matakuliah = Matakuliah::factory()->create();
        $ruangan = RuanganGKT::factory()->create();
        $mahasiswa = User::factory()->create(['role' => 'mahasiswa']);

        $response = $this->postJson('/api/penjadwalanruangan', [
            'jadwal' => [[
                'mahasiswa_id' => $mahasiswa->id,
                'hari' => 'Senin',
                'jammulai' => '10:00',
                'jamselesai' => '12:00',
                'kodematakuliah' => $matakuliah->kodematakuliah,
                'kebutuhankelas' => 'Lab Komputer',
                'prodi_id' => $prodi->id,
                'tahunajaran_id' => $tahunAjaran->id,
                'adminjurusan_id' => $admin->id,
                'dosen_id' => $dosen->id,
                'kelas_id' => $kelas->id,
                'ruangan_id' => $ruangan->id,
            ]]
        ]);

        $response->assertStatus(201);
        $response->assertJsonFragment([
            'message' => 'Semua jadwal berhasil disimpan.'
        ]);
    }
    
}