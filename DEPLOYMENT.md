# SIDETRADE DApp - Deployment Guide

## Pre-Deployment Checklist

### ✅ Backend Ready
- [x] Server code in `server/`
- [x] Dependencies in `package.json`
- [x] Environment variables configured
- [x] API endpoints tested
- [x] Telegram bot working
- [x] SideShift API integrated

### ✅ Frontend Ready
- [x] React app in `client/src/`
- [x] Build configuration (Vite)
- [x] Environment variables
- [x] All pages implemented
- [x] API client configured

## Backend Deployment

### Option 1: Railway (Recommended)

1. **Create Railway Account**
   - Visit https://railway.app
   - Sign up with GitHub

2. **Deploy Backend**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login
   railway login

   # Initialize project
   railway init

   # Deploy
   railway up
   ```

3. **Set Environment Variables**
   Go to Railway dashboard → Variables:
   ```
   TELEGRAM_BOT_TOKEN=8302633822:AAHYDKVH2JKkdTNsmYk3CxAqGnPIaz8FdNE
   TELEGRAM_BOT_NAME=yurishift_bot
   SIDESHIFT_API_KEY=2819c53d260130d733ed080910167693
   SIDESHIFT_API_URL=https://sideshift.ai/api/v2
   PORT=3001
   NODE_ENV=production
   PRICE_UPDATE_INTERVAL=30000
   MARKET_UPDATE_INTERVAL=60000
   ```

4. **Configure Start Command**
   Railway auto-detects `npm start` from package.json

### Option 2: Render

1. **Create Render Account**
   - Visit https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Connect your repository
   - Select "Node" environment
   - Build command: `npm install`
   - Start command: `npm start`

3. **Environment Variables**
   Add all variables from Railway example above

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create App**
   ```bash
   heroku create SIDETRADE-backend
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set TELEGRAM_BOT_TOKEN=8302633822:AAHYDKVH2JKkdTNsmYk3CxAqGnPIaz8FdNE
   heroku config:set TELEGRAM_BOT_NAME=yurishift_bot
   heroku config:set SIDESHIFT_API_KEY=2819c53d260130d733ed080910167693
   heroku config:set SIDESHIFT_API_URL=https://sideshift.ai/api/v2
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Build Frontend**
   ```bash
   cd client
   npm run build
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variable**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

5. **Redeploy**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build**
   ```bash
   cd client
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Set Environment Variable**
   In Netlify dashboard → Site settings → Environment variables:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

### Option 3: Cloudflare Pages

1. **Login to Cloudflare**
   - Visit https://pages.cloudflare.com

2. **Connect Repository**
   - Connect your GitHub repo
   - Select `client` directory

3. **Build Settings**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `client`

4. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```

## Manual Deployment (VPS)

### Setup on Ubuntu/Debian VPS

1. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd sidetrade
   ```

3. **Install Dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

4. **Create .env**
   ```bash
   nano .env
   # Paste your environment variables
   ```

5. **Build Frontend**
   ```bash
   cd client
   npm run build
   cd ..
   ```

6. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

7. **Start Backend with PM2**
   ```bash
   pm2 start server/index.js --name SIDETRADE-backend
   pm2 save
   pm2 startup
   ```

8. **Serve Frontend with Nginx**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/SIDETRADE
   ```

   Nginx config:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /path/to/sidetrade/client/dist;
           try_files $uri $uri/ /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/SIDETRADE /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Post-Deployment

### 1. Test Backend

```bash
# Replace with your deployed URL
curl https://your-backend-url.railway.app/api/health
```

Expected:
```json
{
  "status": "healthy",
  "bot": "running",
  "subscribers": 0,
  "lastUpdate": "..."
}
```

### 2. Test Frontend

Visit your deployed URL and verify:
- [ ] Dashboard loads
- [ ] Markets page shows pairs
- [ ] Swap page works
- [ ] Telegram bot link works

### 3. Test Telegram Bot

1. Open https://t.me/yurishift_bot
2. Send `/start`
3. Verify bot responds
4. Test `/pairs` command
5. Test `/quote eth usdc`

### 4. Monitor Logs

**Railway:**
```bash
railway logs
```

**Render:**
Check dashboard → Logs tab

**Heroku:**
```bash
heroku logs --tail
```

**PM2:**
```bash
pm2 logs SIDETRADE-backend
```

## Domain Setup (Optional)

### 1. Purchase Domain
Use Namecheap, GoDaddy, or Cloudflare

### 2. Configure DNS

**For Frontend (Vercel/Netlify):**
- Type: CNAME
- Name: @
- Value: <your-vercel-app>.vercel.app

**For Backend (Railway):**
- Type: CNAME
- Name: api
- Value: <your-railway-app>.railway.app

### 3. Update Environment Variables

Update `VITE_API_URL` in frontend deployment:
```
VITE_API_URL=https://api.yourdomain.com/api
```

### 4. Enable SSL

Most platforms (Vercel, Netlify, Railway) provide free SSL automatically.

For manual VPS setup:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Production Environment Variables

### Backend (.env)
```env
# Production
NODE_ENV=production

# Telegram
TELEGRAM_BOT_TOKEN=8302633822:AAHYDKVH2JKkdTNsmYk3CxAqGnPIaz8FdNE
TELEGRAM_BOT_NAME=yurishift_bot

# SideShift
SIDESHIFT_API_KEY=2819c53d260130d733ed080910167693
SIDESHIFT_API_URL=https://sideshift.ai/api/v2

# Server
PORT=3001

# Updates
PRICE_UPDATE_INTERVAL=30000
MARKET_UPDATE_INTERVAL=60000
```

### Frontend (Vercel/Netlify)
```env
VITE_API_URL=https://your-backend-url/api
```

## Monitoring & Maintenance

### Health Checks

Set up monitoring with:
- UptimeRobot (free)
- Pingdom
- StatusCake

Monitor:
- `https://your-backend-url/api/health`
- `https://your-frontend-url`

### Telegram Bot Webhook (Advanced)

For production, consider using webhooks instead of polling:

```javascript
// In server/bot/telegramBot.js
const WEBHOOK_URL = process.env.WEBHOOK_URL;

if (process.env.NODE_ENV === 'production') {
  this.bot.setWebHook(`${WEBHOOK_URL}/webhook`);
} else {
  this.bot.startPolling();
}
```

### Log Aggregation

Consider using:
- Logtail
- Papertrail
- Sentry (for error tracking)

## Scaling Considerations

### When to Scale

Monitor these metrics:
- Response time > 1 second
- CPU usage > 80%
- Memory usage > 80%
- Subscribers > 10,000

### Scaling Options

1. **Vertical Scaling**
   - Upgrade server plan
   - More RAM/CPU

2. **Horizontal Scaling**
   - Add load balancer
   - Multiple server instances
   - Shared Redis for subscribers

3. **Database Addition**
   ```bash
   # Add PostgreSQL for persistence
   npm install pg
   ```

## Backup Strategy

### Code
- [x] Git repository (already done)
- [ ] Regular commits
- [ ] Tagged releases

### Data
- [ ] Database backups (if added)
- [ ] Environment variable backup
- [ ] Subscriber data export

## Cost Estimate

### Free Tier (Recommended for Start)
- **Railway/Render:** Free tier (500 hours/month)
- **Vercel/Netlify:** Free tier (unlimited)
- **Total:** $0/month

### Paid Tier (For Scale)
- **Railway Hobby:** $5/month
- **Vercel Pro:** $20/month
- **Domain:** $10-15/year
- **Total:** ~$25-30/month

## Deployment Checklist

Before going live:

- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] Environment variables set
- [ ] Telegram bot responding
- [ ] API endpoints working
- [ ] Health checks passing
- [ ] SSL certificate active
- [ ] Domain configured (optional)
- [ ] Monitoring set up
- [ ] Logs accessible
- [ ] Documentation updated
- [ ] README has live URLs

## Support Channels

After deployment:
- **Issues:** GitHub Issues
- **Telegram:** @yurishift_bot
- **Monitoring:** UptimeRobot alerts
- **Logs:** Platform dashboard

---

**Deployment Status:** Ready to Deploy ✅
**Recommended Stack:** Railway (Backend) + Vercel (Frontend)
**Expected Setup Time:** 15-30 minutes
