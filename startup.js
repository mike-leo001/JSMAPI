#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Jira Dashboard Startup Script');
console.log('=================================');

// Get startup mode from environment variable
const STARTUP_MODE = process.env.STARTUP_MODE || 'server';
const AUTO_UPDATE = process.env.AUTO_UPDATE === '1' || process.env.AUTO_UPDATE === 'true';

console.log(`Mode: ${STARTUP_MODE}`);
console.log(`Auto Update: ${AUTO_UPDATE ? 'Enabled' : 'Disabled'}\n`);

// Helper function to run shell commands
function runCommand(cmd, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
        console.log(`📌 Executing: ${cmd}`);
        const child = spawn(cmd, {
            shell: true,
            cwd: cwd,
            stdio: 'inherit'
        });
        
        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Command failed with code ${code}`));
            } else {
                resolve();
            }
        });
        
        child.on('error', (err) => {
            reject(err);
        });
    });
}

// Check if dependencies are installed
function checkDependencies() {
    const backendModules = path.join(__dirname, 'backend', 'node_modules');
    const frontendBuild = path.join(__dirname, 'frontend', 'build');
    
    return {
        backendInstalled: fs.existsSync(backendModules),
        frontendBuilt: fs.existsSync(frontendBuild)
    };
}

// Create .env file if it doesn't exist
function ensureEnvFile() {
    const envPath = path.join(__dirname, 'backend', '.env');
    const envExamplePath = path.join(__dirname, 'backend', 'env.example');
    
    if (!fs.existsSync(envPath)) {
        console.log('⚠️  No .env file found, creating from example...');
        
        if (fs.existsSync(envExamplePath)) {
            fs.copyFileSync(envExamplePath, envPath);
        } else {
            // Create a basic .env file
            const envContent = `JIRA_HOST=${process.env.JIRA_HOST || 'https://your-domain.atlassian.net'}
JIRA_EMAIL=${process.env.JIRA_EMAIL || 'your-email@example.com'}
JIRA_API_TOKEN=${process.env.JIRA_API_TOKEN || 'your-jira-api-token'}
PORT=${process.env.SERVER_PORT || '5000'}
NODE_ENV=${process.env.NODE_ENV || 'production'}
FRONTEND_URL=`;
            
            fs.writeFileSync(envPath, envContent);
        }
        console.log('✅ .env file created');
    }
}

// Main startup modes
const startupModes = {
    // Normal server mode
    server: async () => {
        console.log('🌐 Starting in SERVER mode...\n');
        
        // Check dependencies
        const deps = checkDependencies();
        
        if (!deps.backendInstalled) {
            console.log('❌ Backend dependencies not installed!');
            console.log('💡 Change STARTUP_MODE to "install" and restart\n');
            process.exit(1);
        }
        
        if (!deps.frontendBuilt) {
            console.log('⚠️  Frontend not built. Dashboard may not work properly.');
            console.log('💡 Change STARTUP_MODE to "build" and restart\n');
        }
        
        // Ensure .env exists
        ensureEnvFile();
        
        // Auto update if enabled
        if (AUTO_UPDATE && fs.existsSync(path.join(__dirname, '.git'))) {
            console.log('🔄 Auto-update enabled, pulling latest changes...');
            try {
                await runCommand('git pull');
                console.log('✅ Updated to latest version\n');
            } catch (error) {
                console.log('⚠️  Auto-update failed:', error.message);
            }
        }
        
        // Start the server
        console.log('🚀 Starting server...');
        await runCommand('node server.js', path.join(__dirname, 'backend'));
    },
    
    // Install dependencies
    install: async () => {
        console.log('📦 Starting in INSTALL mode...\n');
        
        // Ensure .env exists first
        ensureEnvFile();
        
        console.log('📦 Installing backend dependencies...');
        await runCommand('npm install', path.join(__dirname, 'backend'));
        
        console.log('\n📦 Installing frontend dependencies...');
        await runCommand('npm install', path.join(__dirname, 'frontend'));
        
        console.log('\n✅ All dependencies installed!');
        console.log('💡 Change STARTUP_MODE back to "server" to start the application');
    },
    
    // Build frontend
    build: async () => {
        console.log('🔨 Starting in BUILD mode...\n');
        
        const deps = checkDependencies();
        
        if (!deps.backendInstalled) {
            console.log('❌ Backend dependencies not installed!');
            console.log('💡 Run with STARTUP_MODE=install first\n');
            process.exit(1);
        }
        
        console.log('🔨 Building React frontend...');
        await runCommand('npm run build', path.join(__dirname, 'frontend'));
        
        console.log('\n✅ Frontend built successfully!');
        console.log('💡 Change STARTUP_MODE back to "server" to start the application');
    },
    
    // Full rebuild
    rebuild: async () => {
        console.log('🧹 Starting in REBUILD mode...\n');
        console.log('This will clean and reinstall everything...\n');
        
        // Remove node_modules
        const backendModules = path.join(__dirname, 'backend', 'node_modules');
        const frontendModules = path.join(__dirname, 'frontend', 'node_modules');
        
        if (fs.existsSync(backendModules)) {
            console.log('🗑️  Removing backend node_modules...');
            fs.rmSync(backendModules, { recursive: true, force: true });
        }
        
        if (fs.existsSync(frontendModules)) {
            console.log('🗑️  Removing frontend node_modules...');
            fs.rmSync(frontendModules, { recursive: true, force: true });
        }
        
        // Now install everything
        await startupModes.install();
        console.log('');
        await startupModes.build();
    },
    
    // Check environment
    'check-env': async () => {
        console.log('🔍 Starting in CHECK-ENV mode...\n');
        
        ensureEnvFile();
        
        const checkScript = path.join(__dirname, 'backend', 'check-config.js');
        if (fs.existsSync(checkScript)) {
            await runCommand('node check-config.js', path.join(__dirname, 'backend'));
        } else {
            console.log('❌ check-config.js not found in backend directory');
        }
        
        console.log('\n💡 Change STARTUP_MODE back to "server" to start the application');
    },
    
    // Test Jira connection
    'test-jira': async () => {
        console.log('🔗 Starting in TEST-JIRA mode...\n');
        
        ensureEnvFile();
        
        const testScript = path.join(__dirname, 'backend', 'test-jira.js');
        if (fs.existsSync(testScript)) {
            await runCommand('node test-jira.js', path.join(__dirname, 'backend'));
        } else {
            console.log('❌ test-jira.js not found in backend directory');
        }
        
        console.log('\n💡 Change STARTUP_MODE back to "server" to start the application');
    }
};

// Main function
async function main() {
    try {
        if (startupModes[STARTUP_MODE]) {
            await startupModes[STARTUP_MODE]();
        } else {
            console.error(`❌ Unknown startup mode: ${STARTUP_MODE}`);
            console.log('\nAvailable modes:');
            console.log('  server     - Start the application (default)');
            console.log('  install    - Install all dependencies');
            console.log('  build      - Build the frontend');
            console.log('  rebuild    - Clean install everything');
            console.log('  check-env  - Check environment configuration');
            console.log('  test-jira  - Test Jira API connection');
            console.log('\nSet STARTUP_MODE environment variable in Pterodactyl');
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ Startup failed:', error.message);
        process.exit(1);
    }
}

// Run main function
main(); 