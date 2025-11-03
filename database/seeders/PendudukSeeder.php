<?php

namespace Database\Seeders;

use App\Models\Penduduk;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class PendudukSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('id_ID'); // Locale Indonesia
        $kecamatanList = ['Kuningan', 'Ciawigebang', 'Cilimus', 'Kadugede', 'Garawangi', 'Cibingbin', 'Lebakwangi'];
        $kelurahanList = ['Cijoho', 'Ciporang', 'Purwawinangun', 'Ancaran', 'Winduhaji'];
        $dusunList = ['Manis', 'Puhun', 'Kliwon', 'Pahing', 'Wage'];

        for ($i = 0; $i < 100; $i++) {
            $jenisKelamin = $faker->randomElement(['Laki-laki', 'Perempuan']);
            $nama = $jenisKelamin === 'Laki-laki' ? $faker->name('male') : $faker->name('female');

            $dusun = $faker->randomElement($dusunList);
            $kecamatan = $faker->randomElement($kecamatanList);
            $kelurahan = $faker->randomElement($kelurahanList);

            Penduduk::create([
                'id' => (string) Str::uuid(),
                'nik' => $faker->unique()->numerify('320#############'),
                'kk' => $faker->numerify('################'),
                'nama' => $nama,
                'tempat_lahir' => 'Kuningan',
                'tanggal_lahir' => $faker->dateTimeBetween('-70 years', '-17 years')->format('Y-m-d'),
                'jenis_kelamin' => $jenisKelamin,
                'agama' => $faker->randomElement(['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']),
                'status_perkawinan' => $faker->randomElement(['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati']),
                'pekerjaan' => $faker->randomElement(['Petani', 'Buruh', 'Pedagang', 'Guru', 'Pelajar', 'Ibu Rumah Tangga', 'Wiraswasta']),
                'pendidikan_terakhir' => $faker->randomElement(['SD', 'SMP', 'SMA', 'D3', 'S1', 'S2']),
                'kewarganegaraan' => 'WNI',

                'alamat' => "Dusun {$dusun}, Kelurahan {$kelurahan}, Kecamatan {$kecamatan}, Kabupaten Kuningan",
                'rt' => str_pad($faker->numberBetween(1, 10), 2, '0', STR_PAD_LEFT),
                'rw' => str_pad($faker->numberBetween(1, 10), 2, '0', STR_PAD_LEFT),
                'dusun' => $dusun,
                'kelurahan' => $kelurahan,
                'kecamatan' => $kecamatan,
                'kabupaten' => 'Kuningan',
                'provinsi' => 'Jawa Barat',
                
                'status_tinggal' => $faker->randomElement(['Tetap', 'Sementara']),
                'catatan' => $faker->optional()->sentence()
            ]);
        }
    }
}
