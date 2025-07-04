<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prodi extends Model
{
    use HasFactory;

    protected $table = 'prodis';

    protected $fillable = [
        'kodeprodi',
        'namaprodi',
        'id_jurusan',
        'adminjurusan_id',
    ];
    public function jurusan()
    {
    return $this->belongsTo(Jurusan::class, 'id_jurusan');
    }
    public function penjadwalans()
    {
    return $this->hasMany(PenjadwalanRuangan::class, 'prodi_id', 'id');
    }
    public function users()
    {
    return $this->hasMany(User::class, 'prodi', 'id');
    }
    public function dosens()
    {
    return $this->hasMany(Dosen::class, 'prodi_id', 'id');
    }
    public function adminjurusan()
    {
    return $this->belongsTo(User::class, 'adminjurusan_id')->where('role', 'admin_jurusan');
    }
    public function peminjamanSelesai()
    {
        return $this->hasMany(peminjamanselesaisesuaijdwal::class, 'prodi_id', 'id');
    }

}