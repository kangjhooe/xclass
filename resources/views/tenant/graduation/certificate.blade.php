<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sertifikat Kelulusan - {{ $graduate->student->name ?? 'Siswa' }}</title>
    <style>
        @page {
            margin: 0;
            size: A4 landscape;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Times New Roman', serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 40px;
            min-height: 100vh;
        }
        
        .certificate-container {
            background: #ffffff;
            border: 20px solid #366092;
            border-radius: 15px;
            padding: 60px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            position: relative;
            min-height: 600px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .certificate-border {
            border: 5px solid #d4af37;
            border-radius: 10px;
            padding: 50px;
            position: relative;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .header h1 {
            font-size: 32px;
            color: #2c3e50;
            margin-bottom: 10px;
            font-weight: bold;
            letter-spacing: 2px;
        }
        
        .header h2 {
            font-size: 24px;
            color: #366092;
            margin-bottom: 20px;
            font-weight: normal;
        }
        
        .header .subtitle {
            font-size: 18px;
            color: #7f8c8d;
            font-style: italic;
        }
        
        .content {
            text-align: center;
            margin: 40px 0;
        }
        
        .content .intro {
            font-size: 16px;
            color: #34495e;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        
        .student-name {
            font-size: 36px;
            color: #2c3e50;
            font-weight: bold;
            margin: 30px 0;
            padding: 20px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 10px;
            border: 3px solid #366092;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        
        .student-details {
            font-size: 16px;
            color: #555;
            margin: 20px 0;
            line-height: 2;
        }
        
        .achievement-section {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 5px solid #d4af37;
        }
        
        .achievement-section h3 {
            font-size: 20px;
            color: #366092;
            margin-bottom: 15px;
        }
        
        .achievement-badge {
            display: inline-block;
            background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
            color: #2c3e50;
            padding: 10px 25px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 18px;
            margin: 5px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        }
        
        .footer {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        
        .signature {
            text-align: center;
            width: 200px;
        }
        
        .signature-line {
            border-top: 2px solid #2c3e50;
            margin: 60px auto 10px;
            width: 150px;
        }
        
        .signature-name {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .signature-title {
            font-size: 14px;
            color: #7f8c8d;
            margin-top: 5px;
        }
        
        .certificate-number {
            position: absolute;
            bottom: 20px;
            right: 20px;
            font-size: 12px;
            color: #95a5a6;
        }
        
        .date {
            text-align: center;
            margin-top: 30px;
            font-size: 16px;
            color: #555;
        }
        
        .decorative-border {
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 2px solid #d4af37;
            border-radius: 5px;
            pointer-events: none;
        }
        
        .logo-section {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .logo-placeholder {
            width: 100px;
            height: 100px;
            border: 3px solid #366092;
            border-radius: 50%;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
            font-size: 40px;
            color: #366092;
        }
    </style>
</head>
<body>
    <div class="certificate-container">
        <div class="certificate-border">
            <div class="decorative-border"></div>
            
            <div class="logo-section">
                <div class="logo-placeholder">
                    <strong>{{ strtoupper(substr($tenant->name ?? 'Sekolah', 0, 2)) }}</strong>
                </div>
            </div>
            
            <div class="header">
                <h1>SERTIFIKAT KELULUSAN</h1>
                <h2>{{ $tenant->name ?? 'Sekolah' }}</h2>
                <p class="subtitle">Dengan ini menyatakan bahwa:</p>
            </div>
            
            <div class="content">
                <div class="student-name">
                    {{ $graduate->student->name ?? 'Nama Siswa' }}
                </div>
                
                <div class="student-details">
                    <p><strong>NIS:</strong> {{ $graduate->student->student_number ?? $graduate->student->nis ?? '-' }}</p>
                    <p><strong>NISN:</strong> {{ $graduate->student->nisn ?? '-' }}</p>
                    <p><strong>Telah menyelesaikan pendidikan dengan baik</strong></p>
                    <p><strong>Tahun Pelajaran:</strong> {{ $graduate->graduation_year ?? now()->year }}</p>
                </div>
                
                @if($graduate->final_grade || $graduate->gpa || $graduate->rank)
                <div class="achievement-section">
                    <h3>Prestasi Akademik</h3>
                    @if($graduate->final_grade)
                        <p><strong>Nilai Akhir:</strong> {{ number_format($graduate->final_grade, 2, ',', '.') }}</p>
                    @endif
                    @if($graduate->gpa)
                        <p><strong>IPK:</strong> {{ number_format($graduate->gpa, 2, ',', '.') }}</p>
                    @endif
                    @if($graduate->rank)
                        <p><strong>Peringkat:</strong> {{ $graduate->rank }}</p>
                    @endif
                    @if($graduate->achievements && is_array($graduate->achievements) && count($graduate->achievements) > 0)
                        <div style="margin-top: 15px;">
                            <strong>Prestasi:</strong><br>
                            @foreach($graduate->achievements as $achievement)
                                <span class="achievement-badge">{{ ucfirst(str_replace('_', ' ', $achievement)) }}</span>
                            @endforeach
                        </div>
                    @endif
                </div>
                @endif
                
                <div class="intro">
                    <p>Dengan ini dinyatakan <strong>LULUS</strong> dan berhak menerima Ijazah</p>
                    <p>Nomor Sertifikat: <strong>{{ $graduate->certificate_number ?? '-' }}</strong></p>
                </div>
                
                <div class="date">
                    <p>Diberikan di {{ $tenant->city ?? 'Kota' }}, pada tanggal {{ $graduate->graduation_date ? $graduate->graduation_date->format('d F Y') : now()->format('d F Y') }}</p>
                </div>
            </div>
            
            <div class="footer">
                <div class="signature">
                    <div class="signature-line"></div>
                    <div class="signature-name">{{ $institution->headmaster_name ?? 'Kepala Sekolah' }}</div>
                    <div class="signature-title">Kepala Sekolah</div>
                </div>
                
                <div class="signature">
                    <div class="signature-line"></div>
                    <div class="signature-name">{{ $graduate->creator->name ?? 'Pengelola' }}</div>
                    <div class="signature-title">Pengelola Sistem</div>
                </div>
            </div>
            
            <div class="certificate-number">
                No. {{ $graduate->certificate_number ?? '-' }}
            </div>
        </div>
    </div>
</body>
</html>
