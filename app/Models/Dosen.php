<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dosen extends Model
{
    use HasFactory;

    protected $table = 'dosens';

    protected $fillable = [
        'nama',
        'nip',
        'notelpon',
        'email',
        'prodi_id',
        'adminjurusan_id',
        'jabatanfungsional',
    ];
    public function prodi()
    {
        return $this->belongsTo(Prodi::class, 'prodi_id', 'id');
    }
    public function adminjurusan()
    {
    return $this->belongsTo(User::class, 'adminjurusan_id')->where('role', 'admin_jurusan');
    }
        public function peminjamanSelesai()
    {
        return $this->hasMany(peminjamanselesaisesuaijdwal::class, 'dosen', 'kodematakuliah');
    }

}