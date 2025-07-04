<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Models\Mahasiswa;
use App\Models\AdminJurusan;
use App\Models\PengelolaGkt;
use Illuminate\Http\Request;
use App\Models\AdminPengelolaGkt;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\PenanggungJawabMatakuliah;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);
        $username = $request->username;
        $password = $request->password;
        $user = User::where('username', $username)->first();
        if (!$user) {
            $user = User::where('username', $username)->first();
        }
        if (!$user) {
            $user = User::where('username', $username)->first();
        }
        if (!$user) {
            $user = User::where('username', $username)->first();
        }
        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }
        $token = $user->createToken('YourApp')->plainTextToken;
        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'role' => $user->role,
            'username' => $user->username,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|string|unique:users,username',
            'nama_lengkap' => 'required',
            'nim' => 'required|string|unique:users,nim',
            'password' => 'required|string|min:1',
        ]);

        $user = User::create([
            'username' => $request->username,
            'nama_lengkap' => $request->nama_lengkap,
            'nim' => $request->nim,
            'password' => Hash::make($request->password),
            'role' => 'mahasiswa',
        ]);

        $token = $user->createToken('YourApp')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'token' => $token,
            'role' => $user->role,
        ], 201);
    }
    public function update(Request $request)
    {
        $loggedInUser = auth()->user();
        $validationRules = $this->getValidationRulesForRole($loggedInUser->role);
        $request->validate($validationRules);

        try {
            $user = $this->getUserByRole($loggedInUser->role, $loggedInUser->id);
            if (!$user) {
                return response()->json([
                    'message' => 'User not found'
                ], 404);
            }
            $this->updateUserData($user, $request);
            $user->save();

            return response()->json([
                'message' => 'User profile updated successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating user profile: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while updating the user profile'
            ], 500);
        }
    }

    private function getValidationRulesForRole($role)
    {
        switch ($role) {
            case 'admin_pengelola_gkt':
                return [
                    'username' => 'required|string|max:255|unique:users,username,' . auth()->id(),
                    'nama_lengkap' => 'required|string|max:255',
                    'password' => 'nullable|string|min:1',
                    'foto' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
                    'jabatan' => 'required|string|max:255',
                    'nip_nik_nipppk' => 'required|string|max:255',
                ];
            case 'pengelola_gkt':
                return [
                    'username' => 'required|string|max:255|unique:users,username,' . auth()->id(),
                    'nama_lengkap' => 'required|string|max:255',
                    'password' => 'nullable|string|min:1',
                    'foto' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
                    'jabatan' => 'required|string|max:255',
                ];
            case 'mahasiswa':
                return [
                    'username' => 'required|string|max:255|unique:users,username,' . auth()->id(),
                    'nama_lengkap' => 'required|string|max:255',
                    'password' => 'nullable|string|min:1',
                    'foto' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
                    'prodi' => 'required|string|max:255',
                    'kelas' => 'required|string|max:255',
                    'nim' => 'required|string|max:255',
                    'notlp' => 'nullable|string|max:15',
                ];
            default:
                return [];
        }
    }

    private function getUserByRole($role, $id)
    {
        switch ($role) {
            case 'admin_pengelola_gkt':
                return User::find($id);
            case 'pengelola_gkt':
                return User::find($id);
            case 'mahasiswa':
                return User::find($id);
            default:
                return null;
        }
    }

    private function updateUserData($user, $request)
    {
        $user->username = $request->username;
        $user->nama_lengkap = $request->nama_lengkap;
        if ($request->password) {
            $user->password = Hash::make($request->password);
        }
        if ($request->hasFile('foto')) {
            $image = $request->file('foto');
            $imagePath = $image->store('profile_pictures', 'public');
            $user->foto = $imagePath;
        }
        if ($user instanceof User) {
            $user->jabatan = $request->jabatan;
            $user->nip_nik_nipppk = $request->nip_nik_nipppk;
        }
        if ($user instanceof User) {
            $user->jabatan = $request->jabatan;
        }
        if ($user instanceof User) {
            $user->prodi = $request->prodi;
            $user->kelas = $request->kelas;
            $user->nim = $request->nim;
            $user->notlp = $request->notlp;
        }
    }
        public function logout(Request $request)
    {
        try {
            // Log out user dari API menggunakan token
            Auth::user()->tokens->each(function ($token) {
                $token->delete(); // Menghapus token pengguna
            });

            // Kembalikan respons JSON yang menandakan logout berhasil
            return response()->json(['message' => 'Logout berhasil'], 200);
        } catch (\Exception $e) {
            // Jika ada error, kembalikan respons error
            return response()->json(['error' => 'Terjadi kesalahan saat logout'], 500);
        }
    }

}