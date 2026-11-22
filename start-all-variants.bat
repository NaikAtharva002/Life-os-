@echo off
echo ========================================================
echo  LIFE OS -- Launching All 3 Design Variants Simultaneously
echo ========================================================
echo  Port 5173: Variant 1 (Antigravity Original: Obsidian Executive)
echo  Port 5174: Variant 2 (Taste-Skill Influenced: Curated Aesthetic)
echo  Port 5175: Variant 3 (Impeccable Influenced: Strict Swiss Grid)
echo ========================================================

start "LIFE OS - Port 5173 (Obsidian Executive)" cmd /k "cd /d C:\Users\athar\.gemini\antigravity\scratch\life-os && npm run dev"
start "LIFE OS - Port 5174 (Taste-Skill Craft)" cmd /k "cd /d C:\Users\athar\.gemini\antigravity\scratch\life-os-taste && npm run dev"
start "LIFE OS - Port 5175 (Impeccable System)" cmd /k "cd /d C:\Users\athar\.gemini\antigravity\scratch\life-os-impeccable && npm run dev"

echo All 3 instances started in background windows!
echo Open in browser:
echo  - http://localhost:5173 (Variant 1: Obsidian Executive)
echo  - http://localhost:5174 (Variant 2: Taste-Skill Craft)
echo  - http://localhost:5175 (Variant 3: Impeccable Swiss Grid)
pause
