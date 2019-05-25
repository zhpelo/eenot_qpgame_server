@echo off
start cmd /k "node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 5&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 10&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 50&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 100&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 500&&node app"  