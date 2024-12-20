#!/bin/bash

# Make script exit on any error
set -e

# Update system
echo "Updating system..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
echo "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Install PM2 globally
echo "Installing PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# Install project dependencies
echo "Installing dependencies..."
npm install

# Build project
echo "Building project..."
npm run build

# Stop any existing instances
if command -v pm2 &> /dev/null; then
    pm2 delete cryptoswap 2>/dev/null || true
fi

# Start application with PM2
echo "Starting application..."
pm2 start ecosystem.config.cjs

# Configure auto-start
echo "Configuring auto-start..."
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
pm2 save

echo "Installation complete! Application is accessible at http://localhost:3000"