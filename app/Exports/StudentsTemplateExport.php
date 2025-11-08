<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StudentsTemplateExport implements FromArray, WithHeadings, WithStyles, WithColumnWidths
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function array(): array
    {
        return $this->data;
    }

    public function headings(): array
    {
        return [
            'nama_lengkap',
            'email',
            'nomor_telepon',
            'tanggal_lahir',
            'tempat_lahir',
            'jenis_kelamin',
            'agama',
            'nik',
            'nisn',
            'nomor_induk_siswa',
            'kelas',
            'alamat',
            'rt',
            'rw',
            'desa_kelurahan',
            'kecamatan',
            'kabupaten_kota',
            'kota',
            'provinsi',
            'kode_pos',
            'jenis_tempat_tinggal',
            'alat_transportasi',
            'sekolah_sebelumnya',
            'alamat_sekolah_sebelumnya',
            'kota_sekolah_sebelumnya',
            'provinsi_sekolah_sebelumnya',
            'telepon_sekolah_sebelumnya',
            'kepala_sekolah_sebelumnya',
            'tahun_lulus_sekolah_sebelumnya',
            'nomor_ijazah_sekolah_sebelumnya',
            'nama_ayah',
            'nik_ayah',
            'tanggal_lahir_ayah',
            'tempat_lahir_ayah',
            'pendidikan_ayah',
            'pekerjaan_ayah',
            'perusahaan_ayah',
            'telepon_ayah',
            'email_ayah',
            'penghasilan_ayah',
            'nama_ibu',
            'nik_ibu',
            'tanggal_lahir_ibu',
            'tempat_lahir_ibu',
            'pendidikan_ibu',
            'pekerjaan_ibu',
            'perusahaan_ibu',
            'telepon_ibu',
            'email_ibu',
            'penghasilan_ibu',
            'nama_wali',
            'nik_wali',
            'tanggal_lahir_wali',
            'tempat_lahir_wali',
            'pendidikan_wali',
            'pekerjaan_wali',
            'perusahaan_wali',
            'telepon_wali',
            'email_wali',
            'penghasilan_wali',
            'hubungan_wali',
            'tinggi_badan',
            'berat_badan',
            'kondisi_kesehatan',
            'catatan_kesehatan',
            'alergi',
            'obat_obatan',
            'tanggal_masuk',
            'semester_masuk',
            'tahun_masuk',
            'status_siswa',
            'catatan_khusus',
            'nama_kontak_darurat',
            'telepon_kontak_darurat',
            'hubungan_kontak_darurat'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Header row
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF']
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '366092']
                ]
            ],
        ];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 20, // nama_lengkap
            'B' => 25, // email
            'C' => 15, // nomor_telepon
            'D' => 15, // tanggal_lahir
            'E' => 15, // tempat_lahir
            'F' => 15, // jenis_kelamin
            'G' => 10, // agama
            'H' => 20, // nik
            'I' => 15, // nisn
            'J' => 15, // nomor_induk_siswa
            'K' => 15, // kelas
            'L' => 30, // alamat
            'M' => 5,  // rt
            'N' => 5,  // rw
            'O' => 20, // desa_kelurahan
            'P' => 20, // kecamatan
            'Q' => 20, // kabupaten_kota
            'R' => 15, // kota
            'S' => 15, // provinsi
            'T' => 10, // kode_pos
            'U' => 20, // jenis_tempat_tinggal
            'V' => 20, // alat_transportasi
            'W' => 25, // sekolah_sebelumnya
            'X' => 30, // alamat_sekolah_sebelumnya
            'Y' => 20, // kota_sekolah_sebelumnya
            'Z' => 20, // provinsi_sekolah_sebelumnya
            'AA' => 20, // telepon_sekolah_sebelumnya
            'AB' => 25, // kepala_sekolah_sebelumnya
            'AC' => 20, // tahun_lulus_sekolah_sebelumnya
            'AD' => 25, // nomor_ijazah_sekolah_sebelumnya
            'AE' => 20, // nama_ayah
            'AF' => 20, // nik_ayah
            'AG' => 15, // tanggal_lahir_ayah
            'AH' => 15, // tempat_lahir_ayah
            'AI' => 15, // pendidikan_ayah
            'AJ' => 20, // pekerjaan_ayah
            'AK' => 25, // perusahaan_ayah
            'AL' => 15, // telepon_ayah
            'AM' => 25, // email_ayah
            'AN' => 15, // penghasilan_ayah
            'AO' => 20, // nama_ibu
            'AP' => 20, // nik_ibu
            'AQ' => 15, // tanggal_lahir_ibu
            'AR' => 15, // tempat_lahir_ibu
            'AS' => 15, // pendidikan_ibu
            'AT' => 20, // pekerjaan_ibu
            'AU' => 25, // perusahaan_ibu
            'AV' => 15, // telepon_ibu
            'AW' => 25, // email_ibu
            'AX' => 15, // penghasilan_ibu
            'AY' => 20, // nama_wali
            'AZ' => 20, // nik_wali
            'BA' => 15, // tanggal_lahir_wali
            'BB' => 15, // tempat_lahir_wali
            'BC' => 15, // pendidikan_wali
            'BD' => 20, // pekerjaan_wali
            'BE' => 25, // perusahaan_wali
            'BF' => 15, // telepon_wali
            'BG' => 25, // email_wali
            'BH' => 15, // penghasilan_wali
            'BI' => 20, // hubungan_wali
            'BJ' => 15, // tinggi_badan
            'BK' => 15, // berat_badan
            'BL' => 20, // kondisi_kesehatan
            'BM' => 25, // catatan_kesehatan
            'BN' => 15, // alergi
            'BO' => 20, // obat_obatan
            'BP' => 15, // tanggal_masuk
            'BQ' => 15, // semester_masuk
            'BR' => 15, // tahun_masuk
            'BS' => 15, // status_siswa
            'BT' => 25, // catatan_khusus
            'BU' => 20, // nama_kontak_darurat
            'BV' => 15, // telepon_kontak_darurat
            'BW' => 20, // hubungan_kontak_darurat
        ];
    }
}
