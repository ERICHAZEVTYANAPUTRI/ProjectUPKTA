<?php

namespace App\Http\Controllers;

use App\Models\kelas;
use App\Models\Jurusan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class KelasController extends Controller
{
    public function index(Request $request)
    {
        $query = Kelas::with(['prodi', 'adminjurusan']);

        if ($request->has('adminjurusan_id')) {
            $query->where('adminjurusan_id', $request->adminjurusan_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'admin_jurusan') {
            return response()->json(['message' => 'Akses ditolak. Hanya admin jurusan yang bisa menambah kelas.'], 403);
        }

        $jurusan = Jurusan::where('kodejurusan', $user->kodejurusan)->first();

        if (!$jurusan) {
            return response()->json(['message' => 'Jurusan tidak ditemukan.'], 404);
        }

        $request->validate([
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('kelas')->where(function ($query) use ($user) {
                    return $query->where('adminjurusan_id', $user->id);
                }),
            ],
            'prodi_id' => 'required|exists:prodis,id',
        ]);

        $kelas = kelas::create([
            'nama' => $request->nama,
            'prodi_id' => $request->prodi_id,
            'adminjurusan_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'Kelas berhasil ditambahkan.',
            'data' => $kelas,
        ], 201);
    }
    public function update(Request $request, $id)
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'admin_jurusan') {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $kelas = Kelas::find($id);

        if (!$kelas) {
            return response()->json(['message' => 'Kelas tidak ditemukan'], 404);
        }

        $request->validate([
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('kelas')->ignore($id)->where(function ($query) use ($user, $request) {
                    return $query
                        ->where('adminjurusan_id', $user->id)
                        ->where('prodi_id', $request->prodi_id);
                }),
            ],
            'prodi_id' => 'required|exists:prodis,id',
        ]);

        $kelas->nama = $request->nama;
        $kelas->prodi_id = $request->prodi_id;
        $kelas->save();

        return response()->json(['message' => 'Kelas berhasil diperbarui']);
    }

    public function show($id)
    {
        $kelas = Kelas::with(['prodi', 'adminjurusan'])->findOrFail($id);
        return response()->json($kelas);
    }
    public function destroy($id)
    {
        $kelas = Kelas::findOrFail($id);
        $kelas->delete();

        return response()->json(['message' => 'Kelas berhasil dihapus']);
    }
}
