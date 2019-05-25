@echo off
start cmd /k "title jindian_1&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 5&&title jindian_5&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 10&&title jindian_10&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 20&&title jindian_20&&node app"  
