<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Jurusan extends Model
{
    use HasFactory;

    protected $table = 'jurusans';

    protected $fillable = [
        'kodejurusan',
        'namajurusan',
    ];
    public function prodis()
    {
        return $this->hasMany(Prodi::class, 'id_jurusan');
    }
    public function users()
    {
        return $this->hasMany(User::class, 'jurusanmahasiswa_id', 'id')
            ->where('role', 'mahasiswa');
    }
}
