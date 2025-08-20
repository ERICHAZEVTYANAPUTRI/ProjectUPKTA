<?php

namespace App\Http\Controllers;

use App\Models\Jurusan;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TahunAjaranController extends Controller
{
    public function index()
    {
        $tahunajarans = TahunAjaran::with('adminjurusan')->get();
        return response()->json(data: $tahunajarans);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'admin_jurusan') {
            return response()->json(['message' => 'Akses ditolak. Hanya admin jurusan yang bisa menambah tahun ajaran.'], 403);
        }

        $jurusan = Jurusan::where('kodejurusan', $user->kodejurusan)->first();

        if (!$jurusan) {
            return response()->json(['message' => 'Jurusan tidak ditemukan.'], 404);
        }

        $request->validate([
            'tahun' => [
                'required',
                'string',
                Rule::unique('tahunajarans')->where(function ($query) use ($user, $request) {
                    return $query->where('adminjurusan_id', $user->id)
                        ->where('semester', strtolower($request->semester));
                }),
            ],
            'semester' => ['required', Rule::in(['ganjil', 'genap'])],
        ]);

        $tahunAjaran = TahunAjaran::create([
            'tahun' => $request->tahun,
            'semester' => strtolower($request->semester),
            'adminjurusan_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'Tahun ajaran berhasil ditambahkan.',
            'tahunajaran' => $tahunAjaran
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'tahun' => 'required|regex:/^\d{4}\/\d{4}$/',
            'semester' => 'required|in:ganjil,genap',
        ]);

        $tahunAjaran = TahunAjaran::findOrFail($id);
        $tahunAjaran->tahun = $request->tahun;
        $tahunAjaran->semester = $request->semester;
        $tahunAjaran->save();

        return response()->json(['message' => 'Tahun ajaran berhasil diperbarui']);
    }

    public function show($id)
    {
        $tahunAjaran = TahunAjaran::find($id);
        if (!$tahunAjaran) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $tahunParts = explode('/', $tahunAjaran->tahun);

        if (count($tahunParts) !== 2) {
            return response()->json(['message' => 'Format tahun tidak valid'], 422);
        }

        $tahun_awal = (int) $tahunParts[0];
        $tahun_akhir = (int) $tahunParts[1];

        return response()->json([
            'id' => $tahunAjaran->id,
            'tahun' => $tahunAjaran->tahun,
            'semester' => $tahunAjaran->semester,
            'tahun_awal' => $tahun_awal,
            'tahun_akhir' => $tahun_akhir,
            'adminjurusan_id' => $tahunAjaran->adminjurusan_id,
            'created_at' => $tahunAjaran->created_at,
            'updated_at' => $tahunAjaran->updated_at,
        ]);
    }

    public function destroy($id)
    {
        $tahunAjaran = TahunAjaran::findOrFail($id);
        $tahunAjaran->delete();

        return response()->json(['message' => 'Data tahun ajaran berhasil dihapus']);
    }
    public function toggleStatus(Request $request, $id)
    {
        $tahunAjaran = TahunAjaran::findOrFail($id);
        $tahunAjaran->is_aktif = $request->is_aktif;
        $tahunAjaran->save();

        return response()->json(['message' => 'Status updated successfully.']);
    }
}
