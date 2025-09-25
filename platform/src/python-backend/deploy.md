# Pluto Backend Deployment Guide

## Deploy to Render

### Prerequisites
- GitHub repository with your code
- Supabase account and project

### Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy backend to Render"
   git push origin main
   ```

2. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up and connect GitHub

3. **Deploy Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Set root directory to: `platform/src/python-backend`

4. **Configuration**
   - **Name**: `pluto-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. **Environment Variables**
   Add these in Render dashboard:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_KEY`: Your Supabase service key

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Get your backend URL (e.g., `https://pluto-backend.onrender.com`)

### Alternative: Deploy to Railway (if Render fails)

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy: `railway up`
5. Set environment variables in Railway dashboard

### Update Frontend
Once backend is deployed, update your frontend to use the new backend URL.
