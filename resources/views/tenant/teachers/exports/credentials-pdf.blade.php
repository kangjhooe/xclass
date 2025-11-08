<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Kredensial Login Guru</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #333;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            color: #333;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .credentials-box {
            border: 2px solid #333;
            padding: 20px;
            margin: 20px 0;
            background-color: #f9f9f9;
        }
        .credentials-box h2 {
            margin-top: 0;
            color: #333;
            font-size: 16px;
        }
        .info-row {
            margin: 10px 0;
            padding: 5px 0;
        }
        .info-label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
        }
        .warning-box {
            border: 2px solid #ff9800;
            background-color: #fff3cd;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .warning-box strong {
            color: #856404;
        }
        .footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        table th, table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        table th {
            background-color: #366092;
            color: white;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $tenant->name }}</h1>
        <p>Kredensial Login Akun Guru</p>
        <p>Tanggal: {{ \App\Helpers\DateHelper::formatIndonesian($exportDate, true) }}</p>
    </div>

    @if(count($data) == 1)
        @php $item = $data[0]; @endphp
        <div class="credentials-box">
            <h2>Informasi Login</h2>
            <div class="info-row">
                <span class="info-label">Nama:</span>
                <span>{{ $item['teacher']->name }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email:</span>
                <span><strong>{{ $item['email'] }}</strong></span>
            </div>
            <div class="info-row">
                <span class="info-label">Password:</span>
                <span><strong style="font-size: 14px; letter-spacing: 2px;">{{ $item['password'] }}</strong></span>
            </div>
            <div class="info-row">
                <span class="info-label">URL Login:</span>
                <span>{{ url($tenant->npsn . '/login') }}</span>
            </div>
        </div>

        <div class="warning-box">
            <strong>⚠️ PENTING:</strong><br>
            Harap segera ganti password setelah login pertama kali untuk keamanan akun Anda!
        </div>
    @else
        <table>
            <thead>
                <tr>
                    <th>No</th>
                    <th>Nama Lengkap</th>
                    <th>Email</th>
                    <th>Password</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $item['teacher']->name }}</td>
                    <td><strong>{{ $item['email'] }}</strong></td>
                    <td><strong>{{ $item['password'] }}</strong></td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="warning-box">
            <strong>⚠️ PENTING:</strong><br>
            Harap segera ganti password setelah login pertama kali untuk keamanan akun Anda!<br>
            URL Login: <strong>{{ url($tenant->npsn . '/login') }}</strong>
        </div>
    @endif

    <div class="footer">
        <p>Dokumen ini dihasilkan otomatis oleh sistem {{ $tenant->name }}</p>
        <p>Mohon jaga kerahasiaan informasi kredensial login ini</p>
    </div>
</body>
</html>

