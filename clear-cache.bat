@echo off
echo Clearing Vite cache...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Vite cache cleared successfully!
) else (
    echo No Vite cache found.
)
if exist "node_modules\.vite-temp" (
    rmdir /s /q "node_modules\.vite-temp"
    echo Vite temp cache cleared!
)
echo.
echo Cache cleared! Now restart your dev server with: npm run dev
pause
