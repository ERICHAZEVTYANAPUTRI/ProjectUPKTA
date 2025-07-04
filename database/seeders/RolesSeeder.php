<?php

namespace Database\Seeders;

use App\Models\Mahasiswa;
use App\Models\AdminJurusan;
use App\Models\PengelolaGkt;
use Illuminate\Database\Seeder;
use App\Models\AdminPengelolaGkt;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolesSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'username' => 'admingkt01',
            'nip_nik_nipppk' => '1234567890',
            'password' => Hash::make('1'),
            'jabatan' => 'AdministratorPengelolaRuangan',
            'nama_lengkap' => 'Administrator GKT 01',
        ]);
    }}