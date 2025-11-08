<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LetterTemplate;
use App\Models\Core\Tenant;

class LetterTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all tenants
        $tenants = Tenant::all();
        
        foreach ($tenants as $tenant) {
            // Template Surat Undangan Rapat
            LetterTemplate::create([
                'instansi_id' => $tenant->id,
                'nama_template' => 'Surat Undangan Rapat',
                'jenis_surat' => 'akademik',
                'isi_template' => '<h3 style="text-align: center;">SURAT UNDANGAN RAPAT</h3>
                <p style="text-align: center;">Nomor: {nomor_surat}</p>
                <p style="text-align: center;">Tanggal: {tanggal}</p>
                <br>
                <p>Kepada Yth.</p>
                <p>{tujuan}</p>
                <p>Di Tempat</p>
                <br>
                <p>Dengan hormat,</p>
                <p>Sehubungan dengan {perihal}, kami mengundang Bapak/Ibu untuk menghadiri rapat yang akan dilaksanakan pada:</p>
                <br>
                <p><strong>Hari/Tanggal:</strong> {hari}, {tanggal}</p>
                <p><strong>Waktu:</strong> {waktu}</p>
                <p><strong>Tempat:</strong> {tempat}</p>
                <p><strong>Acara:</strong> {acara}</p>
                <br>
                <p>Demikian undangan ini kami sampaikan, atas perhatian dan kehadiran Bapak/Ibu kami ucapkan terima kasih.</p>
                <br>
                <p>Hormat kami,</p>
                <br>
                <p>{nama_sekolah}</p>
                <p>{pengirim}</p>',
                'is_active' => true,
                'deskripsi' => 'Template untuk surat undangan rapat dengan variabel yang dapat disesuaikan',
                'created_by' => 1,
            ]);

            // Template Surat Pemberitahuan
            LetterTemplate::create([
                'instansi_id' => $tenant->id,
                'nama_template' => 'Surat Pemberitahuan',
                'jenis_surat' => 'umum',
                'isi_template' => '<h3 style="text-align: center;">SURAT PEMBERITAHUAN</h3>
                <p style="text-align: center;">Nomor: {nomor_surat}</p>
                <p style="text-align: center;">Tanggal: {tanggal}</p>
                <br>
                <p>Kepada Yth.</p>
                <p>{tujuan}</p>
                <p>Di Tempat</p>
                <br>
                <p>Dengan hormat,</p>
                <p>Sehubungan dengan {perihal}, kami memberitahukan hal-hal sebagai berikut:</p>
                <br>
                <p>{isi_pemberitahuan}</p>
                <br>
                <p>Demikian pemberitahuan ini kami sampaikan, atas perhatiannya kami ucapkan terima kasih.</p>
                <br>
                <p>Hormat kami,</p>
                <br>
                <p>{nama_sekolah}</p>
                <p>{pengirim}</p>',
                'is_active' => true,
                'deskripsi' => 'Template untuk surat pemberitahuan umum',
                'created_by' => 1,
            ]);

            // Template Surat Tugas
            LetterTemplate::create([
                'instansi_id' => $tenant->id,
                'nama_template' => 'Surat Tugas',
                'jenis_surat' => 'kepegawaian',
                'isi_template' => '<h3 style="text-align: center;">SURAT TUGAS</h3>
                <p style="text-align: center;">Nomor: {nomor_surat}</p>
                <p style="text-align: center;">Tanggal: {tanggal}</p>
                <br>
                <p>Yang bertanda tangan di bawah ini, {pengirim}, selaku {jabatan} di {nama_sekolah}, memberikan tugas kepada:</p>
                <br>
                <p><strong>Nama:</strong> {nama_pegawai}</p>
                <p><strong>NIP:</strong> {nip}</p>
                <p><strong>Jabatan:</strong> {jabatan_pegawai}</p>
                <br>
                <p><strong>Untuk melaksanakan tugas:</strong></p>
                <p>{deskripsi_tugas}</p>
                <br>
                <p><strong>Waktu pelaksanaan:</strong> {waktu_tugas}</p>
                <p><strong>Tempat:</strong> {tempat_tugas}</p>
                <br>
                <p>Demikian surat tugas ini dibuat untuk dapat dilaksanakan dengan sebaik-baiknya.</p>
                <br>
                <p>Hormat kami,</p>
                <br>
                <p>{nama_sekolah}</p>
                <p>{pengirim}</p>
                <p>{jabatan}</p>',
                'is_active' => true,
                'deskripsi' => 'Template untuk surat penugasan pegawai',
                'created_by' => 1,
            ]);

            // Template Surat Keterangan
            LetterTemplate::create([
                'instansi_id' => $tenant->id,
                'nama_template' => 'Surat Keterangan',
                'jenis_surat' => 'kesiswaan',
                'isi_template' => '<h3 style="text-align: center;">SURAT KETERANGAN</h3>
                <p style="text-align: center;">Nomor: {nomor_surat}</p>
                <p style="text-align: center;">Tanggal: {tanggal}</p>
                <br>
                <p>Yang bertanda tangan di bawah ini, {pengirim}, selaku {jabatan} di {nama_sekolah}, menerangkan bahwa:</p>
                <br>
                <p><strong>Nama:</strong> {nama_siswa}</p>
                <p><strong>NIS:</strong> {nis}</p>
                <p><strong>Kelas:</strong> {kelas}</p>
                <p><strong>Tahun Ajaran:</strong> {tahun_ajaran}</p>
                <br>
                <p>Benar-benar adalah siswa di {nama_sekolah} dan {keterangan}.</p>
                <br>
                <p>Surat keterangan ini dibuat untuk keperluan {keperluan}.</p>
                <br>
                <p>Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.</p>
                <br>
                <p>Hormat kami,</p>
                <br>
                <p>{nama_sekolah}</p>
                <p>{pengirim}</p>
                <p>{jabatan}</p>',
                'is_active' => true,
                'deskripsi' => 'Template untuk surat keterangan siswa',
                'created_by' => 1,
            ]);
        }
    }
}
