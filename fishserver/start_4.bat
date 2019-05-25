@echo off
start cmd /k "cd 10&&title fish_1&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 50&&title fish_5&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 100&&title fish_50&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 500&&title fish_100&&node app"  
