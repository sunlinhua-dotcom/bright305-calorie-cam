---
description: Deploy the CICO Food Analysis App
---

# Deploying to Vercel (Recommended)

The easiest way to deploy your Next.js application is to use [Vercel](https://vercel.com/new).

## Method 1: Vercel CLI (Fastest)

1.  **Install Vercel CLI** (if you haven't already):
    ```bash
    npm i -g vercel
    ```

2.  **Login to Vercel**:
    ```bash
    vercel login
    ```

3.  **Deploy**:
    Run the following command in your project root:
    ```bash
    vercel
    ```
    - Follow the prompts (Set up and deploy? [Y/n] -> Y)
    - Link to existing project? [N]
    - Project Name? (Press Enter)
    - In which directory is your code located? (Press Enter)
    - **IMPORTANT**: When asked about "Environment Variables", say **YES**.
      - Add `GEMINI_API_KEY` and paste your key.
      - Add `GEMINI_BASE_URL` and paste your URL.

4.  **Production Deploy**:
    Once you are happy with the preview, deploy to production:
    ```bash
    vercel --prod
    ```

## Method 2: Git Push (Automatic)

1.  Push your code to a Git repository (GitHub/GitLab/Bitbucket).
2.  Go to [Vercel Dashboard](https://vercel.com/new).
3.  Import your repository.
4.  In the **Environment Variables** section, add:
    - `GEMINI_API_KEY`: Your API Key
    - `GEMINI_BASE_URL`: Your Base URL
5.  Click **Deploy**.

---

# Manual Deployment (VPS / Docker)

If you want to host it on your own server:

1.  **Build the application**:
    ```bash
    npm run build
    ```

2.  **Start the server**:
    ```bash
    npm start
    ```
    *Note: The app will run on port 3000 by default.*

3.  **Process Management**:
    Use `pm2` to keep it running in the background:
    ```bash
    npm i -g pm2
    pm2 start npm --name "cico-app" -- start
    ```

---

# Deploying to Zeabur (Alternative)

If you prefer using [Zeabur](https://zeabur.com/), follow these steps (Optimized for port 8080):

1.  **Preparation**:
    - Ensure the `Dockerfile` in the root directory is present (I have already created this for you).
    - Push your latest code to GitHub.

2.  **Deploy**:
    - Go to Zeabur Dashboard.
    - Create a new project.
    - Click "Deploy New Service" -> "GitHub".
    - Select your repository (`bright305-calorie-cam`).

3.  **Configuration**:
    - Zeabur should automatically detect the `Dockerfile`.
    - Go to **Service** -> **Settings** -> **Environment Variables**.
    - Add your Environment Variables:
        - `GEMINI_API_KEY`
        - `GEMINI_BASE_URL`

4.  **Networking**:
    - Go to **Networking** tab.
    - Click "Generate Domain" or bind your own.
    - Zeabur will automatically route traffic to port 8080.

