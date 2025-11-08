<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Hasil Ujian - {{ $exam->title }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #2E86AB;
            padding-bottom: 20px;
        }
        
        .header h1 {
            color: #2E86AB;
            margin: 0;
            font-size: 24px;
        }
        
        .header h2 {
            color: #666;
            margin: 10px 0 0 0;
            font-size: 18px;
        }
        
        .exam-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .exam-info h3 {
            color: #2E86AB;
            margin: 0 0 10px 0;
            font-size: 16px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }
        
        .info-label {
            font-weight: bold;
            color: #555;
        }
        
        .statistics {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background-color: #2E86AB;
            color: white;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
        }
        
        .stat-card.success {
            background-color: #28a745;
        }
        
        .stat-card.warning {
            background-color: #ffc107;
            color: #333;
        }
        
        .stat-card.danger {
            background-color: #dc3545;
        }
        
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 12px;
            opacity: 0.9;
        }
        
        .results-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .results-table th,
        .results-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        
        .results-table th {
            background-color: #2E86AB;
            color: white;
            font-weight: bold;
            text-align: center;
        }
        
        .results-table tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .status-passed {
            color: #28a745;
            font-weight: bold;
        }
        
        .status-failed {
            color: #dc3545;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .chart-placeholder {
            background-color: #f8f9fa;
            border: 1px solid #ddd;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>LAPORAN HASIL UJIAN</h1>
        <h2>{{ $exam->title }}</h2>
        <p>Tanggal Export: {{ \App\Helpers\DateHelper::formatIndonesian($exportDate, true) }}</p>
    </div>

    <!-- Exam Information -->
    <div class="exam-info">
        <h3>Informasi Ujian</h3>
        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Mata Pelajaran:</span>
                <span>{{ $exam->subject->name }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Kelas:</span>
                <span>{{ $exam->classRoom->name }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Jenis Ujian:</span>
                <span>{{ $exam->type_label }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Durasi:</span>
                <span>{{ $exam->formatted_duration }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Total Soal:</span>
                <span>{{ $exam->total_questions }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Total Nilai:</span>
                <span>{{ $exam->total_score }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Nilai Kelulusan:</span>
                <span>{{ $exam->passing_score }}%</span>
            </div>
            <div class="info-item">
                <span class="info-label">Guru:</span>
                <span>{{ $exam->teacher->name }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Waktu Mulai:</span>
                <span>{{ \App\Helpers\DateHelper::formatIndonesian($exam->start_time, true) }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Waktu Selesai:</span>
                <span>{{ \App\Helpers\DateHelper::formatIndonesian($exam->end_time, true) }}</span>
            </div>
        </div>
    </div>

    <!-- Statistics -->
    <div class="statistics">
        <div class="stat-card">
            <div class="stat-value">{{ $statistics['total_attempts'] }}</div>
            <div class="stat-label">Total Peserta</div>
        </div>
        <div class="stat-card success">
            <div class="stat-value">{{ $statistics['average_score'] }}</div>
            <div class="stat-label">Rata-rata Nilai</div>
        </div>
        <div class="stat-card warning">
            <div class="stat-value">{{ $statistics['highest_score'] }}</div>
            <div class="stat-label">Nilai Tertinggi</div>
        </div>
        <div class="stat-card danger">
            <div class="stat-value">{{ $statistics['lowest_score'] }}</div>
            <div class="stat-label">Nilai Terendah</div>
        </div>
    </div>

    <!-- Pass Rate -->
    <div class="chart-placeholder">
        <h3>Tingkat Kelulusan: {{ $statistics['pass_rate'] }}%</h3>
        <p>{{ $statistics['total_attempts'] }} peserta mengikuti ujian</p>
    </div>

    <!-- Results Table -->
    <table class="results-table">
        <thead>
            <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 25%;">Nama Siswa</th>
                <th style="width: 10%;">NIS</th>
                <th style="width: 8%;">Nilai</th>
                <th style="width: 8%;">Persentase</th>
                <th style="width: 8%;">Nilai Huruf</th>
                <th style="width: 10%;">Status</th>
                <th style="width: 8%;">Benar</th>
                <th style="width: 8%;">Salah</th>
                <th style="width: 10%;">Waktu</th>
            </tr>
        </thead>
        <tbody>
            @foreach($attempts as $index => $attempt)
                <tr>
                    <td style="text-align: center;">{{ $index + 1 }}</td>
                    <td>{{ $attempt->student->name }}</td>
                    <td style="text-align: center;">{{ $attempt->student->nis ?? '-' }}</td>
                    <td style="text-align: center;">{{ $attempt->score }}</td>
                    <td style="text-align: center;">{{ $attempt->percentage_score }}%</td>
                    <td style="text-align: center;">{{ $attempt->grade }}</td>
                    <td style="text-align: center;" class="{{ $attempt->isPassed() ? 'status-passed' : 'status-failed' }}">
                        {{ $attempt->isPassed() ? 'Lulus' : 'Tidak Lulus' }}
                    </td>
                    <td style="text-align: center;">{{ $attempt->correct_answers }}</td>
                    <td style="text-align: center;">{{ $attempt->total_questions - $attempt->correct_answers }}</td>
                    <td style="text-align: center;">{{ $attempt->formatted_time_spent }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <!-- Score Distribution -->
    @if($statistics['score_distribution'])
        <div class="page-break"></div>
        <h3>Distribusi Nilai</h3>
        <table class="results-table">
            <thead>
                <tr>
                    <th>Rentang Nilai</th>
                    <th>Jumlah Siswa</th>
                    <th>Persentase</th>
                    <th>Visual</th>
                </tr>
            </thead>
            <tbody>
                @foreach($statistics['score_distribution'] as $range => $count)
                    @php
                        $percentage = $statistics['total_attempts'] > 0 ? round(($count / $statistics['total_attempts']) * 100, 1) : 0;
                        $barWidth = $percentage;
                    @endphp
                    <tr>
                        <td>{{ $range }}%</td>
                        <td style="text-align: center;">{{ $count }}</td>
                        <td style="text-align: center;">{{ $percentage }}%</td>
                        <td>
                            <div style="background-color: #e9ecef; height: 20px; border-radius: 3px; position: relative;">
                                <div style="background-color: #2E86AB; height: 100%; width: {{ $barWidth }}%; border-radius: 3px;"></div>
                                <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 10px; color: #333;">{{ $count }}</span>
                            </div>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <!-- Footer -->
    <div class="footer">
        <p>Dicetak pada {{ \App\Helpers\DateHelper::formatIndonesian($exportDate, true) }} | Aplikasi CLASS - Sistem Manajemen Sekolah</p>
    </div>
</body>
</html>
