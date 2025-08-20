<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserPengelolaController extends Controller
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
            'nip_nik_nipppk' => 'required',
            'password' => 'required|min:1',
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'jabatan' => $validated['jabatan'],
            'nama_lengkap' => $validated['nama_lengkap'],
            'nip_nik_nipppk' => $validated['nip_nik_nipppk'],
            'password' => bcrypt($validated['password']),
            'role' => 'pengelola_gkt',
        ]);

        return response()->json($user, 201);
    }

    public function updatePengelola(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255',
            'nama_lengkap' => 'required|string|max:255',
            'jabatan' => 'required|string|max:255',
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
            $user->username = $request->input('username');
            $user->nama_lengkap = $request->input('nama_lengkap');
            $user->jabatan = $request->input('jabatan');
            $user->nip_nik_nipppk = $request->input('nip_nik_nipppk');

            if ($user->role != 'pengelola_gkt') {
                $user->kodejurusan = $request->input('kodejurusan');
                $user->jurusan = $request->input('jurusan');
            }

            if ($request->has('password') && !empty($request->input('password'))) {
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

            return response()->json([
                'message' => 'User updated successfully!',
                'data' => $user,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update user. Please try again.',
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
            $user->delete();
            return response()->json(['message' => 'User deleted successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error: ' . $e->getMessage()], 500);
        }
    }
}
