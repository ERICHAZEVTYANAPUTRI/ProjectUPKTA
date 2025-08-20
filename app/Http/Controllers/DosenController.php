<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Dosen;
use App\Models\Jurusan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;

class DosenController extends Controller
{
    public function index()
    {
        $dosens = Dosen::with('prodi', 'adminjurusan')->get();
        return response()->json($dosens);
    }

    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'admin_jurusan') {
            return response()->json(['message' => 'Akses ditolak. Hanya admin jurusan yang bisa menambah dosen.'], 403);
        }

        $jurusan = Jurusan::where('kodejurusan', $user->kodejurusan)->first();

        if (!$jurusan) {
            return response()->json(['message' => 'Jurusan tidak ditemukan.'], 404);
        }

        $request->validate([
            'nama' => 'required|string|max:255',
            'prodi_id' => 'required|exists:prodis,id',
            'nip' => 'required|string|max:50',
            'notelpon' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'jabatanfungsional' => 'nullable|string',
        ]);

        $duplicate = Dosen::where('adminjurusan_id', $user->id)
            ->where(function ($query) use ($request) {
                $query->where('nama', $request->nama)
                    ->orWhere('nip', $request->nip)
                    ->orWhere('notelpon', $request->notelpon)
                    ->orWhere('email', $request->email);
            })->exists();

        if ($duplicate) {
            return response()->json([
                'message' => 'Nama, NIP, No Telpon, atau Email sudah terdaftar di bawah admin jurusan yang sama.',
            ], 422);
        }

        $dosen = Dosen::create([
            'nama' => $request->nama,
            'prodi_id' => $request->prodi_id,
            'nip' => $request->nip,
            'notelpon' => $request->notelpon,
            'email' => $request->email,
            'jabatanfungsional' => $request->jabatanfungsional,
            'adminjurusan_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'Dosen berhasil ditambahkan.',
            'data' => $dosen,
        ], 201);
    }

    public function show($id)
    {
        try {
            $dosen = Dosen::findOrFail($id);
            return response()->json($dosen, 200);
        } catch (Exception $e) {
            return response()->json(['error' => 'Dosen not found.'], 404);
        }
    }


    public function update(Request $request, $id)
    {
        $user = auth()->user();

        if (!$user || $user->role !== 'admin_jurusan') {
            return response()->json(['message' => 'Akses ditolak. Hanya admin jurusan yang bisa mengubah dosen.'], 403);
        }

        $dosen = Dosen::find($id);
        if (!$dosen) {
            return response()->json(['message' => 'Dosen tidak ditemukan.'], 404);
        }

        $request->validate([
            'nama' => 'required|string|max:255',
            'prodi_id' => 'required|exists:prodis,id',
            'nip' => 'required|string|max:50',
            'notelpon' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:100',
            'jabatanfungsional' => 'nullable|string',
        ]);

        $duplicate = Dosen::where('adminjurusan_id', $user->id)
            ->where('id', '!=', $dosen->id)
            ->where(function ($query) use ($request) {
                $query->where('nama', $request->nama)
                    ->orWhere('nip', $request->nip)
                    ->orWhere('notelpon', $request->notelpon)
                    ->orWhere('email', $request->email);
            })->exists();

        if ($duplicate) {
            return response()->json([
                'message' => 'Nama, NIP, No Telpon, atau Email sudah digunakan oleh dosen lain di bawah admin jurusan yang sama.',
            ], 422);
        }

        $dosen->update([
            'nama' => $request->nama,
            'prodi_id' => $request->prodi_id,
            'nip' => $request->nip,
            'notelpon' => $request->notelpon,
            'email' => $request->email,
            'jabatanfungsional' => $request->jabatanfungsional,
            'adminjurusan_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'Dosen berhasil diperbarui.',
            'data' => $dosen,
        ]);
    }
    public function destroy($id)
    {
        try {
            $dosen = Dosen::findOrFail($id);
            $dosen->delete();

            return response()->json(['message' => 'Dosen deleted successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete dosen.'], 500);
        }
    }
}
