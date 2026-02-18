@echo off
echo ===================================
echo Installing PDF Compression Tools
echo ===================================
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo Installing required packages...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

echo.
echo ===================================
echo Installation Complete!
echo ===================================
echo.
echo You can now use:
echo   python compress_pdf.py yourfile.pdf
echo   python compress_pdf.py yourfile.pdf 500
echo.
pause
