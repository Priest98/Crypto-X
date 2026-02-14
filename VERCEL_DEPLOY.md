# Deploying VELENCIA to Vercel

Follow these steps to deploy your application to Vercel.

## Prerequisites
- A Vercel account ([vercel.com](https://vercel.com)).
- The project pushed to GitHub (already done).

## Steps

1.  **Log in to Vercel Dashboard.**
2.  Click **"Add New..."** -> **"Project"**.
3.  **Import Git Repository:**
    - Correctly identify the `Crypto-X` repository.
    - Click **Import**.

4.  **Configure Project:**
    - **Framework Preset:** Vercel should automatically detect **Vite**. If not, select **Vite**.
    - **Root Directory:** `./` (default).
    - **Build Command:** `vite build` (default).
    - **Output Directory:** `dist` (default).
    - **Install Command:** `npm install` (default).

5.  **Environment Variables:**
    - Expand "Environment Variables".
    - Add the following (if you have them):
        - `VITE_MIDL_API_KEY`: Your Midl API Key.
        - `VITE_MIDL_RPC_URL`: Your Midl RPC URL.
        - `VERCEL`: `true` (Automatically set by Vercel, but good to know).

6.  **Deploy:**
    - Click **Deploy**.

## Troubleshooting
-   **Database:** The backend uses `sqlite3` with an in-memory database (`:memory:`) on Vercel. This means **data will reset** on every deployment or server restart.
    -   *If the build fails due to `sqlite3`*: This is a common issue with native modules on serverless. You might need to use `@vercel/postgres` or mock the database layer entirely.
-   **API 404s:** Ensure the `vercel.json` rewrites are working. If `/api/payments/verify` returns 404, verify that `api/index.ts` is correctly resolving the Express app.

## Post-Deployment
-   Your app will be available at `https://your-project-name.vercel.app`.
-   Test the **Wallet Connection** and **Checkout** flow.
