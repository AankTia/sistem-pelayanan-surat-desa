<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\LetterCategory;

class LetterCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            [
                'name' => 'Surat Keterangan Kependudukan',
                'description' => 'Surat yang menerangkan status kependudukan warga, seperti domisili, kelahiran, atau pindah tempat tinggal.',
                'icon' => 'fa-solid fa-id-card',
                'order' => 1,
                'status' => 'active',
            ],
            [
                'name' => 'Surat Keterangan Status Perkawinan',
                'description' => 'Surat yang menerangkan status perkawinan seseorang, baik belum menikah, menikah, cerai, atau duda/janda.',
                'icon' => 'fa-solid fa-ring',
                'order' => 2,
                'status' => 'active',
            ],
            [
                'name' => 'Surat Keterangan untuk Keperluan Pekerjaan / Sekolah',
                'description' => 'Surat yang digunakan untuk melengkapi persyaratan administrasi pekerjaan atau pendidikan.',
                'icon' => 'fa-solid fa-briefcase',
                'order' => 3,
                'status' => 'active',
            ],
            [
                'name' => 'Surat Keterangan Harta dan Tanah',
                'description' => 'Surat yang menerangkan kepemilikan, penggunaan, atau status tanah dan harta benda warga.',
                'icon' => 'fa-solid fa-landmark',
                'order' => 4,
                'status' => 'active',
            ],
            [
                'name' => 'Surat Keterangan Hukum / Sosial',
                'description' => 'Surat yang digunakan untuk keperluan hukum, bantuan sosial, atau penyelesaian administrasi masyarakat.',
                'icon' => 'fa-solid fa-scale-balanced',
                'order' => 5,
                'status' => 'active',
            ],
            [
                'name' => 'Surat Pengantar Administrasi',
                'description' => 'Surat pengantar resmi dari desa/kelurahan untuk keperluan administrasi ke instansi lain seperti kecamatan atau dinas.',
                'icon' => 'fa-solid fa-envelope-open-text',
                'order' => 6,
                'status' => 'active',
            ],
            [
                'name' => 'Surat Terkait Pertanian / Kegiatan Ekonomi',
                'description' => 'Surat yang berkaitan dengan kegiatan ekonomi, usaha tani, bantuan pertanian, atau izin kegiatan usaha kecil.',
                'icon' => 'fa-solid fa-seedling',
                'order' => 7,
                'status' => 'active',
            ],
        ];

        foreach ($data as $item) {
            LetterCategory::updateOrCreate(
                ['slug' => Str::slug($item['name'])],
                array_merge($item, [
                    'id' => (string) Str::uuid(),
                    'slug' => Str::slug($item['name']),
                ])
            );
        }
    }
}
