<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Dosen;
use App\Models\Prodi;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Dosen>
 */
class DosenFactory extends Factory
{
    protected $model = Dosen::class;

    public function definition(): array
    {
        return [
            'nama' => $this->faker->name,
            'nip' => $this->faker->unique()->numerify('1980##########'),
            'notelpon' => $this->faker->phoneNumber,
            'email' => $this->faker->unique()->safeEmail,
            'jabatanfungsional' => 'Lektor Kepala',
            'adminjurusan_id' => User::factory()->create(['role' => 'admin_jurusan'])->id,
            'prodi_id' => Prodi::factory(),
        ];
    }
}