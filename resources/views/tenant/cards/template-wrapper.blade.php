<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kartu Tanda</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background: #fff;
            padding: 20px;
        }
        
        .card-container {
            width: 600px;
            height: 400px;
            margin: 0 auto;
            position: relative;
            overflow: hidden;
        }
        
        {!! $css !!}
    </style>
</head>
<body>
    <div class="card-container">
        {!! $html !!}
        
        @if($barcode_image)
            <div class="barcode-container" style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);">
                <img src="{{ $barcode_image }}" alt="Barcode" style="max-width: 300px; height: auto;">
            </div>
        @endif
        
        @if($photo)
            <div class="photo-container" style="position: absolute; top: 20px; right: 20px;">
                <img src="{{ $photo }}" alt="Photo" style="width: 120px; height: 150px; object-fit: cover; border-radius: 5px;">
            </div>
        @endif
    </div>
</body>
</html>

