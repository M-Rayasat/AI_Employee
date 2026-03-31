@echo off
REM Windows Task Scheduler Setup for AI Employee Orchestrator
REM Run this script as Administrator

echo ========================================
echo AI Employee - Windows Task Scheduler Setup
echo ========================================
echo.

REM Get current directory
set SCRIPT_DIR=%~dp0
set PYTHON_PATH=%SCRIPT_DIR%venv\Scripts\python.exe
set ORCHESTRATOR_PATH=%SCRIPT_DIR%orchestrator.py

echo Script Directory: %SCRIPT_DIR%
echo Python Path: %PYTHON_PATH%
echo Orchestrator Path: %ORCHESTRATOR_PATH%
echo.

REM Check if Python exists
if not exist "%PYTHON_PATH%" (
    echo ERROR: Python not found at %PYTHON_PATH%
    echo Please ensure virtual environment is set up correctly.
    pause
    exit /b 1
)

REM Check if orchestrator exists
if not exist "%ORCHESTRATOR_PATH%" (
    echo ERROR: Orchestrator not found at %ORCHESTRATOR_PATH%
    pause
    exit /b 1
)

echo Creating Windows Task Scheduler task...
echo.

REM Create scheduled task
schtasks /create /tn "AI_Employee_Orchestrator" /tr "\"%PYTHON_PATH%\" \"%ORCHESTRATOR_PATH%\"" /sc onstart /ru "%USERNAME%" /rl highest /f

if %ERRORLEVEL% EQU 0 (
    echo SUCCESS: Task created successfully!
    echo.
    echo Task Name: AI_Employee_Orchestrator
    echo Trigger: At system startup
    echo Action: Run orchestrator.py
    echo.
    echo The orchestrator will now start automatically when Windows boots.
    echo.
    echo To start the task now, run:
    echo   schtasks /run /tn "AI_Employee_Orchestrator"
    echo.
    echo To stop the task, run:
    echo   schtasks /end /tn "AI_Employee_Orchestrator"
    echo.
    echo To delete the task, run:
    echo   schtasks /delete /tn "AI_Employee_Orchestrator" /f
) else (
    echo ERROR: Failed to create scheduled task.
    echo Make sure you are running this script as Administrator.
)

echo.
pause
