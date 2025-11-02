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
                'Surat Keterangan Domisili' => [
                    'category_code' => 'SKP',
                    'code' => 'SKD',
                    'signature_type' => 'manual',
                    'status' => 'active',
                    'fields' => json_encode([
                        [
                            "name" => "keperluan",
                            "label" => "Keperluan",
                            "type" => "text",
                            "placeholder" => "Contoh: Melamar Pekerjaan",
                            "required" => true,
                            "options" => []
                        ]
                    ]),
                    'template_html' => '
                        <p>Yang bertandatangan di bawah ini, Kepala {nama_desa} {nama_kecamatan} {nama_kabupaten}, menerangkan dengan sesungguhnya bahwa:</p>
                        <br>
                        <table style="border-style:none;">
                            <tr><td>Nama</td><td>:</td><td>{nama}</td></tr>
                            <tr><td>NIK</td><td>:</td><td>{nik}</td></tr>
                            <tr><td>Tempat/Tanggal Lahir</td><td>:</td><td>{ttl}</td></tr>
                            <tr><td>Jenis Kelamin</td><td>:</td><td>{jenis_kelamin}</td></tr>
                            <tr><td>Alamat</td><td>:</td><td>{alamat}</td></tr>
                        </table>
                        <br>
                        <p>Orang tersebut di atas benar-benar penduduk desa kami dan berdomisili di {nama_desa}, RT {rt}, RW {rw}. 
                        Surat keterangan ini dibuat untuk keperluan {keperluan}.</p>
                        <p>Demikian surat ini dibuat agar dapat digunakan sebagaimana mestinya.</p>
                    ',
                ],
                'Surat Keterangan Pindah' => [
                    'category_code' => 'SKP',
                    'code' => 'SKP',
                    'signature_type' => 'manual',
                    'status' => 'active',
                    'fields' => json_encode([
                        [
                            "name" => "alamat_pindah",
                            "label" => "Alamat Pindah",
                            "type" => "text",
                            "placeholder" => "Contoh: Desa Sukamaju, Kecamatan Sukamakmur, Kabupaten Sukabumi",
                            "required" => true,
                            "options" => []
                        ]
                    ]),
                    'template_html' => '<p>Yang bertandatangan di bawah ini, Kepala {nama_desa} {nama_kecamatan} {nama_kabupaten}, menerangkan dengan sesungguhnya bahwa:</p><br><table style="border-style:none;"><tr><td>Nama</td><td>:</td><td>{nama}</td></tr><tr><td>NIK</td><td>:</td><td>{nik}</td></tr><tr><td>Tempat/Tanggal Lahir</td><td>:</td><td>{ttl}</td></tr><tr><td>Jenis Kelamin</td><td>:</td><td>{jenis_kelamin}</td></tr><tr><td>Alamat</td><td>:</td><td>{alamat}</td></tr></table><br><p>Orang tersebut di atas benar-benar penduduk desa kami yang akan melakukan pindah ke {tujuan_pindah}. Surat keterangan ini dibuat untuk keperluan administrasi kependudukan.</p><p>Demikian surat ini dibuat agar dapat digunakan sebagaimana mestinya.</p>',
                ],
                'Surat Keterangan Datang' => [
                    'category_code' => 'SKP',
                    'code' => 'SKD',
                    'signature_type' => 'manual',
                    'status' => 'active',
                    'fields' => json_encode([
                        [
                            "name" => "alamat_datang",
                            "label" => "Alamat Datang",
                            "type" => "text",
                            "placeholder" => "Contoh: Desa Sukamaju, Kecamatan Sukamakmur, Kabupaten Sukabumi",
                            "required" => true,
                            "options" => []
                        ]
                    ]),
                    'template_html' => '<p>Yang bertandatangan di bawah ini, Kepala {nama_desa} {nama_kecamatan} {nama_kabupaten}, menerangkan dengan sesungguhnya bahwa:</p><br><table style="border-style:none;"><tr><td>Nama</td><td>:</td><td>{nama}</td></tr><tr><td>NIK</td><td>:</td><td>{nik}</td></tr><tr><td>Tempat/Tanggal Lahir</td><td>:</td><td>{ttl}</td></tr><tr><td>Jenis Kelamin</td><td>:</td><td>{jenis_kelamin}</td></tr><tr><td>Alamat</td><td>:</td><td>{alamat}</td></tr></table><br><p>Orang tersebut di atas benar-benar penduduk desa kami yang akan melakukan datang ke {tujuan_pindah}. Surat keterangan ini dibuat untuk keperluan administrasi kependudukan.</p><p>Demikian surat ini dibuat agar dapat digunakan sebagaimana mestinya.</p>',
                ],
                'Surat Keterangan Tempat Tinggal Sementara' => [
                    'category_code' => 'SKP',
                    'code' => 'SKTTS',
                    'signature_type' => 'manual',
                    'status' => 'active',
                    'fields' => json_encode([
                        ["name" => "nama", "label" => "Nama", "type" => "text", "placeholder" => "Nama lengkap sesuai KTP", "required" => true, "options" => []],
                        ["name" => "nik", "label" => "NIK", "type" => "text", "placeholder" => "Nomor Induk Kependudukan", "required" => true, "options" => []],
                        ["name" => "tempat_lahir", "label" => "Tempat Lahir", "type" => "text", "required" => true, "options" => []],
                        ["name" => "tanggal_lahir", "label" => "Tanggal Lahir", "type" => "date", "required" => true, "options" => []],
                        ["name" => "jenis_kelamin", "label" => "Jenis Kelamin", "type" => "select", "options" => ["Laki-laki", "Perempuan", "options" => []], "required" => true, "options" => []],
                        ["name" => "agama", "label" => "Agama", "type" => "text", "required" => true, "options" => []],
                        ["name" => "pekerjaan", "label" => "Pekerjaan", "type" => "text", "required" => true, "options" => []],
                        ["name" => "alamat_asal", "label" => "Alamat Asal", "type" => "textarea", "placeholder" => "Alamat tempat tinggal asal", "required" => true, "options" => []],
                        ["name" => "alamat_sekarang", "label" => "Alamat Tempat Tinggal Sementara", "type" => "textarea", "placeholder" => "Alamat lengkap di wilayah desa/kelurahan ini", "required" => true, "options" => []],
                        ["name" => "lama_tinggal", "label" => "Lama Tinggal", "type" => "text", "placeholder" => "Misal=>6 bulan", "required" => true, "options" => []],
                        ["name" => "tujuan", "label" => "Tujuan Tinggal Sementara", "type" => "text", "placeholder" => "Misal=>Bekerja, Menempuh Pendidikan", "required" => true, "options" => []],
                        ["name" => "keperluan", "label" => "Keperluan Surat", "type" => "text", "placeholder" => "Contoh=>Untuk mengurus administrasi kependudukan", "required" => true, "options" => []]
                    ]),
                    'template_html' => '<p>Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa:</p><table style="margin-left: 20px;"><tr><td>Nama</td><td>:</td><td>{{nama}}</td></tr><tr><td>NIK</td><td>:</td><td>{{nik}}</td></tr><tr><td>Tempat/Tanggal Lahir</td><td>:</td><td>{{tempat_lahir}}, {{tanggal_lahir}}</td></tr><tr><td>Jenis Kelamin</td><td>:</td><td>{{jenis_kelamin}}</td></tr><tr><td>Agama</td><td>:</td><td>{{agama}}</td></tr><tr><td>Pekerjaan</td><td>:</td><td>{{pekerjaan}}</td></tr><tr><td>Alamat Asal</td><td>:</td><td>{{alamat_asal}}</td></tr><tr><td>Alamat Tinggal Sementara</td><td>:</td><td>{{alamat_sekarang}}</td></tr></table><p>Yang bersangkutan benar-benar <b>tinggal sementara di alamat tersebut</b> sejak {{lama_tinggal}}, dengan tujuan {{tujuan}}.</p><p>Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.</p>',
                ],
                'Surat Keterangan Belum Memiliki KTP' => [
                    'category_code' => 'SKP',
                    'code' => 'SKBMK',
                    'signature_type' => 'manual',
                    'status' => 'active',
                    'fields' => json_encode([
                        ["name" => "nama", "label" => "Nama Lengkap", "type" => "text", "placeholder" => "Nama lengkap sesuai KK", "required" => true],
                        ["name" => "nik", "label" => "NIK", "type" => "text", "placeholder" => "Nomor Induk Kependudukan (jika sudah ada)", "required" => false],
                        ["name" => "tempat_lahir", "label" => "Tempat Lahir", "type" => "text", "required" => true],
                        ["name" => "tanggal_lahir", "label" => "Tanggal Lahir", "type" => "date", "required" => true],
                        ["name" => "jenis_kelamin", "label" => "Jenis Kelamin", "type" => "select", "options" => ["Laki-laki", "Perempuan"], "required" => true],
                        ["name" => "agama", "label" => "Agama", "type" => "text", "required" => true],
                        ["name" => "pekerjaan", "label" => "Pekerjaan", "type" => "text", "required" => true],
                        ["name" => "alamat", "label" => "Alamat Tempat Tinggal", "type" => "textarea", "placeholder" => "Alamat lengkap sesuai KK atau domisili", "required" => true],
                        ["name" => "alasan", "label" => "Alasan Belum Memiliki KTP", "type" => "text", "placeholder" => "Contoh => Belum berusia 17 tahun", "required" => true],
                        ["name" => "keperluan", "label" => "Keperluan Surat", "type" => "text", "placeholder" => "Contoh => Untuk pengurusan administrasi sekolah", "required" => true],
                    ]),
                    'template_html' => '<p style="text-align: center; font-weight: bold; text-decoration: underline;">SURAT KETERANGAN BELUM MEMILIKI KTP</p><p style="text-align: center;">Nomor: {{nomor_surat}}</p><p>Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa:</p><table style="margin-left: 20px;"><tr><td>Nama</td><td>:</td><td>{{nama}}</td></tr><tr><td>NIK</td><td>:</td><td>{{nik}}</td></tr><tr><td>Tempat/Tanggal Lahir</td><td>:</td><td>{{tempat_lahir}}, {{tanggal_lahir}}</td></tr><tr><td>Jenis Kelamin</td><td>:</td><td>{{jenis_kelamin}}</td></tr><tr><td>Agama</td><td>:</td><td>{{agama}}</td></tr><tr><td>Pekerjaan</td><td>:</td><td>{{pekerjaan}}</td></tr><tr><td>Alamat</td><td>:</td><td>{{alamat}}</td></tr></table><p>Adalah benar warga Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dan berdasarkan keterangan yang bersangkutan saat ini <b>belum memiliki Kartu Tanda Penduduk (KTP)</b> dengan alasan: <b>{{alasan}}</b>.</p><p>Surat keterangan ini dibuat atas permintaan yang bersangkutan untuk keperluan: <b>{{keperluan}}</b>.</p><p>Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.</p><p style="text-align: right; margin-top: 20px;">{{desa}}, {{tanggal_surat}}<br>Kepala Desa {{desa}}<br><br><br><b>{{nama_kades}}</b></p>',
                ],
                'Surat Keterangan KK / KTP yang Hilang' => [
                    'category_code' => 'SKP',
                    'code' => 'SKKH',
                    'signature_type' => 'manual',
                    'status' => 'active',
                    'fields' => json_encode([
                        ["name" => "nama", "label" => "Nama Lengkap", "type" => "text", "placeholder" => "Nama lengkap sesuai KK/KTP", "required" => true],
                        ["name" => "nik", "label" => "NIK", "type" => "text", "placeholder" => "Nomor Induk Kependudukan", "required" => true],
                        ["name" => "tempat_lahir", "label" => "Tempat Lahir", "type" => "text", "required" => true],
                        ["name" => "tanggal_lahir", "label" => "Tanggal Lahir", "type" => "date", "required" => true],
                        ["name" => "jenis_kelamin", "label" => "Jenis Kelamin", "type" => "select", "options" => ["Laki-laki", "Perempuan"], "required" => true],
                        ["name" => "agama", "label" => "Agama", "type" => "text", "required" => true],
                        ["name" => "pekerjaan", "label" => "Pekerjaan", "type" => "text", "required" => true],
                        ["name" => "alamat", "label" => "Alamat Tempat Tinggal", "type" => "textarea", "placeholder" => "Alamat lengkap sesuai KK", "required" => true],
                        ["name" => "dokumen_hilang", "label" => "Jenis Dokumen yang Hilang", "type" => "select", "options" => ["KTP", "KK", "KTP dan KK"], "required" => true],
                        ["name" => "tanggal_hilang", "label" => "Tanggal Kehilangan", "type" => "date", "required" => true],
                        ["name" => "tempat_hilang", "label" => "Tempat Kehilangan", "type" => "text", "placeholder" => "Lokasi kehilangan dokumen", "required" => true],
                        ["name" => "keperluan", "label" => "Keperluan Surat", "type" => "text", "placeholder" => "Contoh: Pengurusan dokumen baru ke Disdukcapil", "required" => true],
                    ]),
                    'template_html' => '<p style="text-align: center; font-weight: bold; text-decoration: underline;">SURAT KETERANGAN KEHILANGAN KK / KTP</p><p style="text-align: center;">Nomor: {{nomor_surat}}</p><p>Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa:</p><table style="margin-left: 20px;"><tr><td>Nama</td><td>:</td><td>{{nama}}</td></tr><tr><td>NIK</td><td>:</td><td>{{nik}}</td></tr><tr><td>Tempat/Tanggal Lahir</td><td>:</td><td>{{tempat_lahir}}, {{tanggal_lahir}}</td></tr><tr><td>Jenis Kelamin</td><td>:</td><td>{{jenis_kelamin}}</td></tr><tr><td>Agama</td><td>:</td><td>{{agama}}</td></tr><tr><td>Pekerjaan</td><td>:</td><td>{{pekerjaan}}</td></tr><tr><td>Alamat</td><td>:</td><td>{{alamat}}</td></tr></table><p>Berdasarkan keterangan yang bersangkutan, telah kehilangan <b>{{dokumen_hilang}}</b> pada tanggal <b>{{tanggal_hilang}}</b> di <b>{{tempat_hilang}}</b>.</p><p>Surat keterangan ini dibuat untuk keperluan: <b>{{keperluan}}</b>.</p><p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p><p style="text-align: right; margin-top: 20px;">{{desa}}, {{tanggal_surat}}<br>Kepala Desa {{desa}}<br><br><br><b>{{nama_kades}}</b></p>',
                ],
                'Surat Keterangan Penduduk Sementara' => [
                    'category_code' => 'SKP',
                    'code' => 'SKPS',
                    'signature_type' => 'manual',
                    'status' => 'active',
                    'fields' => json_encode([
                        ["name" => "nama", "label" => "Nama Lengkap", "type" => "text", "placeholder" => "Nama lengkap sesuai KTP", "required" => true],
                        ["name" => "nik", "label" => "NIK", "type" => "text", "placeholder" => "Nomor Induk Kependudukan", "required" => true],
                        ["name" => "tempat_lahir", "label" => "Tempat Lahir", "type" => "text", "required" => true],
                        ["name" => "tanggal_lahir", "label" => "Tanggal Lahir", "type" => "date", "required" => true],
                        ["name" => "jenis_kelamin", "label" => "Jenis Kelamin", "type" => "select", "options" => ["Laki-laki", "Perempuan"], "required" => true],
                        ["name" => "agama", "label" => "Agama", "type" => "text", "required" => true],
                        ["name" => "status_perkawinan", "label" => "Status Perkawinan", "type" => "select", "options" => ["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"], "required" => true],
                        ["name" => "pekerjaan", "label" => "Pekerjaan", "type" => "text", "required" => true],
                        ["name" => "kewarganegaraan", "label" => "Kewarganegaraan", "type" => "text", "placeholder" => "Contoh: WNI", "required" => true],
                        ["name" => "alamat_asal", "label" => "Alamat Asal", "type" => "textarea", "placeholder" => "Alamat tempat tinggal asal", "required" => true],
                        ["name" => "alamat_sementara", "label" => "Alamat Tempat Tinggal Sementara", "type" => "textarea", "placeholder" => "Alamat di wilayah desa/kelurahan ini", "required" => true],
                        ["name" => "tanggal_mulai_tinggal", "label" => "Tanggal Mulai Tinggal", "type" => "date", "required" => true],
                        ["name" => "tujuan_tinggal", "label" => "Tujuan Tinggal", "type" => "text", "placeholder" => "Contoh: Bekerja / Belajar / Menetap sementara", "required" => true],
                        ["name" => "keperluan", "label" => "Keperluan Surat", "type" => "text", "placeholder" => "Contoh: Untuk melengkapi dokumen administrasi kependudukan", "required" => true],
                    ]),
                    'template_html' => '<p style="text-align: center; font-weight: bold; text-decoration: underline;">SURAT KETERANGAN PENDUDUK SEMENTARA</p><p style="text-align: center;">Nomor: {{nomor_surat}}</p><p>Yang bertanda tangan di bawah ini Kepala Desa {{desa}} Kecamatan {{kecamatan}} Kabupaten {{kabupaten}}, dengan ini menerangkan bahwa:</p><table style="margin-left: 20px;"><tr><td>Nama</td><td>:</td><td>{{nama}}</td></tr><tr><td>NIK</td><td>:</td><td>{{nik}}</td></tr><tr><td>Tempat/Tanggal Lahir</td><td>:</td><td>{{tempat_lahir}}, {{tanggal_lahir}}</td></tr><tr><td>Jenis Kelamin</td><td>:</td><td>{{jenis_kelamin}}</td></tr><tr><td>Agama</td><td>:</td><td>{{agama}}</td></tr><tr><td>Status Perkawinan</td><td>:</td><td>{{status_perkawinan}}</td></tr><tr><td>Pekerjaan</td><td>:</td><td>{{pekerjaan}}</td></tr><tr><td>Kewarganegaraan</td><td>:</td><td>{{kewarganegaraan}}</td></tr><tr><td>Alamat Asal</td><td>:</td><td>{{alamat_asal}}</td></tr><tr><td>Alamat Tinggal Sementara</td><td>:</td><td>{{alamat_sementara}}</td></tr></table><p>Yang bersangkutan benar-benar <b>tinggal sementara di alamat tersebut</b> sejak tanggal {{tanggal_mulai_tinggal}}, dengan tujuan {{tujuan_tinggal}}.</p><p>Surat keterangan ini dibuat untuk keperluan: <b>{{keperluan}}</b>.</p><p>Demikian surat keterangan ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.</p><p style="text-align: right; margin-top: 20px;">{{desa}}, {{tanggal_surat}}<br>Kepala Desa {{desa}}<br><br><br><b>{{nama_kades}}</b></p>',
                ],
            ],
            // 2. Surat Keterangan Status Perkawinan
            // 'Surat Keterangan Status Perkawinan' => [
            //     'SKP' => [
            //         'Surat Keterangan Belum Menikah' => 'SKBM',
            //         'Surat Keterangan Janda / Duda' => 'SKJD',
            //     ]
            // ],
            // 3. Surat Pengantar Nikah (Model N1 - N4)
            // 'Surat Pengantar Nikah (Model N1 - N4)' => [
            //     'NIKAH' => [
            //         'N1: Surat Keterangan untuk Nikah' => 'NIKAH-N1',
            //         'N2: Surat Keterangan Asal-Usul' => 'NIKAH-N2',
            //         'N3: Surat Persetujuan Mempelai' => 'NIKAH-N3',
            //         'N4: Surat Keterangan tentang Orang Tua' => 'NIKAH-N4',
            //     ]
            // ],
            // 4. Surat Keterangan untuk Keperluan Pekerjaan / Sekolah
            // 'Surat Keterangan untuk Keperluan Pekerjaan / Sekolah' => [
            //     'SKP' => [
            //         'Surat Keterangan Tidak Mampu (SKTM)' => 'SKTM',
            //         'Surat Keterangan Usaha (SKU)' => 'SKU',
            //         'Surat Keterangan Penghasilan' => 'SKPENG',
            //         'Surat Rekomendasi Kerja' => 'SRK',
            //         'Surat Keterangan Aktif Sekolah' => 'SKAS',
            //     ]
            // ],
            // 5. Surat Keterangan Harta dan Tanah
            // 'Surat Keterangan Harta dan Tanah' => [
            //     'SKT' => [
            //         'Surat Keterangan Kepemilikan Tanah (SKT)' => 'SKT',
            //         'Surat Keterangan Riwayat Tanah' => 'SKRT',
            //         'Surat Keterangan Tanah Tidak Sengketa' => 'SKTS',
            //         'Surat Keterangan Waris' => 'SKW',
            //         'Surat Pernyataan Penguasaan Fisik Bidang Tanah (SPORADIK)' => 'SPORADIK',
            //     ]
            // ],
            // 6. Surat Keterangan Hukum / Sosial
            // 'Surat Keterangan Hukum / Sosial' => [
            //     'SKHS' => [
            //         'Surat Keterangan Ahli Waris' => 'SKAW',
            //         'Surat Keterangan Cerai Hidup / Mati' => 'SKCH',
            //         'Surat Keterangan Kematian' => 'SKK',
            //         'Surat Keterangan Kehilangan Barang / Dokumen' => 'SKHB',
            //         'Surat Keterangan Berkelakuan Baik (SKBK)' => 'SKBK',
            //         'Surat Keterangan Tidak Pernah Dipidana' => 'SKTPP',
            //     ]
            // ],
            // 7. Surat Pengantar Administrasi
            // 'Surat Pengantar Administrasi' => [
            //     'SPA' => [
            //         'Surat Pengantar SKCK (ke Polsek)' => 'SP-SKCK',
            //         'Surat Pengantar Pembuatan KTP / KK' => 'SP-KTPKK',
            //         'Surat Pengantar Pindah / Datang' => 'SP-PD',
            //         'Surat Pengantar Nikah' => 'SP-NIKAH',
            //         'Surat Pengantar Permohonan Bantuan Sosial' => 'SP-BANSOS',
            //     ]
            // ],
            // 8. Surat Terkait Pertanian / Kegiatan Ekonomi
            // 'Surat Terkait Pertanian / Kegiatan Ekonomi' => [
            //     'SKPE' => [
            //         'Surat Keterangan Petani Aktif' => 'SKPA',
            //         'Surat Keterangan Penggunaan Lahan' => 'SKPL',
            //         'Surat Keterangan Ternak / Hewan Peliharaan' => 'SKTHP',
            //         'Surat Rekomendasi untuk Bantuan Pemerintah' => 'SRBP',
            //         'Surat Rekomendasi Warga' => 'SRW',
            //         'Surat Keterangan Tidak Sengketa' => 'SKTS2',
            //         'Surat Pernyataan Bersama' => 'SPB',
            //         'Surat Keterangan Domisili Organisasi / Yayasan' => 'SKDO',
            //         'Surat Keterangan Kegiatan Masyarakat' => 'SKKM',
            //     ]
            // ],
        ];

        foreach ($templates as $categoryName => $groupedTemplates) {
            $categoryId = $categories[$categoryName] ?? null;
            if (!$categoryId) {
                $this->command->warn("⚠️ Category '{$categoryName}' not found — skipping.");
                continue;
            }

            $counter = 1;

            foreach ($groupedTemplates as $templateName => $templateData) {
                $codePrefix = $templateData['category_code'] . '-' . $templateData['code'];
                $code = sprintf('%s-%03d', $codePrefix, $counter++);

                LetterTemplate::updateOrCreate(
                    ['code' => $code],
                    [
                        'id' => Str::uuid(),
                        'letter_category_id' => $categoryId,
                        'name' => $templateName,
                        'fields' => $templateData['fields'],
                        'template_html' => $templateData['template_html'],
                        'signature_type' => $templateData['signature_type'],
                        'status' => $templateData['status'],
                    ]
                );
            }
        }

        $this->command->info('✅ Letter templates with official codes seeded successfully!');
    }
}
