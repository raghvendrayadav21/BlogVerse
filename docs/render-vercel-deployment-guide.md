# BlogVerse - Vercel (Frontend) & Render (Backend) Deployment Guide

This guide explains how to deploy **BlogVerse Frontend** on **Vercel** and **Backend Microservices** on **Render / Managed Cloud**.

---

## ⚡ Part 1: Deploy Frontend on Vercel (1-Click / 2 Minutes)

Since your project is connected to GitHub (`raghvendrayadav21/BlogVerse`), Vercel will automatically deploy it with continuous integration!

### Steps:

1. Open [vercel.com](https://vercel.com) and Log in with your **GitHub Account**.
2. Click **"Add New..."** → Select **"Project"**.
3. Import your GitHub repository: **`raghvendrayadav21/BlogVerse`**.
4. Configure Project Settings:
   - **Root Directory**: Click `Edit` and select `frontend`.
   - **Framework Preset**: `Vite` (Auto-detected).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables** (Add under Project Settings):
   - `VITE_API_BASE_URL` = `https://<YOUR_RENDER_GATEWAY_URL>` (e.g. `https://blogverse-gateway.onrender.com`)
6. Click **Deploy**! 🎉

Vercel will give you a live production domain URL like:
`https://blog-verse-frontend.vercel.app`

---

## 🛠️ Part 2: Deploy Backend & Database on Render

Render offers free Web Services and Docker support connected to GitHub.

### Step 1: Database Setup (Free MySQL)

1. Go to [aiven.io](https://aiven.io) or [railway.app](https://railway.app) or Render MySQL.
2. Create a Free MySQL Database instance.
3. Note down your Database connection details:
   - Host / Port
   - Username / Password (`Raghav@21`)
   - Import `scripts/db-init.sql`.

### Step 2: Deploy Backend Services on Render

1. Open [render.com](https://render.com) and log in with GitHub.
2. Click **"New +"** → Select **"Web Service"**.
3. Connect repository `raghvendrayadav21/BlogVerse`.
4. Create Web Service for **API Gateway / Backend**:
   - **Name**: `blogverse-api-gateway`
   - **Root Directory**: `backend`
   - **Environment**: `Java` or `Docker`
   - **Build Command**: `./mvnw clean package -DskipTests` (or `mvn clean package -DskipTests`)
   - **Start Command**: `java -jar api-gateway/target/api-gateway-1.0.0.jar`
   - **Environment Variables**:
     - `SPRING_DATASOURCE_PASSWORD` = `Raghav@21`
5. Click **Create Web Service**.

---
