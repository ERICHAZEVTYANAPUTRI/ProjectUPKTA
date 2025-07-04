<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\PengajuanPeminjamanRuangan;
use App\Models\PenjadwalanRuangan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class KembalikanRuanganTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function mahasiswa_dapat_mengembalikan_ruangan_dari_pengajuan()
    {
        $mahasiswa = User::factory()->mahasiswa()->create();

        $pengajuan = PengajuanPeminjamanRuangan::factory()->create([
            'mahasiswa_id' => $mahasiswa->id,
            'statuspeminjaman' => 'dipinjam',
            'status' => 'diterima',
            'statusuploadvidio' => 'pending',
        ]);

        $this->actingAs($mahasiswa, 'sanctum');

        $response = $this->postJson("/api/kembalikan/{$pengajuan->id}", [
            'link_drive' => 'https://drive.google.com/file/d/valid-id/view',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Pengembalian berhasil diproses.'
        ]);

        $this->assertDatabaseHas('pengajuan_peminjaman_ruangans', [
            'id' => $pengajuan->id,
            'statuspeminjaman' => 'prosespengembalian',
            'statusuploadvidio' => 'https://drive.google.com/file/d/valid-id/view',
            'status' => 'prosespengembalian',
        ]);
    }

    /** @test */
    public function mahasiswa_dapat_mengembalikan_ruangan_dari_penjadwalan()
    {
        $mahasiswa = User::factory()->mahasiswa()->create();

        $penjadwalan = PenjadwalanRuangan::factory()->create([
            'mahasiswa_id' => $mahasiswa->id,
            'statuspeminjaman' => 'dipinjam',
            'statusuploadvidio' => 'pending',
        ]);

        $this->actingAs($mahasiswa, 'sanctum');

        $response = $this->postJson("/api/kembalikansesuaijadwal/{$penjadwalan->id}", [
            'link_drive' => 'https://drive.google.com/file/d/valid-id/view',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'message' => 'Pengembalian berhasil diproses.'
        ]);

        $this->assertDatabaseHas('penjadwalan_ruangans', [
            'id' => $penjadwalan->id,
            'statuspeminjaman' => 'prosespengembalian',
            'statusuploadvidio' => 'https://drive.google.com/file/d/valid-id/view',
        ]);
    }

    /** @test */
    public function pengembalian_gagal_jika_link_drive_tidak_valid()
    {
        $mahasiswa = User::factory()->mahasiswa()->create();
        $pengajuan = PengajuanPeminjamanRuangan::factory()->create(['mahasiswa_id' => $mahasiswa->id]);

        $this->actingAs($mahasiswa, 'sanctum');

        $response = $this->postJson("/api/kembalikan/{$pengajuan->id}", [
            'link_drive' => 'bukan-url',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('link_drive');
    }
}