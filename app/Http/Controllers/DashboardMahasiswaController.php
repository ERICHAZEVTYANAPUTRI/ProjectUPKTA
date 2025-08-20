<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PenjadwalanRuangan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardMahasiswaController extends Controller
{

    public function ajukanTukar($id)
    {
        $jadwal = PenjadwalanRuangan::findOrFail($id);
        $mahasiswa = auth()->user();

        if (!$mahasiswa) {
            return response()->json(['message' => 'User belum login.'], 401);
        }

        if ($mahasiswa->id === $jadwal->mahasiswa_id) {
            return response()->json(['message' => 'Anda sudah menjadi PJMK untuk jadwal ini.'], 403);
        }

        if ($mahasiswa->kelas_id !== $jadwal->kelas_id) {
            return response()->json(['message' => 'Anda tidak berada di kelas yang sama.'], 403);
        }

        if (
            $jadwal->status_pengajuan_pjmk === 'menunggu' &&
            $jadwal->pengaju_pjmk_id === $mahasiswa->id
        ) {
            return response()->json(['message' => 'Pengajuan sudah dilakukan dan sedang diproses.'], 409);
        }

        if (
            $jadwal->status_pengajuan_pjmk === 'menunggu' &&
            $jadwal->pengaju_pjmk_id !== null &&
            $jadwal->pengaju_pjmk_id !== $mahasiswa->id
        ) {
            return response()->json(['message' => 'Sudah ada mahasiswa lain yang mengajukan tukar PJMK.'], 409);
        }

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

        $jadwal = PenjadwalanRuangan::where('id', $id)
            ->where('mahasiswa_id', $user->id)
            ->first();

        if (!$jadwal) {
            return response()->json(['message' => 'Jadwal tidak ditemukan atau Anda bukan PJMK.'], 403);
        }

        $awal = $jadwal->statustidakdigunakan;
        $jadwal->statustidakdigunakan = ($awal ?? 0) + 1;

        try {
            $jadwal->save();
        } catch (\Exception $e) {
            Log::error('GAGAL SIMPAN jadwal:', [$e->getMessage()]);
            return response()->json(['message' => 'Gagal menyimpan jadwal.'], 500);
        }

        Log::info('STATUSTIDAKDIGUNAKAN berhasil update', [
            'id' => $jadwal->id,
            'sebelum' => $awal,
            'sesudah' => $jadwal->statustidakdigunakan
        ]);

        try {
            DB::table('peminjamanselesaisesuaijdwals')->insert([
                'mahasiswa_id' => $jadwal->mahasiswa_id,
                'adminjurusan_id' => $jadwal->adminjurusan_id,
                'prodi_id' => $jadwal->prodi_id,
                'tahunajaran_id' => $jadwal->tahunajaran_id,
                'dosen_id' => $jadwal->dosen_id,
                'ruangan_id' => $jadwal->ruangan_id,
                'kelas_id' => $jadwal->kelas_id,
                'hari' => $jadwal->hari,
                'jammulai' => $jadwal->jammulai,
                'jamselesai' => $jadwal->jamselesai,
                'kodematakuliah' => $jadwal->kodematakuliah,
                'kebutuhankelas' => $jadwal->kebutuhankelas,
                'statusuploadvidio' => null,
                'statusjadwal' => null,
                'statusterkirim' => null,
                'statuspeminjaman' => null,
                'statusdigunakan' => null,
                'statustidakdigunakan' => 'kosong',
                'statusdialihkan' => null,
                'waktu_pengembalian' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('INSERT GAGAL ke peminjamanselesai:', [$e->getMessage()]);
            return response()->json(['message' => 'Gagal insert ke peminjamanselesai.'], 500);
        }

        return response()->json(['message' => 'Berhasil tandai kelas kosong.']);
    }

    public function dialihkan($id, Request $request)
    {
        $user = auth()->user();

        $jadwal = PenjadwalanRuangan::where('id', $id)
            ->where('mahasiswa_id', $user->id)
            ->first();

        if (!$jadwal) {
            return response()->json(['message' => 'Jadwal tidak ditemukan atau Anda bukan PJMK.'], 403);
        }

        $jadwal->statusdialihkan = (int)$jadwal->statusdialihkan + 1;
        $jadwal->save();

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
            'statustidakdigunakan' => null,
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
