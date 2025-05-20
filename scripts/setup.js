#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function executeCommand(command, cwd = process.cwd()) {
  try {
    log(`Executing: ${command}`, colors.blue);
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`Error executing command: ${command}`, colors.red);
    log(error.toString(), colors.red);
    return false;
  }
}

function checkDependencies() {
  log('Checking dependencies...', colors.blue);
  
  try {
    // Check Node.js version
    const nodeVersion = execSync('node --version').toString().trim();
    log(`Node.js version: ${nodeVersion}`, colors.green);
    
    // Check npm version
    const npmVersion = execSync('npm --version').toString().trim();
    log(`npm version: ${npmVersion}`, colors.green);
    
    // Check if Rust is installed (for Solana development)
    try {
      const rustcVersion = execSync('rustc --version').toString().trim();
      log(`Rust version: ${rustcVersion}`, colors.green);
    } catch (error) {
      log('Rust not installed. It is required for Solana program development.', colors.yellow);
      log('Visit https://www.rust-lang.org/tools/install to install Rust.', colors.yellow);
    }
    
    // Check if Solana CLI is installed
    try {
      const solanaVersion = execSync('solana --version').toString().trim();
      log(`Solana CLI version: ${solanaVersion}`, colors.green);
    } catch (error) {
      log('Solana CLI not installed. It is required for Solana development.', colors.yellow);
      log('Visit https://docs.solana.com/cli/install-solana-cli-tools for installation instructions.', colors.yellow);
    }
    
    return true;
  } catch (error) {
    log('Error checking dependencies:', colors.red);
    log(error.toString(), colors.red);
    return false;
  }
}

function setupDirectories() {
  log('Setting up project directories...', colors.blue);
  
  // Create docs assets directory if it doesn't exist
  const docsAssetsDir = path.join(process.cwd(), 'docs', 'assets');
  if (!fs.existsSync(docsAssetsDir)) {
    fs.mkdirSync(docsAssetsDir, { recursive: true });
    log(`Created directory: ${docsAssetsDir}`, colors.green);
  }
  
  return true;
}

function installDependencies() {
  log('Installing project dependencies...', colors.blue);
  
  // Install root project dependencies
  if (!executeCommand('npm install')) {
    return false;
  }
  
  // Install frontend dependencies
  const frontendDir = path.join(process.cwd(), 'frontend');
  if (fs.existsSync(path.join(frontendDir, 'package.json'))) {
    if (!executeCommand('npm install', frontendDir)) {
      return false;
    }
  } else {
    log('Frontend package.json not found. Skipping frontend dependencies.', colors.yellow);
  }
  
  // Install Solana programs dependencies
  const solanaDir = path.join(process.cwd(), 'solana');
  if (fs.existsSync(path.join(solanaDir, 'package.json'))) {
    if (!executeCommand('npm install', solanaDir)) {
      return false;
    }
  } else {
    log('Solana package.json not found. Skipping Solana dependencies.', colors.yellow);
  }
  
  // Install SDK dependencies
  const sdkDir = path.join(process.cwd(), 'sdk');
  if (fs.existsSync(path.join(sdkDir, 'package.json'))) {
    if (!executeCommand('npm install', sdkDir)) {
      return false;
    }
  } else {
    log('SDK package.json not found. Skipping SDK dependencies.', colors.yellow);
  }
  
  return true;
}

function setupEnvironment() {
  log('Setting up environment...', colors.blue);
  
  // Create .env file if it doesn't exist
  const envFile = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envFile)) {
    const envContent = `# MIYA Protocol Environment Variables
NODE_ENV=development

# Solana Configuration
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com

# Application Settings
PORT=3000
API_URL=http://localhost:8000

# Development Settings
DEBUG=true
`;
    fs.writeFileSync(envFile, envContent);
    log('Created .env file with default settings', colors.green);
  } else {
    log('.env file already exists, skipping', colors.yellow);
  }
  
  return true;
}

// Main setup function
async function setup() {
  log('🚀 Setting up MIYA Protocol development environment...', colors.green);
  
  const steps = [
    { name: 'Check Dependencies', function: checkDependencies },
    { name: 'Setup Directories', function: setupDirectories },
    { name: 'Install Dependencies', function: installDependencies },
    { name: 'Setup Environment', function: setupEnvironment },
  ];
  
  for (const step of steps) {
    log(`\n📦 ${step.name}...`, colors.blue);
    const success = await step.function();
    if (!success) {
      log(`\n❌ Setup failed at step: ${step.name}`, colors.red);
      process.exit(1);
    }
  }
  
  log('\n✅ Setup completed successfully!', colors.green);
  log('\nNext steps:', colors.blue);
  log('1. Start development server: npm run dev', colors.yellow);
  log('2. Build the project: npm run build', colors.yellow);
  log('3. Run tests: npm test', colors.yellow);
}

// Run the setup
setup(); 