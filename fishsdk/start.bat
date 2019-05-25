@echo off

start cmd /k "cd server&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd fishserver5倍房&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd fishserver10倍房&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd fishserver50倍房&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd fishserver100倍房&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd fishserver500倍房&&node app"  
choice /t 1 /d y /n >nul
start cmd /k "cd fishserver&&node app"  