@echo off
start cmd /k "title 8da2_1&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 5&&title 8da2_5&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 10&&title 8da2_10&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 20&&title 8da2_20&&node app"  
