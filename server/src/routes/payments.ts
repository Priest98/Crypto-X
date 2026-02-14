import express, { Request, Response } from 'express';
import axios from 'axios';
import db from '../database';

const router = express.Router();

// Verify Payment Endpoint
router.post('/verify', async (req: Request, res: Response) => {
    console.log('[API] /verify called with:', req.body);
    const { txid, orderId, address, amount, network } = req.body;

    if (!txid || !orderId || !address || !amount) {
        console.warn('[API] Missing required fields');
        res.status(400).json({ error: 'Missing required fields' });
        return; // Ensure function returns void
    }

    try {
        // 1. Check if tx already exists in DB
        db.get('SELECT * FROM payments WHERE txid = ?', [txid], async (err, row: any) => {
            if (err) {
                console.error('[DB] Error querying payment:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }

            if (row) {
                console.log('[DB] Transaction found in DB:', row);
                // Transaction already tracked, return current status
                res.json({ status: row.status, confirmations: row.confirmations });
                return;
            }

            // 2. Verify with Mempool.space API
            let baseUrl = 'https://mempool.space/testnet/api'; // Default to Testnet3
            if (network === 'testnet4') {
                baseUrl = 'https://mempool.space/testnet4/api';
            } else if (network === 'signet') {
                baseUrl = 'https://mempool.space/signet/api';
            }

            const mempoolUrl = `${baseUrl}/tx/${txid}`;
            console.log(`[API] Fetching from Mempool (${network || 'default'}):`, mempoolUrl);

            try {
                const response = await axios.get(mempoolUrl);
                const txData = response.data;
                console.log('[API] Mempool response:', txData.status);

                // 3. Validation Logic
                // Check if transaction sends to the correct store address
                const output = txData.vout.find((out: any) => out.scriptpubkey_address === address);

                if (!output) {
                    console.warn('[Validation] Address mismatch. Expected:', address);
                    res.status(400).json({ error: 'Transaction does not send to the provided address' });
                    return;
                }

                // Check amount (allow for small discrepancies if needed, but strict for now)
                if (output.value < amount) {
                    console.warn(`[Validation] Insufficient amount. Sent: ${output.value}, Expected: ${amount}`);
                    res.status(400).json({ error: `Insufficient amount. Sent: ${output.value}, Expected: ${amount}` });
                    return;
                }

                // Check confirmations
                const tipHeight = (await axios.get(`${baseUrl}/blocks/tip/height`)).data;
                const confirmations = txData.status.confirmed ? tipHeight - txData.status.block_height + 1 : 0;
                const status = confirmations > 0 ? 'confirmed' : 'pending';

                console.log(`[Validation] Confirmed: ${txData.status.confirmed}, Confirmations: ${confirmations}`);

                // 4. Store in DB
                const stmt = db.prepare('INSERT INTO payments (order_id, txid, amount, wallet_address, status, confirmations) VALUES (?, ?, ?, ?, ?, ?)');
                stmt.run(orderId, txid, amount, address, status, confirmations, function (err) {
                    if (err) {
                        console.error('[DB] Insert Error:', err.message);
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    console.log('[DB] Payment recorded with ID:', this.lastID);
                    res.json({ success: true, status, confirmations, id: this.lastID });
                });
                stmt.finalize();

            } catch (axiosError: any) {
                console.error('[API] Mempool API Error:', axiosError.message);
                // If 404, tx might not be in mempool yet
                if (axiosError.response && axiosError.response.status === 404) {
                    res.status(404).json({ error: 'Transaction not found on Testnet' });
                    return;
                }
                throw axiosError;
            }
        });

    } catch (error: any) {
        console.error('[Server] Verification Error:', error.message);
        res.status(500).json({ error: 'Failed to verify transaction with Mempool.space' });
    }
});

export default router;
