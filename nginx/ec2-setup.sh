#!/bin/bash
# Run this ONCE on a fresh AWS EC2 Ubuntu instance to set up the server

set -e

echo "--- Updating system ---"
sudo apt update && sudo apt upgrade -y

echo "--- Installing Node.js 20 ---"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "--- Installing PM2 ---"
sudo npm install -g pm2
pm2 startup systemd -u ubuntu --hp /home/ubuntu
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo "--- Installing Nginx ---"
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

echo "--- Installing Certbot (SSL) ---"
sudo apt install -y certbot python3-certbot-nginx

echo "--- Creating app directory ---"
sudo mkdir -p /var/www/tokomort
sudo chown -R ubuntu:ubuntu /var/www/tokomort

echo "--- Copying Nginx config ---"
sudo cp tokomort.conf /etc/nginx/sites-available/tokomort
sudo ln -sf /etc/nginx/sites-available/tokomort /etc/nginx/sites-enabled/tokomort
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "Setup complete!"
echo "Next: Run certbot to get SSL certificate:"
echo "  sudo certbot --nginx -d your-domain.com -d www.your-domain.com"
