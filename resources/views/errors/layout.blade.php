<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Error') - CLASS</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <!-- Responsive CSS -->
    <link href="{{ asset('css/responsive.css') }}" rel="stylesheet">
    
    <style>
        :root {
            --primary-blue: #2563eb;
            --secondary-blue: #3b82f6;
            --light-blue: #60a5fa;
            --dark-blue: #1e40af;
            --accent-blue: #1d4ed8;
            --gradient-blue: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%);
            --gradient-blue-dark: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%);
        }
        
        body {
            background: var(--gradient-blue);
            min-height: 100vh;
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            position: relative;
            overflow-x: hidden;
        }
        
        /* Animated background elements */
        body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
            animation: backgroundShift 20s ease-in-out infinite;
        }
        
        @keyframes backgroundShift {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
        }
        
        .error-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 1;
        }
        
        .error-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 2.5rem;
            box-shadow: 
                0 25px 50px rgba(37, 99, 235, 0.15),
                0 0 0 1px rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .error-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--gradient-blue);
        }
        
        .error-icon {
            font-size: 8rem;
            margin-bottom: 2rem;
            opacity: 0.9;
            background: var(--gradient-blue);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: iconPulse 3s ease-in-out infinite;
        }
        
        @keyframes iconPulse {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.05); opacity: 1; }
        }
        
        .error-code {
            font-size: 6rem;
            font-weight: 800;
            background: var(--gradient-blue);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 1rem;
            text-shadow: 0 0 30px rgba(37, 99, 235, 0.3);
            animation: codeGlow 4s ease-in-out infinite;
        }
        
        @keyframes codeGlow {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.1); }
        }
        
        .error-title {
            font-size: 2.2rem;
            font-weight: 700;
            color: var(--dark-blue);
            margin-bottom: 1rem;
            letter-spacing: -0.5px;
        }
        
        .error-description {
            font-size: 1.15rem;
            color: #4b5563;
            margin-bottom: 2.5rem;
            line-height: 1.7;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .btn-home {
            background: var(--gradient-blue);
            border: none;
            border-radius: 50px;
            padding: 14px 32px;
            font-weight: 600;
            font-size: 1rem;
            color: white;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
            position: relative;
            overflow: hidden;
        }
        
        .btn-home::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }
        
        .btn-home:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
        }
        
        .btn-home:hover::before {
            left: 100%;
        }
        
        .btn-secondary-custom {
            background: transparent;
            border: 2px solid var(--primary-blue);
            color: var(--primary-blue);
            border-radius: 50px;
            padding: 12px 30px;
            font-weight: 600;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        
        .btn-secondary-custom::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 0;
            height: 100%;
            background: var(--gradient-blue);
            transition: width 0.3s ease;
            z-index: -1;
        }
        
        .btn-secondary-custom:hover {
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
        }
        
        .btn-secondary-custom:hover::before {
            width: 100%;
        }
        
        .floating-shapes {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: -1;
        }
        
        .shape {
            position: absolute;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            animation: float 8s ease-in-out infinite;
        }
        
        .shape:nth-child(1) {
            width: 100px;
            height: 100px;
            top: 15%;
            left: 8%;
            animation-delay: 0s;
            background: rgba(255, 255, 255, 0.15);
        }
        
        .shape:nth-child(2) {
            width: 150px;
            height: 150px;
            top: 55%;
            right: 8%;
            animation-delay: 2s;
            background: rgba(255, 255, 255, 0.08);
        }
        
        .shape:nth-child(3) {
            width: 80px;
            height: 80px;
            top: 75%;
            left: 15%;
            animation-delay: 4s;
            background: rgba(255, 255, 255, 0.12);
        }
        
        .shape:nth-child(4) {
            width: 120px;
            height: 120px;
            top: 25%;
            right: 20%;
            animation-delay: 6s;
            background: rgba(255, 255, 255, 0.06);
        }
        
        @keyframes float {
            0%, 100% { 
                transform: translateY(0px) rotate(0deg) scale(1); 
                opacity: 0.6;
            }
            50% { 
                transform: translateY(-30px) rotate(180deg) scale(1.1); 
                opacity: 1;
            }
        }
        
        /* Responsive improvements */
        @media (max-width: 768px) {
            .error-code {
                font-size: 4rem;
            }
            .error-title {
                font-size: 1.8rem;
            }
            .error-description {
                font-size: 1rem;
            }
            .error-card {
                margin: 1rem;
                border-radius: 2rem;
            }
        }
        
        /* Loading animation for better UX */
        .error-card {
            animation: slideInUp 0.6s ease-out;
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</head>
<body>
    <div class="floating-shapes">
        <div class="shape"></div>
        <div class="shape"></div>
        <div class="shape"></div>
        <div class="shape"></div>
    </div>
    
    <div class="error-container">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-8 col-md-10">
                    <div class="error-card p-5 text-center">
                        @yield('content')
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
