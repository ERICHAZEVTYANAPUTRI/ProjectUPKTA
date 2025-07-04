<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SmesterGenap extends Model
{
    use HasFactory;

    protected $table = 'smester_genaps';

    protected $fillable = [
        'kodejurusangenap',
        'namajurusangenap',
    ];
}