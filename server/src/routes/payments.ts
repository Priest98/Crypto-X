import express, { Request, Response } from 'express';
import db from '../database';
import { MidlClient } from '@midl/core';

const router = express.Router();

// Initialize Midl Client for Backend
const midlClient = new MidlClient({
    apiKey: process.env.MIDL_API_KEY || '',
    rpcUrl: process.env.MIDL_RPC_URL || 'https://rpc.midl.xyz',
    network: 'testnet' // Should be dynamic based on request or config
});

// Store Payment Intent (On-Chain Proof Layer)
router.post('/store', async (req: Request, res: Response) => {
    console.log('[API] /store called with:', req.body);
    const { txid, orderId, amount, walletAddress, network } = req.body;

    if (!txid || !orderId || !amount || !walletAddress) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    try {
        const stmt = db.prepare('INSERT INTO payments (order_id, txid, amount, wallet_address, status, confirmations) VALUES (?, ?, ?, ?, ?, ?)');
        stmt.run(orderId, txid, amount, walletAddress, 'pending', 0, function (this: any, err: Error | null) {
            if (err) {
                console.error('[DB] Insert Error:', err.message);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true, id: this.lastID });
        });
        stmt.finalize();
    } catch (error: any) {
        console.error('[Server] Store Error:', error.message);
        res.status(500).json({ error: 'Failed to store payment' });
    }
});

// Verify Transaction Status via Midl RPC
router.get('/verify/:txid', async (req: Request, res: Response) => {
    const { txid } = req.params;
    console.log(`[API] Verifying TX: ${txid}`);

    try {
        // 1. Check DB first
        db.get('SELECT * FROM payments WHERE txid = ?', [txid], async (err, row: any) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            if (!row) {
                res.status(404).json({ error: 'Transaction not found' });
                return;
            }

            // 2. Query Midl RPC for status
            try {
                const txStatus = await midlClient.getTransactionStatus(txid);
                console.log('Midl RPC Status:', txStatus);

                // Update DB if confirmed
                if (txStatus.confirmations > row.confirmations) {
                    const status = txStatus.confirmations > 0 ? 'confirmed' : 'pending';
                    db.run('UPDATE payments SET status = ?, confirmations = ? WHERE txid = ?',
                        [status, txStatus.confirmations, txid]);

                    res.json({ status, confirmations: txStatus.confirmations });
                } else {
                    res.json({ status: row.status, confirmations: row.confirmations });
                }
            } catch (midlError) {
                console.error('Midl RPC Error:', midlError);
                // Fallback to DB state
                res.json({ status: row.status, confirmations: row.confirmations });
            }
        });
    } catch (error: any) {
        console.error('[Server] Verify Error:', error.message);
        res.status(500).json({ error: 'Failed to verify transaction' });
    }
});

export default router;
