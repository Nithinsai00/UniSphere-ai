# UniSphere AI — Deployment Guide & Live Links

## 1. Active Live Link (Instant Public Access)

* **Public Live Link**: [https://electronics-pounds-concerned-hoping.trycloudflare.com](https://electronics-pounds-concerned-hoping.trycloudflare.com)
* **API Documentation**: [https://electronics-pounds-concerned-hoping.trycloudflare.com/docs](https://electronics-pounds-concerned-hoping.trycloudflare.com/docs)
* **Localhost URL**: [http://localhost:8000](http://localhost:8000)

### Verified Credentials:
* **Admin**: `admin` / `Hope@50`
* **Faculty**: `FAC001` / `Faculty@2026`
* **Student**: `STU1001` / `Student@2026`

---

## 2. Terminal-Independent Windows Daemon (Runs With No Terminal Open)

To ensure the local server and public tunnel stay online even after you terminate your terminal, close PowerShell, or exit VS Code:

1. Double-click **`start_silent.bat`** in this project folder (or run `.\start_silent.bat`).
2. It launches both the Python FastAPI server and Cloudflare tunnel as headless, detached Windows background processes.
3. You can now close all terminals and command prompts—the application and public link will continue running in the background.
4. To stop the background processes at any time, run **`stop_services.bat`**.

---

## 3. Permanent 24/7 Cloud Hosting (Works Even When PC is Powered Off)

The repository has been configured with production cloud manifests (`render.yaml`, `Procfile`, `Dockerfile`, `requirements.txt`).

### Option A: Render (Free 24/7 Web Service — Recommended)
1. Push this repository to your GitHub account:
   ```bash
   git remote add origin https://github.com/Nithinsai00/unisphere-ai.git
   git push -u origin master
   ```
2. Log in to [Render.com](https://render.com) (free).
3. Click **New +** -> **Web Service** -> select your `unisphere-ai` repository.
4. Render automatically detects `render.yaml` or you can select:
   * **Runtime**: Python
   * **Build Command**: `pip install -r requirements.txt && cd frontend && npm install && npm run build && cd ..`
   * **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
5. Click **Deploy Web Service**. You will receive a permanent URL like `https://unisphere-ai.onrender.com`.

### Option B: Railway / Koyeb
1. Connect your GitHub repository to [Railway.app](https://railway.app) or [Koyeb.com](https://koyeb.com).
2. The included `Dockerfile` will automatically build the React frontend and run the FastAPI backend on port 8000.
