# 🚀 Simple Manual Deployment

## 📁 Your Clean Backend Structure
```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── render.yaml        # Render configuration (optional)
├── railway.json       # Railway configuration (optional)  
├── .env.example       # Environment variables template
└── README.md          # Deployment guide
```

## ⚡ Quick Deploy Steps

### Step 1: Choose Platform & Deploy Backend
Pick **ONE** platform and follow their guide:

#### 🟢 Render.com (Recommended)
1. [render.com](https://render.com) → Sign up → Connect GitHub
2. **New Web Service** → Select your repository
3. **Settings**:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
4. **Deploy** → Get your URL: `https://your-app.onrender.com`

#### 🚂 Railway (Alternative)
1. [railway.app](https://railway.app) → Login with GitHub  
2. **New Project** → Deploy from GitHub repo
3. Select repository → Set Root Directory: `backend`
4. **Deploy** → Get your URL: `https://your-app.up.railway.app`

### Step 2: Update Frontend & Deploy
1. **Edit** `src/js/api-config.js` → Replace `BASE_URL` with your backend URL
2. **Push to GitHub** 
3. **Enable GitHub Pages** in repository settings
4. **Access**: `https://yourusername.github.io/repository-name`

## ✅ Test Your Deployment
1. Visit: `https://your-backend-url/health` → Should return `{"status": "healthy"}`
2. Use your web app → Upload CSV → Test Gmail connection → Send emails

## 🎉 Done!
Your app is now live with:
- ✅ Backend: Auto-scaling cloud hosting
- ✅ Frontend: GitHub Pages with global CDN  
- ✅ Features: Full email automation

**No Docker, no complex configs - just simple cloud deployment!**