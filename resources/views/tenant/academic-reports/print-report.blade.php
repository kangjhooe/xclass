<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapor {{ $student->name }} - {{ $academicYear->year_name }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        
        .school-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .report-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .student-info {
            margin-bottom: 20px;
        }
        
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .info-table td {
            padding: 5px;
            border: 1px solid #333;
        }
        
        .info-table .label {
            background-color: #f5f5f5;
            font-weight: bold;
            width: 30%;
        }
        
        .grades-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .grades-table th,
        .grades-table td {
            padding: 8px;
            border: 1px solid #333;
            text-align: center;
        }
        
        .grades-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        
        .grades-table .subject-name {
            text-align: left;
        }
        
        .summary {
            margin-top: 20px;
            padding: 15px;
            background-color: #f9f9f9;
            border: 1px solid #333;
        }
        
        .grade-A { color: #28a745; font-weight: bold; }
        .grade-B { color: #17a2b8; font-weight: bold; }
        .grade-C { color: #ffc107; font-weight: bold; }
        .grade-D { color: #fd7e14; font-weight: bold; }
        .grade-E { color: #dc3545; font-weight: bold; }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
        }
        
        .signature-table {
            width: 100%;
            margin-top: 30px;
        }
        
        .signature-table td {
            text-align: center;
            padding: 20px;
        }
        
        .signature-line {
            border-bottom: 1px solid #333;
            width: 200px;
            margin: 0 auto 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="school-name">MADRASAH/SEKOLAH</div>
        <div class="report-title">RAPOR SISWA</div>
        <div>Tahun Pelajaran {{ $academicYear->year_name }} - Semester {{ $semester }}</div>
    </div>
    
    <div class="student-info">
        <table class="info-table">
            <tr>
                <td class="label">Nama Siswa</td>
                <td>{{ $student->name }}</td>
                <td class="label">NIS/NISN</td>
                <td>{{ $student->nis ?? '-' }} / {{ $student->nisn ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">Kelas</td>
                <td>{{ $student->classRoom->name ?? '-' }}</td>
                <td class="label">Tempat, Tanggal Lahir</td>
                <td>{{ $student->birth_place ?? '-' }}, {{ $student->birth_date ? \App\Helpers\DateHelper::formatIndonesian($student->birth_date) : '-' }}</td>
            </tr>
            <tr>
                <td class="label">Alamat</td>
                <td colspan="3">{{ $student->address ?? '-' }}</td>
            </tr>
        </table>
    </div>
    
    <h4>NILAI MATA PELAJARAN</h4>
    <table class="grades-table">
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="35%">Mata Pelajaran</th>
                <th width="15%">Guru</th>
                <th width="15%">Nilai Akhir</th>
                <th width="15%">Predikat</th>
                <th width="15%">Keterangan</th>
            </tr>
        </thead>
        <tbody>
            @php $no = 1; @endphp
            @foreach($subjectAverages as $subjectId => $data)
                <tr>
                    <td>{{ $no++ }}</td>
                    <td class="subject-name">{{ $data['subject']->name }}</td>
                    <td>{{ $data['teacher']->name }}</td>
                    <td>{{ number_format($data['average'], 2) }}</td>
                    <td class="grade-{{ $data['letter_grade'] }}">{{ $data['letter_grade'] }}</td>
                    <td>
                        @if($data['average'] >= 60)
                            Lulus
                        @else
                            Tidak Lulus
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
    
    <div class="summary">
        <table class="info-table">
            <tr>
                <td class="label">Rata-rata Keseluruhan</td>
                <td><strong>{{ number_format($overallAverage, 2) }}</strong></td>
                <td class="label">Predikat Keseluruhan</td>
                <td class="grade-{{ $overallLetterGrade }}"><strong>{{ $overallLetterGrade }}</strong></td>
            </tr>
            <tr>
                <td class="label">Status Kelulusan</td>
                <td colspan="3">
                    @if($overallAverage >= 60)
                        <strong class="text-success">LULUS</strong>
                    @else
                        <strong class="text-danger">TIDAK LULUS</strong>
                    @endif
                </td>
            </tr>
        </table>
    </div>
    
    <table class="signature-table">
        <tr>
            <td>
                <div>Wali Kelas</div>
                <div class="signature-line"></div>
                <div>(___________________)</div>
            </td>
            <td>
                <div>Kepala Sekolah</div>
                <div class="signature-line"></div>
                <div>(___________________)</div>
            </td>
        </tr>
    </table>
    
    <div class="footer">
        <p>Rapor ini dicetak pada {{ \App\Helpers\DateHelper::formatIndonesian(now(), true) }}</p>
        <p>Dicetak dari Sistem CLASS - Manajemen Sekolah</p>
    </div>
</body>
</html>
