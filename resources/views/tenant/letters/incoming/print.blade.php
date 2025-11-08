<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Daftar Surat Masuk - {{ \App\Helpers\DateHelper::formatIndonesian(now()) }}</title>
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
        }
        .header p {
            margin: 5px 0;
            font-size: 12px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>DAFTAR SURAT MASUK</h1>
        <p>{{ app(\App\Core\Services\TenantService::class)->getCurrentTenant()->name ?? 'CLASS' }}</p>
        <p>Periode: {{ request('start_date') ? \App\Helpers\DateHelper::formatIndonesian(request('start_date')) : 'Semua' }} 
           {{ request('end_date') ? 's/d ' . \App\Helpers\DateHelper::formatIndonesian(request('end_date')) : '' }}</p>
        <p>Tanggal Cetak: {{ \App\Helpers\DateHelper::formatIndonesian(now(), true) }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="15%">Nomor Surat</th>
                <th width="12%">Tanggal Terima</th>
                <th width="15%">Pengirim</th>
                <th width="20%">Perihal</th>
                <th width="10%">Jenis</th>
                <th width="8%">Prioritas</th>
                <th width="8%">Status</th>
                <th width="7%">Lampiran</th>
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
                <td>{{ $letter->prioritas_label ?? '-' }}</td>
                <td>{{ $letter->status_label }}</td>
                <td class="text-center">{{ $letter->file_path ? 'Ada' : '-' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="9" class="text-center">Tidak ada data surat masuk</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>Dicetak pada {{ \App\Helpers\DateHelper::formatIndonesian(now(), true) }} oleh {{ auth()->user()->name }}</p>
    </div>
</body>
</html>
