<?php

namespace Database\Seeders;

use App\Models\LetterCategory;
use App\Models\LetterTemplate;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LetterTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $categories = LetterCategory::pluck('id', 'name');

        if ($categories->isEmpty()) {
            $this->command->warn('⚠️  No categories found. Run LetterCategorySeeder first.');
            return;
        }

        /**
         * Format: 'Nama Kategori' => [
         *    'KodeSingkatKategori' => [
         *        'Nama Surat' => 'KodeSuratResmi'
         *    ]
         * ]
         */
        $templates = [
            // 1. Surat Keterangan Kependudukan
            'Surat Keterangan Kependudukan' => [
                'SKD' => [
                    'Surat Keterangan Domisili' => 'SKD',
                    'Surat Keterangan Pindah / Datang' => 'SKPD',
                    'Surat Keterangan Tempat Tinggal Sementara' => 'SKTTS',
                    'Surat Keterangan Belum Memiliki KTP' => 'SKBMK',
                    'Surat Keterangan KK / KTP yang Hilang' => 'SKKH',
                    'Surat Keterangan Penduduk Sementara (SKPS)' => 'SKPS',
                ]
            ],

            // 2. Surat Keterangan Status Perkawinan
            'Surat Keterangan Status Perkawinan' => [
                'SKP' => [
                    'Surat Keterangan Belum Menikah' => 'SKBM',
                    'Surat Keterangan Janda / Duda' => 'SKJD',
                ]
            ],
            // 3. Surat Pengantar Nikah (Model N1 - N4)
            'Surat Pengantar Nikah (Model N1 - N4)' => [
                'NIKAH' => [
                    'N1: Surat Keterangan untuk Nikah' => 'NIKAH-N1',
                    'N2: Surat Keterangan Asal-Usul' => 'NIKAH-N2',
                    'N3: Surat Persetujuan Mempelai' => 'NIKAH-N3',
                    'N4: Surat Keterangan tentang Orang Tua' => 'NIKAH-N4',
                ]
            ],

            // 4. Surat Keterangan untuk Keperluan Pekerjaan / Sekolah
            'Surat Keterangan untuk Keperluan Pekerjaan / Sekolah' => [
                'SKP' => [
                    'Surat Keterangan Tidak Mampu (SKTM)' => 'SKTM',
                    'Surat Keterangan Usaha (SKU)' => 'SKU',
                    'Surat Keterangan Penghasilan' => 'SKPENG',
                    'Surat Rekomendasi Kerja' => 'SRK',
                    'Surat Keterangan Aktif Sekolah' => 'SKAS',
                ]
            ],

            // 5. Surat Keterangan Harta dan Tanah
            'Surat Keterangan Harta dan Tanah' => [
                'SKT' => [
                    'Surat Keterangan Kepemilikan Tanah (SKT)' => 'SKT',
                    'Surat Keterangan Riwayat Tanah' => 'SKRT',
                    'Surat Keterangan Tanah Tidak Sengketa' => 'SKTS',
                    'Surat Keterangan Waris' => 'SKW',
                    'Surat Pernyataan Penguasaan Fisik Bidang Tanah (SPORADIK)' => 'SPORADIK',
                ]
            ],

            // 6. Surat Keterangan Hukum / Sosial
            'Surat Keterangan Hukum / Sosial' => [
                'SKHS' => [
                    'Surat Keterangan Ahli Waris' => 'SKAW',
                    'Surat Keterangan Cerai Hidup / Mati' => 'SKCH',
                    'Surat Keterangan Kematian' => 'SKK',
                    'Surat Keterangan Kehilangan Barang / Dokumen' => 'SKHB',
                    'Surat Keterangan Berkelakuan Baik (SKBK)' => 'SKBK',
                    'Surat Keterangan Tidak Pernah Dipidana' => 'SKTPP',
                ]
            ],

            // 7. Surat Pengantar Administrasi
            'Surat Pengantar Administrasi' => [
                'SPA' => [
                    'Surat Pengantar SKCK (ke Polsek)' => 'SP-SKCK',
                    'Surat Pengantar Pembuatan KTP / KK' => 'SP-KTPKK',
                    'Surat Pengantar Pindah / Datang' => 'SP-PD',
                    'Surat Pengantar Nikah' => 'SP-NIKAH',
                    'Surat Pengantar Permohonan Bantuan Sosial' => 'SP-BANSOS',
                ]
            ],

            // 8. Surat Terkait Pertanian / Kegiatan Ekonomi
            'Surat Terkait Pertanian / Kegiatan Ekonomi' => [
                'SKPE' => [
                    'Surat Keterangan Petani Aktif' => 'SKPA',
                    'Surat Keterangan Penggunaan Lahan' => 'SKPL',
                    'Surat Keterangan Ternak / Hewan Peliharaan' => 'SKTHP',
                    'Surat Rekomendasi untuk Bantuan Pemerintah' => 'SRBP',
                    'Surat Rekomendasi Warga' => 'SRW',
                    'Surat Keterangan Tidak Sengketa' => 'SKTS2',
                    'Surat Pernyataan Bersama' => 'SPB',
                    'Surat Keterangan Domisili Organisasi / Yayasan' => 'SKDO',
                    'Surat Keterangan Kegiatan Masyarakat' => 'SKKM',
                ]
            ],
        ];

        foreach ($templates as $categoryName => $groupedTemplates) {
            $categoryId = $categories[$categoryName] ?? null;
            if (!$categoryId) {
                $this->command->warn("⚠️ Category '{$categoryName}' not found — skipping.");
                continue;
            }

            foreach ($groupedTemplates as $prefix => $templateList) {
                $counter = 1;

                foreach ($templateList as $templateName => $templateCode) {
                    $code = sprintf('%s-%03d', $templateCode, $counter++);

                    LetterTemplate::updateOrCreate(
                        ['code' => $code],
                        [
                            'id' => Str::uuid(),
                            'letter_category_id' => $categoryId,
                            'name' => $templateName,
                            'fields' => [
                                'nama',
                                'nik',
                                'alamat',
                                'tempat_lahir',
                                'tanggal_lahir',
                                'jenis_kelamin',
                            ],
                            'template_html' => '<p>Yang bertanda tangan di bawah ini, Kepala Desa/Lurah ..., menerangkan bahwa ...</p>',
                            'signature_type' => 'digital',
                            'status' => 'active',
                        ]
                    );
                }
            }
        }

        $this->command->info('✅ Letter templates with official codes seeded successfully!');
    }
}
