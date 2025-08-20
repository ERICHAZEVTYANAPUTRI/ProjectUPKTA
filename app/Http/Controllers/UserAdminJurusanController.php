<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Jurusan;
use App\Models\SmesterGenap;
use Illuminate\Http\Request;
use App\Models\SmesterGanjil;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserAdminJurusanController extends Controller
{
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|unique:users,username',
            'nama_lengkap' => 'required',
            'jabatan' => 'required',
            'jurusan' => 'required',
            'kodejurusan' => 'required',
            'nip_nik_nipppk' => 'required',
            'password' => 'required|min:1',
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'jabatan' => $validated['jabatan'],
            'kodejurusan' => $validated['kodejurusan'],
            'jurusan' => $validated['jurusan'],
            'nama_lengkap' => $validated['nama_lengkap'],
            'nip_nik_nipppk' => $validated['nip_nik_nipppk'],
            'password' => bcrypt($validated['password']),
            'role' => 'admin_jurusan',
        ]);

        Jurusan::create([
            'kodejurusan' => $validated['kodejurusan'],
            'namajurusan' => $validated['jurusan'],
        ]);

        return response()->json($user, 201);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255',
            'nama_lengkap' => 'required|string|max:255',
            'jabatan' => 'required|string|max:255',
            'kodejurusan' => 'required|string|max:255',
            'jurusan' => 'required|string|max:255',
            'nip_nik_nipppk' => 'required|string|max:255',
            'password' => 'nullable|string|min:1',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // max 2MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => $validator->errors(),
            ], 422);
        }

        try {
            $user = User::findOrFail($id);

            DB::transaction(function () use ($request, $user) {
                $kodeLama = $user->getOriginal('kodejurusan');
                $kodeBaru = $request->input('kodejurusan');
                $namaJurusanBaru = $request->input('jurusan');

                if ($user->role === 'admin_jurusan') {
                    $jurusan = Jurusan::where('kodejurusan', $kodeLama)->first();

                    if (!$jurusan) {
                        throw new \Exception("Data jurusan dengan kode '$kodeLama' tidak ditemukan.");
                    }

                    if ($kodeLama !== $kodeBaru) {
                        $cekKodeBaru = Jurusan::where('kodejurusan', $kodeBaru)->first();
                        if ($cekKodeBaru) {
                            throw new \Exception("Kode jurusan '$kodeBaru' sudah digunakan oleh jurusan lain.");
                        }
                    }

                    $jurusan->kodejurusan = $kodeBaru;
                    $jurusan->namajurusan = $namaJurusanBaru;
                    $jurusan->save();
                }

                $user->username = $request->input('username');
                $user->nama_lengkap = $request->input('nama_lengkap');
                $user->jabatan = $request->input('jabatan');
                $user->kodejurusan = $kodeBaru;
                $user->jurusan = $namaJurusanBaru;
                $user->nip_nik_nipppk = $request->input('nip_nik_nipppk');

                if ($request->filled('password')) {
                    $user->password = Hash::make($request->input('password'));
                }
                if ($request->hasFile('foto')) {
                    $file = $request->file('foto');

                    $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                    if (!in_array($file->getMimeType(), $allowedMimeTypes)) {
                        return response()->json([
                            'error' => 'Format foto tidak didukung. Harap upload JPG atau PNG.',
                        ], 422);
                    }

                    $path = $file->store('foto_users', 'public');

                    $user->foto = $path;
                }
                $user->save();
            });

            return response()->json([
                'message' => 'User dan data Jurusan berhasil diperbarui.',
                'data' => $user,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Gagal memperbarui user.',
                'detail' => $e->getMessage(),
            ], 500);
        }
    }
    public function show($id)
    {
        try {
            $user = User::findOrFail($id);
            return response()->json($user, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'User not found.'], 404);
        }
    }
    public function destroy($id)
    {
        try {
            $user = User::find($id);
            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            $jurusan = Jurusan::where('kodejurusan', $user->kodejurusan)->first();
            if ($jurusan) {
                $jurusan->delete();
            }

            $user->delete();

            return response()->json(['message' => 'User and related jurusan deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error: ' . $e->getMessage()], 500);
        }
    }
}
