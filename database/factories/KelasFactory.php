<?php

namespace Database\Factories;

use App\Models\kelas;
use App\Models\User;
use App\Models\Prodi;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Kelas>
 */
class KelasFactory extends Factory
{
    protected $model = kelas::class;

    public function definition(): array
    {
        return [
            'nama' => 'TI ' . $this->faker->randomElement(['1A', '2B', '3C']),
            'prodi_id' => Prodi::factory(),
            'adminjurusan_id' => User::factory()->create(['role' => 'admin_jurusan'])->id,
        ];
    }
}