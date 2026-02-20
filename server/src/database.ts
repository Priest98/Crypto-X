import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';

const dbPath = process.env.VERCEL ? ':memory:' : './payments.db';

const db: Database = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      txid TEXT UNIQUE NOT NULL,
      amount INTEGER NOT NULL,
      wallet_address TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      confirmations INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      evm_tx_hash TEXT,
      evm_status TEXT DEFAULT 'pending'
    )`, (err) => {
            if (err) {
                console.error('Error creating table', err.message);
            }
        });
    }
});

export default db;
