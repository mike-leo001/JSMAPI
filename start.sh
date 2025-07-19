#!/bin/bash
cd /home/container

# Check if auto-update is enabled
if [ "${AUTO_UPDATE}" == "1" ]; then
    if [ -d ".git" ]; then
        echo "Auto-update enabled. Pulling latest changes..."
        git pull
        
        # Rebuild if package files changed
        if git diff --name-only HEAD@{1} | grep -E "(package\.json|package-lock\.json)"; then
            echo "Dependencies changed. Reinstalling..."
            cd backend && npm install --production
            cd ../frontend && npm install && npm run build
            cd ..
        fi
    fi
fi

# Ensure .env file exists
if [ ! -f backend/.env ]; then
    echo "Error: backend/.env file not found!"
    echo "Creating from example..."
    if [ -f backend/env.example ]; then
        cp backend/env.example backend/.env
    else
        echo "Error: No env.example file found. Please configure your Jira credentials."
        exit 1
    fi
fi

# Replace any Pterodactyl variables in .env
sed -i "s/{{server.build.default.port}}/${SERVER_PORT}/g" backend/.env

# Start the application
echo "Starting Jira Dashboard..."
exec npm start 