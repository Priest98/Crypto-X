import express, { Request, Response } from 'express';
import db from '../database';

// Simple Backend RPC Client for Midl/Bitcoin Node
const MIDL_RPC_URL = process.env.MIDL_RPC_URL || 'https://rpc.staging.midl.xyz'; // Regtest RPC

const getTransactionStatus = async (txid: string) => {
    try {
        // Assuming Midl Regtest uses a standard Bitcoin RPC or Esplora-like API
        // For Regtest explorer: https://mempool.staging.midl.xyz/api/tx/:txid
        const response = await fetch(`${process.env.MEMPOOL_API || 'https://mempool.staging.midl.xyz/api'}/tx/${txid}`);

        if (!response.ok) {
            if (response.status === 404) return { confirmed: false, confirmations: 0, found: false };
            throw new Error(`RPC Error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            confirmed: data.status.confirmed,
            confirmations: data.status.block_height ? (await getTipHeight() - data.status.block_height + 1) : 0,
            found: true
        };
    } catch (error) {
        console.error('RPC Fetch Error:', error);
        return { confirmed: false, confirmations: 0, found: false };
    }
};

const getTipHeight = async (): Promise<number> => {
    try {
        const response = await fetch(`${process.env.MEMPOOL_API || 'https://mempool.staging.midl.xyz/api'}/blocks/tip/height`);
        const height = await response.text();
        return parseInt(height, 10);
    } catch (e) {
        return 0;
    }
};

const router = express.Router();

// Store Payment Intent (On-Chain Proof Layer)
router.post('/store', async (req: Request, res: Response) => {
    console.log('[API] /store called with:', req.body);
    const { txid, orderId, amount, walletAddress, network } = req.body;

    if (!txid || !orderId || !amount || !walletAddress) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    try {
        // Use REPLACE to avoid duplicates on retry
        const stmt = db.prepare('INSERT OR REPLACE INTO payments (order_id, txid, amount, wallet_address, status, confirmations) VALUES (?, ?, ?, ?, ?, ?)');
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
                const txStatus = await getTransactionStatus(txid);
                console.log('Midl RPC Status:', txStatus);

                if (!txStatus.found) {
                    res.json({ status: row.status, confirmations: row.confirmations });
                    return;
                }

                // Update DB if confirmed or status changed
                if (txStatus.confirmed && row.status !== 'confirmed') {
                    db.run('UPDATE payments SET status = ?, confirmations = ? WHERE txid = ?',
                        ['confirmed', txStatus.confirmations, txid]);

                    res.json({ status: 'confirmed', confirmations: txStatus.confirmations });
                } else if (txStatus.confirmations > row.confirmations) {
                    db.run('UPDATE payments SET confirmations = ? WHERE txid = ?',
                        [txStatus.confirmations, txid]);
                    res.json({ status: row.status, confirmations: txStatus.confirmations });
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
