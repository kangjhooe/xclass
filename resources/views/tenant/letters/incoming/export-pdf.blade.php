<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Surat Masuk - {{ \App\Helpers\DateHelper::formatIndonesian(now()) }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            color: #333;
        }
        .header p {
            margin: 5px 0 0 0;
            font-size: 12px;
            color: #666;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .table th,
        .table td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }
        .table th {
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: center;
        }
        .table td {
            font-size: 11px;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .status-badge {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
        }
        .status-baru { background-color: #ffc107; color: #000; }
        .status-diproses { background-color: #17a2b8; color: #fff; }
        .status-selesai { background-color: #28a745; color: #fff; }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>LAPORAN SURAT MASUK</h1>
        <p>Periode: {{ request('start_date') ? \App\Helpers\DateHelper::formatIndonesian(request('start_date')) : 'Semua' }} 
           s/d {{ request('end_date') ? \App\Helpers\DateHelper::formatIndonesian(request('end_date')) : 'Sekarang' }}</p>
        <p>Dicetak pada: {{ \App\Helpers\DateHelper::formatIndonesian(now(), true) }}</p>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="15%">Nomor Surat</th>
                <th width="12%">Tanggal Terima</th>
                <th width="15%">Pengirim</th>
                <th width="25%">Perihal</th>
                <th width="10%">Jenis</th>
                <th width="8%">Prioritas</th>
                <th width="10%">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($letters as $index => $letter)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $letter->nomor_surat }}</td>
                <td>{{ \App\Helpers\DateHelper::formatIndonesian($letter->tanggal_terima) }}</td>
                <td>{{ $letter->pengirim }}</td>
                <td>{{ $letter->perihal }}</td>
                <td>{{ $letter->jenis_surat ?? '-' }}</td>
                <td class="text-center">{{ $letter->prioritas_label ?? '-' }}</td>
                <td class="text-center">
                    <span class="status-badge status-{{ $letter->status }}">
                        {{ $letter->status_label }}
                    </span>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="8" class="text-center">Tidak ada data surat masuk</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>Total Surat Masuk: {{ $letters->count() }} surat</p>
        <p>Laporan ini dibuat secara otomatis oleh sistem persuratan</p>
    </div>
</body>
</html>
