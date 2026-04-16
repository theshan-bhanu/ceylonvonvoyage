@echo off
echo Starting CeylonVoyage Development Server...
echo ------------------------------------------
echo 1. Once started, open: http://localhost:5173
echo 2. If the page is blank, check the Browser Console (F12)
echo 3. The setup overlay is now hidden by default (Demo Mode).
echo ------------------------------------------
call node_modules\.bin\vite.cmd
pause