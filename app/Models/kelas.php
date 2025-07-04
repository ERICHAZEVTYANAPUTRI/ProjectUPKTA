<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class kelas extends Model
{
    use HasFactory;

    protected $table = 'kelas';

    protected $fillable = [
        'prodi_id',
        'adminjurusan_id',
        'nama',
    ];

    public function prodi()
    {
        return $this->belongsTo(Prodi::class, 'prodi_id', 'id');
    }
        public function adminjurusan()
    {
    return $this->belongsTo(User::class, 'adminjurusan_id')->where('role', 'admin_jurusan');
    }
}