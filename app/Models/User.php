<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use App\Models\peminjamanselesaisesuaijdwal;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

        protected static function boot()
    {
        parent::boot();

        static::deleting(function ($user) {
            if ($user->role === 'admin_jurusan') {
                // Hapus jurusan yang punya kodejurusan sama dengan user ini
                \App\Models\Jurusan::where('kodejurusan', $user->kodejurusan)->delete();
            }
        });
    }
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'foto',
        'username',
        'nama_lengkap',
        'prodi_id',
        'kelas_id',
        'nim',
        'smester',
        'jabatan',
        'nip_nik_nipppk',
        'kodejurusan',
        'jurusan',
        'jurusanmahasiswa_id',
        'notlp',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function isRole($role)
    {
        return $this->role === $role;
    }

    public function getFullNameAttribute()
    {
        return $this->nama_lengkap ?: $this->username;
    }


    public function getFotoUrlAttribute()
    {
        return asset('storage/' . $this->foto);
    }
    public function penjadwalansSebagaiMahasiswa()
    {
    return $this->hasMany(PenjadwalanRuangan::class, 'mahasiswa_id','id');
    }
    public function penjadwalansSebagaiAdmin()
    {
    return $this->hasMany(PenjadwalanRuangan::class, 'adminjurusan_id','id');
    }
    public function prodi()
    {
    return $this->belongsTo(Prodi::class, 'prodi_id', 'id');
    }
    public function jurusan()
    {
    return $this->belongsTo(Jurusan::class, 'jurusanmahasiswa_id', 'id');
    }
    public function kelas()
    {
    return $this->belongsTo(kelas::class, 'kelas_id', 'id');
    }

    public function dosens()
    {
    return $this->hasMany(Dosen::class, 'adminjurusan_id', 'id');
    }
    public function prodis()
    {
    return $this->hasMany(Prodi::class, 'adminjurusan_id', 'id');
    }
    public function matakuliahs()
    {
    return $this->hasMany(Matakuliah::class, 'adminjurusan_id', 'id');
    }
    public function kurikulums()
    {
    return $this->hasMany(Kurikulum::class, 'adminjurusan_id', 'id');
    }
    public function tahunajarans()
    {
    return $this->hasMany(TahunAjaran::class, 'adminjurusan_id', 'id');
    }
    public function peminjamanSelesaimahasiswa()
    {
        return $this->hasMany(peminjamanselesaisesuaijdwal::class, 'mahasiswa_id', 'id');
    }
    public function peminjamanSelesai()
    {
        return $this->hasMany(peminjamanselesaisesuaijdwal::class, 'adminjurusan_id', 'id');
    }

}