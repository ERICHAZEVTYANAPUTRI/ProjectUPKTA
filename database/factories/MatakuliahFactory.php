<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Prodi;
use App\Models\Kurikulum;
use App\Models\Matakuliah;
use App\Models\TahunAjaran;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Matakuliah>
 */
class MatakuliahFactory extends Factory
{
    protected $model = Matakuliah::class;

    public function definition(): array
    {
        return [
            'kodematakuliah' => $this->faker->unique()->bothify('MAT###'),
            'namamatakuliah' => $this->faker->words(3, true),
            'tahunajaran_id' => TahunAjaran::factory(),
            'kurikulum_id' => Kurikulum::factory(), // ✅ buat relasi dengan factory
            'prodi_id' => Prodi::factory(),
            'tipe' => $this->faker->randomElement(['teori', 'praktikum']),
            'semester' => $this->faker->randomElement(['1', '2', '3', '4', '5', '6']),
            'sks_total' => $this->faker->randomElement([2, 3, 4]),
            'adminjurusan_id' => User::factory()->create(['role' => 'admin_jurusan'])->id,
        ];
    }
}