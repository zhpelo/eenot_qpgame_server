@echo off
start cmd /k "title landlord_1&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 5&&title landlord_5&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 10&&title landlord_10&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 20&&title landlord_20&&node app"  
