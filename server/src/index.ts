import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRoutes from './routes/payments';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
    origin: '*', // Allow all origins for dev simplicity
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
    res.send('VELENCIA Backend Running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
