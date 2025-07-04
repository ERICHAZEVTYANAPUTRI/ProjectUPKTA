<?php

namespace App\Http\Controllers;

use DB;
use Illuminate\Http\Request;
use App\Models\PenjadwalanRuangan;

class DashboardMahasiswaController extends Controller
{
public function ajukanTukar($id)
{
    $jadwal = PenjadwalanRuangan::findOrFail($id);
    $mahasiswa = auth()->user();

    // 1. Belum login
    if (!$mahasiswa) {
        return response()->json(['message' => 'User belum login.'], 401);
    }

    // 2. Mahasiswa adalah PJMK saat ini
    if ($mahasiswa->id === $jadwal->mahasiswa_id) {
        return response()->json(['message' => 'Anda sudah menjadi PJMK untuk jadwal ini.'], 403);
    }

    // 3. Mahasiswa bukan dari kelas yang sama
    if ($mahasiswa->kelas_id !== $jadwal->kelas_id) {
        return response()->json(['message' => 'Anda tidak berada di kelas yang sama.'], 403);
    }

    // 4. Jika sudah ada pengajuan dari mahasiswa yang sama
    if (
        $jadwal->status_pengajuan_pjmk === 'menunggu' &&
        $jadwal->pengaju_pjmk_id === $mahasiswa->id
    ) {
        return response()->json(['message' => 'Pengajuan sudah dilakukan dan sedang diproses.'], 409);
    }

    // 5. Jika sudah ada mahasiswa lain yang mengajukan
    if (
        $jadwal->status_pengajuan_pjmk === 'menunggu' &&
        $jadwal->pengaju_pjmk_id !== null &&
        $jadwal->pengaju_pjmk_id !== $mahasiswa->id
    ) {
        return response()->json(['message' => 'Sudah ada mahasiswa lain yang mengajukan tukar PJMK.'], 409);
    }

    // 6. Proses pengajuan
    $jadwal->update([
        'status_pengajuan_pjmk' => 'menunggu',
        'pengaju_pjmk_id' => $mahasiswa->id,
    ]);

    return response()->json(['message' => 'Pengajuan tukar PJMK berhasil dikirim.']);
}
public function terimaTukar($id)
{
    $jadwal = PenjadwalanRuangan::findOrFail($id);

    if ($jadwal->status_pengajuan_pjmk !== 'menunggu') {
        return response()->json(['message' => 'Tidak ada pengajuan tukar untuk jadwal ini.'], 400);
    }

    // Validasi jika pengaju_pjmk_id memang ada
    if (!$jadwal->pengaju_pjmk_id) {
        return response()->json(['message' => 'Data pengaju tidak ditemukan.'], 400);
    }

    // Lakukan update
    $jadwal->mahasiswa_id = $jadwal->pengaju_pjmk_id;
    $jadwal->pengaju_pjmk_id = null;
    $jadwal->status_pengajuan_pjmk = null;
    $jadwal->save();

    return response()->json(['message' => 'PJMK berhasil digantikan.']);
}
public function tandaiKelasKosong($id)
{
    $user = auth()->user();

    // Cari jadwal & pastikan user adalah PJMK-nya
    $jadwal = PenjadwalanRuangan::where('id', $id)
        ->where('mahasiswa_id', $user->id)
        ->first();

    if (!$jadwal) {
        return response()->json(['message' => 'Jadwal tidak ditemukan atau Anda bukan PJMK.'], 403);
    }

    // Tambah 1 ke kolom statustidakdigunakan
    $jadwal->statustidakdigunakan = (int)$jadwal->statustidakdigunakan + 1;
    $jadwal->save();

    // Simpan ke tabel peminjamanselesaisesuaijdwals
    DB::table('peminjamanselesaisesuaijdwals')->insert([
        'mahasiswa_id'        => $jadwal->mahasiswa_id,
        'adminjurusan_id'     => $jadwal->adminjurusan_id,
        'prodi_id'            => $jadwal->prodi_id,
        'tahunajaran_id'      => $jadwal->tahunajaran_id,
        'dosen_id'            => $jadwal->dosen_id,
        'ruangan_id'          => $jadwal->ruangan_id,
        'kelas_id'            => $jadwal->kelas_id,
        'hari'                => $jadwal->hari,
        'jammulai'            => $jadwal->jammulai,
        'jamselesai'          => $jadwal->jamselesai,
        'kodematakuliah'      => $jadwal->kodematakuliah,
        'kebutuhankelas'      => $jadwal->kebutuhankelas,
        'statusuploadvidio'   => null,
        'statusjadwal'        => null,
        'statusterkirim'      => null,
        'statuspeminjaman'    => null,
        'statusdigunakan'     => null,
        'statustidakdigunakan'=> 'kosong', // <- kosong
        'statusdialihkan'     => null,
        'waktu_pengembalian'  => now(),
        'created_at'          => now(),
        'updated_at'          => now(),
    ]);

    return response()->json([
        'message' => 'Kelas berhasil ditandai sebagai kosong dan dicatat ke log.',
        'data' => $jadwal
    ]);
}
public function dialihkan($id, Request $request)
{
    $user = auth()->user();

    // Cari jadwal & pastikan user adalah PJMK-nya
    $jadwal = PenjadwalanRuangan::where('id', $id)
        ->where('mahasiswa_id', $user->id)
        ->first();

    if (!$jadwal) {
        return response()->json(['message' => 'Jadwal tidak ditemukan atau Anda bukan PJMK.'], 403);
    }

    // Tambah 1 ke kolom statustidakdigunakan
    $jadwal->statusdialihkan = (int)$jadwal->statusdialihkan + 1;
    $jadwal->save();

    // Simpan ke peminjamanselesais
    DB::table('peminjamanselesaisesuaijdwals')->insert([
        'mahasiswa_id'        => $jadwal->mahasiswa_id,
        'adminjurusan_id'     => $jadwal->adminjurusan_id,
        'prodi_id'            => $jadwal->prodi_id,
        'tahunajaran_id'      => $jadwal->tahunajaran_id,
        'dosen_id'            => $jadwal->dosen_id,
        'ruangan_id'          => $jadwal->ruangan_id,
        'kelas_id'            => $jadwal->kelas_id,
        'hari'                => $jadwal->hari,
        'jammulai'            => $jadwal->jammulai,
        'jamselesai'          => $jadwal->jamselesai,
        'kodematakuliah'      => $jadwal->kodematakuliah,
        'kebutuhankelas'      => $jadwal->kebutuhankelas,
        'statusuploadvidio'   => null,
        'statusjadwal'        => null,
        'statusterkirim'      => null,
        'statuspeminjaman'    => null,
        'statusdigunakan'     => null,
        'statustidakdigunakan'=> null,
        'statusdialihkan'     => 'dialihkan',
        'waktu_pengembalian'  => now(),
        'created_at'          => now(),
        'updated_at'          => now(),
    ]);

    return response()->json([
        'message' => 'Kelas berhasil ditandai sebagai dialihkan dan dicatat ke log.',
        'data' => $jadwal
    ]);
}

}