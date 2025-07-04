<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserMahasiswaController extends Controller
{
public function index()
{
    $users = User::with(['jurusan', 'prodi', 'kelas'])
        ->where('role', 'mahasiswa')
        ->get();

    return response()->json($users);
}
    public function store(Request $request)
{
    $validated = $request->validate([
        'username' => 'required|unique:users,username',
        'nama_lengkap' => 'required',
        'proram_studi' => 'required',
        'kelas' => 'required',
        'nim' => 'required',
        'no_telepon' => 'required',
        
    ]);

    $user = User::create([
        'username' => $validated['username'],
        'nama_lengkap' => $validated['nama_lengkap'],
        'program_studi' => $validated['program_studi'],
        'kelas' => $validated['kelas'],
        'nim' => $validated['nim'],
        'no_telepon' => $validated['no_telepon'],
        'role' => 'mahasiswa',
    ]);

    return response()->json($user, 201);
}
public function update(Request $request, $id)
{
    $user = User::findOrFail($id);

    $rules = [
        'username' => 'required|string|max:255|unique:users,username,' . $user->id,
        'nama_lengkap' => 'required|string|max:255',
    ];

    if ($user->role === 'mahasiswa') {
        $rules = array_merge($rules, [
            'prodi_id' => 'nullable|integer|exists:prodis,id', // sesuaikan dengan kolom prodi
            'jurusanmahasiswa_id' => 'nullable|integer|exists:jurusans,id', // sesuaikan dengan kolom prodi
            'kelas_id' => 'nullable|integer|exists:kelas,id',
            'nim' => 'nullable|string|max:255|unique:users,nim,' . $user->id,
            'smester' => 'nullable|integer',
            'notlp' => 'nullable|string|min:11|max:13|unique:users,notlp,' . $user->id,
            'foto' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // max 2MB
        ]);
    } else {
        $rules = array_merge($rules, [
            'jabatan' => 'nullable|string|max:255',
            'nip_nik_nipppk' => 'nullable|string|max:255',
            'jurusan' => 'nullable|string|max:255',
            'kodejurusan' => 'nullable|string|max:255',
        ]);
    }

    $validator = Validator::make($request->all(), $rules);

if ($validator->fails()) {
    $errors = $validator->errors()->all(); // Ambil semua pesan error sebagai array

    return response()->json([
        'message' => $errors[0] ?? 'Validasi gagal.', // Ambil pesan pertama
        'errors' => $errors, // Jika butuh semua error di frontend
    ], 422);
}

    try {
        $user->username = $request->input('username');
        $user->nama_lengkap = $request->input('nama_lengkap');

        if ($user->role === 'mahasiswa') {
            $user->prodi_id = $request->input('prodi_id');  // Ganti dari program_studi ke prodi
            $user->jurusanmahasiswa_id = $request->input('jurusanmahasiswa_id');  // Ganti dari program_studi ke prodi
            $user->kelas_id = $request->input('kelas_id');
            $user->nim = $request->input('nim');
            $user->smester = $request->input('smester');
            $user->notlp = $request->input('notlp'); // juga sesuaikan nama kolom no_telepon ke notlp
        } else {
            $user->jabatan = $request->input('jabatan');
            $user->nip_nik_nipppk = $request->input('nip_nik_nipppk');
            $user->jurusan = $request->input('jurusan');
            $user->kodejurusan = $request->input('kodejurusan');
        }if ($request->hasFile('foto')) {
            $file = $request->file('foto');

    // Validasi tipe file dan ukuran (opsional)
    $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!in_array($file->getMimeType(), $allowedMimeTypes)) {
        return response()->json([
            'error' => 'Format foto tidak didukung. Harap upload JPG atau PNG.',
        ], 422);
    }

    // Simpan file ke storage
    $path = $file->store('foto_users', 'public'); // disimpan di storage/app/public/foto_users

    // Simpan path ke kolom foto di database
    $user->foto = $path;
}

        if ($request->has('password') && !empty($request->input('password'))) {
            $user->password = Hash::make($request->input('password'));
        }

        $user->save();

        return response()->json([
            'message' => 'User updated successfully!',
            'data' => $user,
        ], 200);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to update user. Please try again.',
            'exception' => $e->getMessage(),
        ], 500);
    }
}
public function show($id)
{
    try {
        // Load user sekaligus relasi jurusan, prodi, dan kelas
        $user = User::with(['jurusan', 'prodi', 'kelas'])->findOrFail($id);
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
            $user->delete();
            return response()->json(['message' => 'User deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error: ' . $e->getMessage()], 500);
        }
    }
}