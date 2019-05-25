@echo off
start cmd /k "title 28game_1&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 5&&title 28game_5&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 10&&title 28game_10&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd 20&&title 28game_20&&node app"  
