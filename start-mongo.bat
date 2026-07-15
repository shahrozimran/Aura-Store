@echo off
title Local MongoDB Server
echo Starting local MongoDB Server using database path: C:\data\db
echo Keep this window open while you run your project!
echo.
"C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "C:\data\db"
if errorlevel 1 (
    echo.
    echo ERROR: Failed to start MongoDB. 
    echo Please make sure no other instance is running and you have permissions.
)
pause
