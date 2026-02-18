@echo off
echo ===================================
echo PDF Compressor
echo ===================================
echo.

if "%~1"=="" (
    echo Drag and drop a PDF file onto this batch file
    echo Or use: compress.bat yourfile.pdf [target_kb]
    echo.
    echo Examples:
    echo   compress.bat document.pdf        (max compression^)
    echo   compress.bat document.pdf 500    (compress to 500 KB^)
    pause
    exit /b 1
)

python compress_pdf.py "%~1" %2

echo.
pause
