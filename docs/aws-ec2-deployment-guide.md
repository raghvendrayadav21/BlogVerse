# BlogVerse - AWS EC2 Deployment Guide (Option 1: Single EC2 + Nginx)

This guide provides step-by-step instructions to deploy the complete **BlogVerse** microservices application and React frontend on a single **AWS EC2** instance using **Nginx**, **Java 21**, and **MySQL**.

---

## 📋 System Prerequisites

| Component | Recommendation |
| :--- | :--- |
| **AWS EC2 Instance** | Ubuntu 22.04 LTS or 24.04 LTS (`t3.medium` or `t3.large`) |
| **Storage** | 30 GB EBS Volume (gp3) |
| **Security Group Ports** | `22` (SSH), `80` (HTTP), `443` (HTTPS), `8080` (API Gateway) |
| **Java Version** | OpenJDK 21 |
| **Web Server** | Nginx (Reverse Proxy + Static Hosting) |
| **Database** | Local MySQL Server on EC2 **OR** AWS RDS MySQL |

---

## 🚀 Step-by-Step Deployment Guide

### Step 1: Launch & Connect to AWS EC2 Instance

1. Open AWS Console → Navigate to **EC2** → Click **Launch Instance**.
2. **Name**: `BlogVerse-Server`
3. **AMI**: Ubuntu 24.04 LTS (64-bit x86)
4. **Instance Type**: `t3.medium` (2 vCPU, 4 GiB RAM)
5. **Key Pair**: Select or create a `.pem` key pair (`blogverse-key.pem`).
6. **Network Settings (Security Group)**:
   - Allow **SSH** (Port 22) from Anywhere / Your IP.
   - Allow **HTTP** (Port 80) from Anywhere (`0.0.0.0/0`).
   - Allow **HTTPS** (Port 443) from Anywhere (`0.0.0.0/0`).
7. **Storage**: 30 GB gp3.
8. Click **Launch Instance**.
9. Connect via SSH:
   ```bash
   ssh -i "blogverse-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
   ```

---

### Step 2: Install Java 21, Node.js, Maven & Nginx on EC2

Run the following commands on your EC2 instance:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install OpenJDK 21, Maven, Git, Nginx
sudo apt install -y openjdk-21-jdk maven git nginx curl

# Install Node.js 20 & npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
java -version
mvn -version
node -v
nginx -v
```

---

### Step 3: MySQL Database Setup

#### Option A: Local MySQL on EC2 (Free Tier Friendly)

```bash
# Install MySQL Server
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Log into MySQL root shell
sudo mysql -u root
```

Inside MySQL shell, execute:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Raghav@21';

CREATE DATABASE IF NOT EXISTS blogverse_auth;
CREATE DATABASE IF NOT EXISTS blogverse_user;
CREATE DATABASE IF NOT EXISTS blogverse_post;
CREATE DATABASE IF NOT EXISTS blogverse_interaction;
CREATE DATABASE IF NOT EXISTS blogverse_notification;
CREATE DATABASE IF NOT EXISTS blogverse_media;
CREATE DATABASE IF NOT EXISTS blogverse_search;

FLUSH PRIVILEGES;
EXIT;
```

---

### Step 4: Clone Repository & Build Project

```bash
# Navigate to home directory and clone repository
cd ~
git clone https://github.com/raghvendrayadav21/BlogVerse.git
cd BlogVerse

# Import database initialization script
mysql -u root -p'Raghav@21' < scripts/db-init.sql

# Build Backend Microservices JARs
mvn clean package -DskipTests -f backend/pom.xml

# Build Frontend Static Assets
cd frontend
npm install
npm run build
cd ..
```

---

### Step 5: Start Microservices Daemons

You can launch microservices in the background using `nohup`:

```bash
# Set DB Password environment variable
export SPRING_DATASOURCE_PASSWORD="Raghav@21"

# 1. Start Eureka Server
nohup java -DSPRING_DATASOURCE_PASSWORD=$SPRING_DATASOURCE_PASSWORD -jar backend/eureka-server/target/eureka-server-1.0.0.jar > logs/eureka.log 2>&1 &
sleep 10

# 2. Start Auth Service
nohup java -DSPRING_DATASOURCE_PASSWORD=$SPRING_DATASOURCE_PASSWORD -jar backend/auth-service/target/auth-service-1.0.0.jar > logs/auth.log 2>&1 &
sleep 5

# 3. Start User Service
nohup java -DSPRING_DATASOURCE_PASSWORD=$SPRING_DATASOURCE_PASSWORD -DUSER_SERVICE_PORT=8088 -jar backend/user-service/target/user-service-1.0.0.jar > logs/user.log 2>&1 &
sleep 5

# 4. Start API Gateway
nohup java -DSPRING_DATASOURCE_PASSWORD=$SPRING_DATASOURCE_PASSWORD -jar backend/api-gateway/target/api-gateway-1.0.0.jar > logs/gateway.log 2>&1 &
sleep 5

# 5. Start Post Service
nohup java -DSPRING_DATASOURCE_PASSWORD=$SPRING_DATASOURCE_PASSWORD -jar backend/post-service/target/post-service-1.0.0.jar > logs/post.log 2>&1 &
sleep 5

# 6. Start Interaction Service
nohup java -DSPRING_DATASOURCE_PASSWORD=$SPRING_DATASOURCE_PASSWORD -jar backend/interaction-service/target/interaction-service-1.0.0.jar > logs/interaction.log 2>&1 &
sleep 5

# 7. Start Media Service
nohup java -DSPRING_DATASOURCE_PASSWORD=$SPRING_DATASOURCE_PASSWORD -jar backend/media-service/target/media-service-1.0.0.jar > logs/media.log 2>&1 &
sleep 5

# 8. Start Notification Service
nohup java -DSPRING_DATASOURCE_PASSWORD=$SPRING_DATASOURCE_PASSWORD -jar backend/notification-service/target/notification-service-1.0.0.jar > logs/notification.log 2>&1 &
```

---

### Step 6: Configure Nginx Reverse Proxy & Frontend

Create Nginx site configuration file `/etc/nginx/sites-available/blogverse`:

```bash
sudo nano /etc/nginx/sites-available/blogverse
```

Paste the following configuration:

```nginx
server {
    listen 80;
    server_name _; # Or your custom domain

    # Frontend Static Build
    root /home/ubuntu/BlogVerse/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Gateway Reverse Proxy
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Media Uploads Static Server
    location /uploads/ {
        proxy_pass http://localhost:8085/uploads/;
        proxy_set_header Host $host;
    }
}
```

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/blogverse /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

### Step 7: SSL Certificate (HTTPS) with Certbot (Optional Domain Setup)

If you point a domain name (e.g., `blogverse.yourdomain.com`) to your EC2 Public IP:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d blogverse.yourdomain.com
```

---

## ✅ Deployment Verification Checklist

| Test | Command / URL |
| :--- | :--- |
| **Frontend Access** | Open `http://<EC2_PUBLIC_IP>` in browser |
| **API Gateway Health** | `curl http://localhost:8080/actuator/health` |
| **Eureka Server Dashboard** | Open `http://<EC2_PUBLIC_IP>:8761` |
| **Trending Tags API** | `curl http://localhost:8080/api/posts/tags/trending` |

---
