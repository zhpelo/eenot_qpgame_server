@echo off
start cmd /k "title qiang_1&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 5&&title qiang_5&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 10&&title qiang_10&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 20&&title qiang_20&&node app"  
