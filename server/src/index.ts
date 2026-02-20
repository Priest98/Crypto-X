import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRoutes from './routes/payments';

dotenv.config();

// Export app for Vercel
export const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
    origin: '*', // Allow all origins for dev simplicity
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.text()); // Support raw transaction hex/text posts

app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
    res.send('VELENCIA Backend Running');
});

// Proxy route for Xverse Ordinals check
// Xverse checks /v2/ordinal-utxo/:utxo to ensure we aren't burning ordinals.
// Our Mempool instance returns 404 Text, which breaks Xverse JSON parsing.
// We return empty JSON to signal "No ordinals here, safe to spend".
app.get('/v2/ordinal-utxo/:utxo', (req, res) => {
    console.log(`[Proxy] Mocking Ordinal Check for ${req.params.utxo}`);
    res.json({});
});

// Mock Auth Routes for Xverse Indexer compatibility
// Xverse sometimes tries to authenticate with the indexer
app.get('/v1/auth/challenge', (req, res) => {
    console.log('[Proxy] Mocking Auth Challenge');
    res.json({ nonce: "mock-nonce-" + Date.now() });
});

app.post('/v1/auth/login', (req, res) => {
    console.log('[Proxy] Mocking Auth Login');
    res.json({ token: "mock-token-" + Date.now() });
});

// Proxy all other requests to MIDL/Mempool API
// This allows Xverse to use http://localhost:3001 as the indexer and still get UTXOs/TXs
app.use(async (req, res) => {
    if (req.path.startsWith('/api/payments')) return; // handled above (express router should catch it first anyway)

    // Construct target URL
    // req.path includes the leading slash, e.g. /address/bcrt1...
    // MIDL API is at https://mempool.staging.midl.xyz/api
    // So we want: https://mempool.staging.midl.xyz/api/address/bcrt1...

    // Note: Xverse might append /api to the indexerUrl logic or might not.
    // If indexerUrl is localhost:3001, it might request localhost:3001/address...

    const MIDL_API_BASE = 'https://mempool.staging.midl.xyz/api';

    // Xverse might request /address... or /api/address...
    // MIDL_API_BASE already has /api, so we must be careful not to double it.
    let path = req.path;
    if (path.startsWith('/api')) {
        path = path.replace('/api', '');
    }

    const targetUrl = `${MIDL_API_BASE}${path}`;

    console.log(`[Proxy] Forwarding ${req.method} ${req.path} -> ${targetUrl}`);

    try {
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'Content-Type': req.headers['content-type'] || 'application/json',
            },
            body: (req.method !== 'GET' && req.method !== 'HEAD')
                ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
                : undefined
        });

        const data = await response.text();

        // Forward essential headers
        const contentType = response.headers.get('content-type');
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }

        // Forward status and body
        res.status(response.status).send(data);
    } catch (error: any) {
        console.error('[Proxy] Error:', error.message);
        res.status(500).send('Proxy Error');
    }
});

// Conditionally start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
