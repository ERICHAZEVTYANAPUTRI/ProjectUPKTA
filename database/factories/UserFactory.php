<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Prodi;
use App\Models\Jurusan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'username' => $this->faker->unique()->userName,
            'nama_lengkap' => $this->faker->name,
            'nip_nik_nipppk' => $this->faker->numerify('1982########'),
            'jurusan' => $this->faker->word,
            'kodejurusan' => $this->faker->randomNumber(3),
            'foto' => null,
            'password' => bcrypt('password'), // pakai password: 'password'
            'role' => 'admin_jurusan',
        ];
    }

    public function mahasiswa(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'username' => $this->faker->unique()->userName,
                'role' => 'mahasiswa',
                'nim' => $this->faker->unique()->numerify('7218######'),
                'smester' => rand(1, 8),
                'password' => bcrypt('password'),
                'foto' => null,
                'jurusanmahasiswa_id' => Jurusan::factory(),
                'prodi_id' => Prodi::factory(),
            ];
        });
    }
}