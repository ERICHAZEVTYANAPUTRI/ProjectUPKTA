<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Prodi;
use App\Models\RuanganGKT;
use Illuminate\Http\Request;
use App\Models\PenjadwalanRuangan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PenjadwalanRuanganController extends Controller
{
public function jadwalMahasiswa(Request $request)
{
    $mahasiswa = $request->user(); // Ambil user yang login

    if (!$mahasiswa) {
        return response()->json(['message' => 'User tidak ditemukan atau belum login.'], 401);
    }

    if ($mahasiswa->role !== 'mahasiswa') {
        return response()->json(['message' => 'Akses ditolak.'], 403);
    }

    $data = PenjadwalanRuangan::with([
        'mahasiswa',
        'mahasiswa.jurusan', 
        'matakuliah',
        'matakuliah.kurikulum',
        'prodi',
        'pengaju_pjmk',
        'tahunajaran',
        'adminjurusan',
        'dosen',
        'ruangan',
        'kelas'
    ])
    ->where('statusterkirim', 'terkirim')
    ->where('mahasiswa_id', $mahasiswa->id) // filter berdasarkan mahasiswa login
    ->whereHas('tahunajaran', function($query) {
        $query->where('is_aktif', 1);
    })
    ->get();

    if ($data->isEmpty()) {
        return response()->json(['message' => 'Tidak ada jadwal ditemukan.'], 404);
    }

    return response()->json($data);
}

public function jadwalKelasMahasiswa(Request $request)
{
    $mahasiswa = $request->user();

    if (!$mahasiswa) {
        return response()->json(['message' => 'User tidak ditemukan atau belum login.'], 401);
    }

    if ($mahasiswa->role !== 'mahasiswa') {
        return response()->json(['message' => 'Akses ditolak.'], 403);
    }

    // Pastikan mahasiswa memiliki kelas_id
    if (!$mahasiswa->kelas_id) {
        return response()->json(['message' => 'Mahasiswa tidak memiliki data kelas.'], 400);
    }

    // Ambil semua jadwal matakuliah yang di tampilkan berdasarkan kelas yang sama dan tahun ajaran aktif
    $data = PenjadwalanRuangan::with([
        'mahasiswa',
        'mahasiswa.jurusan',
        'matakuliah',
        'matakuliah.kurikulum',
        'prodi',
        'tahunajaran',
        'adminjurusan',
        'dosen',
        'ruangan',
        'kelas'
    ])
    ->where('statusterkirim', 'terkirim')
    ->where('kelas_id', $mahasiswa->kelas_id)
    ->whereHas('tahunajaran', function ($query) {
        $query->where('is_aktif', 1);
    })
    ->get();

    if ($data->isEmpty()) {
        return response()->json(['message' => 'Tidak ada jadwal ditemukan untuk kelas ini.'], 404);
    }

    return response()->json($data);
}

  public function semuadatatampil()
{
        $data = PenjadwalanRuangan::with('mahasiswa','mahasiswa.jurusan', 'matakuliah','matakuliah.kurikulum','prodi','tahunajaran','adminjurusan','dosen','ruangan','kelas')
        ->where('statuspeminjaman', 'dipinjam')  // Menambahkan filter berdasarkan statuspeminjaman
        ->get();  // Mengambil data dengan filter yang sudah ditentukan

    return response()->json($data);
}

  public function datadetailruanganadmin()
{
        $data = PenjadwalanRuangan::with('mahasiswa','mahasiswa.jurusan', 'matakuliah','matakuliah.kurikulum','prodi','tahunajaran','adminjurusan','dosen','ruangan','kelas')
    ->whereIn('statuspeminjaman', ['dipinjam', 'prosespengembalian'])
        ->get();  // Mengambil data dengan filter yang sudah ditentukan

    return response()->json($data);
}

// Laravel Controller
public function getProdiByJurusan($jurusanId) {
    $prodi = Prodi::where('id_jurusan', $jurusanId)->get();
    return response()->json($prodi);
}

public function index()
{
    $data = PenjadwalanRuangan::with(
        'mahasiswa',
        'mahasiswa.jurusan',
        'matakuliah',
        'matakuliah.kurikulum',
        'prodi',
        'tahunajaran',
        'adminjurusan',
        'dosen',
        'ruangan',
        'kelas'
    )
    ->whereHas('tahunajaran', function ($query) {
        $query->where('is_aktif', 1);
    })
    ->get();

    return response()->json($data);
}
    public function indexMahasiswa()
{
        $data = PenjadwalanRuangan::with('mahasiswa','mahasiswa.jurusan', 'matakuliah','prodi','tahunajaran','adminjurusan','dosen','ruangan','kelas')
        ->get();

    return response()->json($data);
}

public function pinjamJadwal(Request $request, $id)
{
    $user = $request->user();

    if (!$user || $user->role !== 'mahasiswa') {
        return response()->json(['message' => 'Akses ditolak.'], 403);
    }

    // Validasi input
    $request->validate([
        'statuspeminjaman' => 'required|string|in:dipinjam,belumdipinjam',
    ]);

    // Ambil jadwal
    $jadwal = PenjadwalanRuangan::with('ruangan', 'tahunajaran')->find($id);

    if (!$jadwal) {
        return response()->json(['message' => 'Jadwal tidak ditemukan.'], 404);
    }

    // Cek kepemilikan
    if ($jadwal->mahasiswa_id !== $user->id) {
        return response()->json(['message' => 'Anda tidak memiliki akses ke jadwal ini.'], 403);
    }

    // Pastikan tahun ajaran aktif
    if (!$jadwal->tahunajaran || !$jadwal->tahunajaran->is_aktif) {
        return response()->json(['message' => 'Tahun ajaran tidak aktif.'], 400);
    }

    // Cek status peminjaman
    if (in_array($jadwal->statuspeminjaman, ['dipinjam', 'prosespengembalian'])) {
        return response()->json(['message' => 'Jadwal sudah dipinjam atau sedang dikembalikan.'], 400);
    }

    // Cek hari dan waktu
    $hariSekarang = strtolower(now()->locale('id')->isoFormat('dddd'));
    $hariJadwal = strtolower($jadwal->hari);

    if ($hariSekarang !== $hariJadwal) {
        return response()->json(['message' => 'Hari ini bukan jadwal perkuliahan tersebut.'], 400);
    }

    $now = now();
try {
    $jamMulai = Carbon::createFromFormat('H:i:s', $jadwal->jammulai);
} catch (\Exception $e) {
    $jamMulai = Carbon::createFromFormat('H:i', $jadwal->jammulai);
}
    $waktuBolehPinjam = $jamMulai->copy()->subMinutes(5);

    // Cek status ruangan (jika ada)
    if ($jadwal->ruangan) {
        if (in_array($jadwal->ruangan->statusruangan, ['dipinjam', 'diperbaiki'])) {
            return response()->json([
                'message' => 'Ruangan sedang ' . $jadwal->ruangan->statusruangan . ', tidak bisa dipinjam.',
            ], 400);
        }
    }

    // Simpan status
    $jadwal->statuspeminjaman = 'dipinjam';
    $jadwal->save();

    // Update status ruangan jika ada
    if ($jadwal->ruangan) {
        $jadwal->ruangan->statusruangan = 'dipinjam';
        $jadwal->ruangan->save();
    }

    return response()->json([
        'message' => 'Jadwal berhasil dipinjam.',
        'jadwal' => $jadwal,
    ]);
}        
public function kembalikansesuaijadwal(Request $request, $id)
{
    $request->validate([
        'link_drive' => 'required|url|max:255',
    ]);

    $pengajuan = PenjadwalanRuangan::findOrFail($id);
    $pengajuan->statusuploadvidio = $request->link_drive;
    $pengajuan->statuspeminjaman = 'prosespengembalian';
    $pengajuan->save();

    return response()->json(['message' => 'Pengembalian berhasil diproses.']);
}

public function updateRuangan(Request $request, $id)
{
$ruanganId = $request->ruangan_id;
$hari = $request->hari;
$jamMulai = $request->jammulai;
$jamSelesai = $request->jamselesai;

$bentrok = PenjadwalanRuangan::where('ruangan_id', $ruanganId)
    ->where('hari', $hari)
    ->where('id', '!=', $id) // penting saat update
    ->where(function($query) use ($jamMulai, $jamSelesai) {
        $query->whereBetween('jammulai', [$jamMulai, $jamSelesai])
              ->orWhereBetween('jamselesai', [$jamMulai, $jamSelesai])
              ->orWhere(function($q) use ($jamMulai, $jamSelesai) {
                  $q->where('jammulai', '<=', $jamMulai)
                    ->where('jamselesai', '>=', $jamSelesai);
              });
    })
    ->exists();

if ($bentrok) {
    return response()->json(['error' => 'Ruangan sudah dijadwalkan pada waktu tersebut'], 422);
}

    $jadwal = PenjadwalanRuangan::findOrFail($id);
    $jadwal->ruangan_id = $ruanganId;
    $jadwal->save();

    return response()->json(['message' => 'Ruangan berhasil diperbarui'], 200);
}
public function getRuanganDipakai(Request $request)
{
    $hari = $request->hari;
    $jamMulai = $request->jammulai;
    $jamSelesai = $request->jamselesai;

    $ruanganTerpakai = PenjadwalanRuangan::where('hari', $hari)
        ->where(function($query) use ($jamMulai, $jamSelesai) {
            $query->where('jammulai', '<', $jamSelesai)
                  ->where('jamselesai', '>', $jamMulai);
        })
        ->pluck('ruangan_id');

    return response()->json([
        'ruangan_terpakai' => $ruanganTerpakai,
    ]);
}

    public function indexpenjadwalanruangan()
    {
        $penjadwalanGanjil = PenjadwalanRuangan::with('mahasiswa','mahasiswa.jurusan', 'matakuliah','prodi','tahunajaran','adminjurusan','dosen','ruangan','kelas')
            ->get();
        return response()->json($penjadwalanGanjil);
    }

public function storePenjadwalanRuangan(Request $request)
{
    $jadwalList = $request->input('jadwal');
    $errors = [];

    foreach ($jadwalList as $index => $item) {
        // Validasi tiap jadwal
        $validator = Validator::make($item, [
            'mahasiswa_id' => 'required|integer|exists:users,id',
            'hari' => 'required|string|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jammulai' => 'required|date_format:H:i',
            'jamselesai' => 'required|date_format:H:i|after:jammulai',
            'kodematakuliah' => 'required|string|exists:matakuliahs,kodematakuliah',
            'kebutuhankelas' => 'required|string|max:255',
            'prodi_id' => 'required|integer|exists:prodis,id',
            'tahunajaran_id' => 'required|integer|exists:tahunajarans,id',
            'adminjurusan_id' => 'required',
            'dosen_id' => 'required|integer|exists:dosens,id',
            'kelas_id' => 'required|integer|exists:kelas,id',
        ]);

        if ($validator->fails()) {
            $errors[$index] = $validator->errors()->all();
            continue;
        }

        // Cek konflik jadwal
        $conflict = PenjadwalanRuangan::where('kelas_id', $item['kelas_id'])
            ->where('hari', $item['hari'])
            ->where(function ($query) use ($item) {
                $query->where('jammulai', '<', $item['jamselesai'])
                    ->where('jamselesai', '>', $item['jammulai']);
            })
            ->exists();

        if ($conflict) {
            $errors[$index] = ['Kelas ini sudah memiliki jadwal lain di hari dan jam yang sama.'];
            continue;
        }

        // Simpan jika tidak error
        PenjadwalanRuangan::create($item);
    }

    if (!empty($errors)) {
        return response()->json([
            'message' => 'Beberapa jadwal gagal disimpan.',
            'errors' => $errors,
        ], 422);
    }

    return response()->json([
        'message' => 'Semua jadwal berhasil disimpan.',
    ], 201);
}
// Controller Laravel (metode baru)
public function cekBentrokJadwalForm(Request $request)
{
    $jadwals = $request->input('jadwals');
    $bentrok = [];

    foreach ($jadwals as $index => $jadwal) {
        $cek = PenjadwalanRuangan::where('kelas_id', $jadwal['kelas_id'])
            ->where('hari', $jadwal['hari'])
            ->where(function ($query) use ($jadwal) {
                $query->where('jammulai', '<', $jadwal['jamselesai'])
                    ->where('jamselesai', '>', $jadwal['jammulai']);
            })
            ->exists();

        if ($cek) {
            $bentrok[] = $index;
        }
    }

    return response()->json(['bentrok' => $bentrok]);
}

    public function updatePenjadwalanRuangan(Request $request, $id)
{
    $jadwal = PenjadwalanRuangan::find($id);

    if (!$jadwal) {
        return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);
    }

    $validated = $request->validate([
            'mahasiswa_id' => 'required|integer|exists:users,id',
            'hari' => 'required|string|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu',
            'jammulai' => 'required|date_format:H:i',
            'jamselesai' => 'required|date_format:H:i|after:jammulai',
            'kodematakuliah' => 'required|string|exists:matakuliahs,kodematakuliah',
            'kebutuhankelas' => 'required|string|max:255',
            'prodi_id' => 'required|integer|exists:prodis,id',
            'tahunajaran_id' => 'required|integer|exists:tahunajarans,id',
            'adminjurusan_id' => 'required',
            'dosen_id' => 'required|integer|exists:dosens,id', // ✅ Tambahkan ini
            'kelas_id' => 'required|integer|exists:kelas,id', // ✅ Tambahkan ini
    ]);

    $jadwal->update($validated);

    return response()->json([
        'message' => 'Jadwal ruangan semester ganjil berhasil diperbarui',
        'data' => $jadwal,
    ]);
}

    public function show($id) //Menampilkan detail lengkap satu pengajuan (dengan relasi lengkap: mahasiswa, dosen, matakuliah, ruangan, dst).
{
    $jadwal = PenjadwalanRuangan::with([
        'mahasiswa','mahasiswa.jurusan','mahasiswa.prodi', 'matakuliah','matakuliah.tahunajaran','matakuliah.kurikulum','prodi','tahunajaran','adminjurusan','dosen','ruangan','kelas','dosen.prodi'
    ])->find($id);

    if (!$jadwal) {
        return response()->json(['message' => 'Data tidak ditemukan'], 404);
    }

return response()->json([
    'data' => $jadwal
]);
}
public function destroy($id)
{
    $jadwal = PenjadwalanRuangan::find($id);
    if (!$jadwal) {
        return response()->json(['message' => 'Data tidak ditemukan'], 404);
    }

    $jadwal->delete();
    return response()->json(['message' => 'Data berhasil dihapus']);
}

public function kirimKeMahasiswa(Request $request)
{
    $adminJurusan = $request->user(); // dapatkan user yang sedang login

    if (!$adminJurusan) {
        return response()->json(['message' => 'User tidak ditemukan atau belum login.'], 401);
    }

$jadwals = PenjadwalanRuangan::where('adminjurusan_id', $adminJurusan->id)
    ->where('statusterkirim', 'belumterkirim')
    ->whereNotNull('ruangan_id') // ⬅️ hanya jadwal dengan ruangan
    ->get();

    if ($jadwals->isEmpty()) {
        return response()->json([
            'message' => 'Tidak ada jadwal yang perlu dikirim.'
        ], 404);
    }

    foreach ($jadwals as $jadwal) {
        $jadwal->update(['statusterkirim' => 'terkirim']);
    }

    return response()->json([
        'message' => 'Jadwal berhasil dikirim ke mahasiswa.',
        'jumlah_terkirim' => $jadwals->count(),
    ]);
    }
    public function tolakVideoPengembalian($id)
    {
    $jadwal = PenjadwalanRuangan::find($id);

    if (!$jadwal) {
        return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);
    }

    // Update status sesuai permintaan
    $jadwal->statuspeminjaman = 'dipinjam';
    $jadwal->statusuploadvidio = 'pending';
    $jadwal->save();

    return response()->json([
        'message' => 'Video pengembalian berhasil ditolak dan status diperbarui.',
        'jadwal' => $jadwal,
    ]);
}
public function updateStatus(Request $request, $id)
{
    $validatedData = $request->validate([
        'statusuploadvidio' => 'required|string',
        'statuspeminjaman' => 'required|string',
    ]);

    $jadwal = PenjadwalanRuangan::find($id);
    if (!$jadwal) {
        return response()->json(['message' => 'Jadwal tidak ditemukan'], 404);
    }

    // Update status pada jadwal
    $jadwal->statusuploadvidio = $validatedData['statusuploadvidio'];
    $jadwal->statuspeminjaman = $validatedData['statuspeminjaman'];
    $jadwal->statusdigunakan = ($jadwal->statusdigunakan ?? 0) + 1;
    $jadwal->save();

    // Jika status peminjaman sekarang bukan "dipinjam", maka ruangan dikosongkan
    if ($validatedData['statuspeminjaman'] !== 'dipinjam' && $jadwal->ruangan_id) {
        DB::table('ruangan_g_k_t_s')
            ->where('id', $jadwal->ruangan_id)
            ->update(['statusruangan' => 'kosong']);
    }

    return response()->json(['message' => 'Status jadwal & ruangan berhasil diperbarui']);
}
    public function tampilsemuaruangan()
    {
        $ruangans = RuanganGKT::all();
        return response()->json($ruangans);
    }
public function getJadwalByRuanganAndHari(Request $request)
{
    $request->validate([
        'hari' => 'required|string',
        'ruangan_id' => 'required|integer',
    ]);

    $hari = $request->input('hari');
    $ruanganId = $request->input('ruangan_id');

    $jadwal = PenjadwalanRuangan::with('kelas') // ← ambil relasi kelas
        ->where('hari', $hari)
        ->where('ruangan_id', $ruanganId)
        ->whereHas('tahunajaran', function ($query) {
            $query->where('is_aktif', 1);
        })
        ->select('id', 'jammulai', 'jamselesai', 'kelas_id','hari') // pastikan ini disertakan
        ->get();

    // Format agar frontend bisa akses nama kelas langsung
    $jadwalFormatted = $jadwal->map(function ($j) {
        return [
            'id' => $j->id,
            'jammulai' => $j->jammulai,
            'jamselesai' => $j->jamselesai,
            'nama' => optional($j->kelas)->nama, // ← ini nama kelasnya
            'hari' => $j->hari, // ← tambahkan ini
        ];
    });

    return response()->json($jadwalFormatted);
    }
public function jadwalHarian($id, Request $request)
{
    $hari = $request->query('hari');

    $jadwal = PenjadwalanRuangan::with(['kelas', 'tahunAjaran']) // pastikan relasi tahunAjaran ada
        ->where('ruangan_id', $id)
        ->where('hari', $hari)
        ->where('statusterkirim', 'terkirim')
        ->whereHas('tahunAjaran', function ($query) {
            $query->where('is_aktif', 1);
        })
        ->orderBy('jammulai')
        ->get();

    return response()->json($jadwal);
}
}