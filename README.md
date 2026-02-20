<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ₿ Crypto-X: Double-Chain Boutique Marketplace

A premium digital asset marketplace integrating **Bitcoin Settlement** with an **EVM Execution Layer**.

## 🚀 Key Features
- **Bitcoin Native**: Secure payments via Xverse/UniSat wallets on Regtest.
- **EVM Execution Layer**: Automated secondary transactions linking Bitcoin finality to EVM actions.
- **Real-Time Monitoring**: Dual-chain transaction tracking on the success screen.
- **Developer First**: Integrated with MIDL Infrastructure for seamless local development.

## 📖 Documentation
Detailed technical architecture, data flows, and configuration guides can be found in:
👉 **[TECHNICAL_DOCS.md](./TECHNICAL_DOCS.md)**

## 🛠️ Run Locally

**Prerequisites:** Node.js (v18+)

1. **Install Dependencies:**
   ```bash
   npm install
   cd server && npm install
   ```

2. **Configuration:**
   Set your `VITE_MIDL_EVM_RPC` and `VITE_EVM_PRIVATE_KEY` in `.env`.

3. **Start Development:**
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend
   npm run server
   ```

---
*Built with MIDL SDK & Antigravity AI*
