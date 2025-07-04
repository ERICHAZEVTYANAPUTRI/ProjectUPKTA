<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PenjadwalanRuangan extends Model
{
    use HasFactory;

    protected $table = 'penjadwalan_ruangans';

    protected $fillable = [
        'mahasiswa_id',
        'adminjurusan_id',
        'prodi_id',
        'dosen_id',
        'kelas_id',
        'tahunajaran_id',
        'hari',
        'ruangan_id',
        'jammulai',
        'jamselesai',
        'namaruangan',
        'kodematakuliah',
        'kebutuhankelas',
        'statusuploadvidio',
        'statusterkirim',
        'statuspeminjaman',
        'statusdigunakan',
        'statustidakdigunakan',
        'statusdialihkan',
        'status_pengajuan_pjmk',
        'pengaju_pjmk_id', // ⬅️ penting: siapa yang ajukan tukar PJMK
    ];
public function pengaju_pjmk()
{
    return $this->belongsTo(User::class, 'pengaju_pjmk_id')->where('role', 'mahasiswa');
}

    public function matakuliah()
    {
        return $this->belongsTo(MataKuliah::class, 'kodematakuliah', 'kodematakuliah');
    }
        public function kelas()
    {
        return $this->belongsTo(kelas::class, 'kelas_id', 'id');
    }
    public function prodi()
    {
        return $this->belongsTo(Prodi::class, 'prodi_id', 'id');
    }
    public function tahunajaran()
    {
        return $this->belongsTo(TahunAjaran::class, 'tahunajaran_id', 'id');
    }
    public function adminjurusan()
    {
    return $this->belongsTo(User::class, 'adminjurusan_id')->where('role', 'admin_jurusan');
    }
    public function mahasiswa()
    {
    return $this->belongsTo(User::class, 'mahasiswa_id')->where('role', 'mahasiswa');
    }
    public function ruangan()
    {
    return $this->belongsTo(RuanganGKT::class, 'ruangan_id','id');
    }
        public function dosen()
    {
    return $this->belongsTo(Dosen::class, 'dosen_id','id');
    }

}