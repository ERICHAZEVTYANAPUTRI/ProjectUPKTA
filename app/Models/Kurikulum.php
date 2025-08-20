<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Kurikulum extends Model
{
    use HasFactory;

    protected $table = 'kurikulums';

    protected $fillable = [
        'prodi_id',
        'nama',
        'tahun_mulai',
        'tahun_selesai',
        'is_aktif',
        'total_sks',
        'deskripsi',
        'adminjurusan_id',
    ];

    public function prodi()
    {
        return $this->belongsTo(Prodi::class, 'prodi_id', 'id');
    }

    public function matakuliahs()
    {
        return $this->hasMany(Matakuliah::class, 'kurikulum_id', 'id');
    }
    public function adminjurusan()
    {
        return $this->belongsTo(User::class, 'adminjurusan_id')->where('role', 'admin_jurusan');
    }
}
