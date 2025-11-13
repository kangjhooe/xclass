@echo off
echo ========================================
echo   Migration: Academic Tracking
echo ========================================
echo.

set MYSQL_PATH=C:\xampp\mysql\bin\mysql.exe
set SQL_FILE=database\sql\add_student_academic_tracking_simple.sql

echo [INFO] Menjalankan migration...
echo.

"%MYSQL_PATH%" -u root xclass < "%SQL_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Migration berhasil dijalankan!
) else (
    echo [WARNING] Ada beberapa error, tapi mungkin normal jika kolom sudah ada
)

echo.
echo [INFO] Memverifikasi migration...
echo.

"%MYSQL_PATH%" -u root xclass -e "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'xclass' AND TABLE_NAME = 'students' AND COLUMN_NAME IN ('academic_level', 'current_grade', 'academic_year');"

echo.
echo [SUCCESS] Selesai!
echo.

pause

