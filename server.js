import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import userRoutes from "./routes/userRoutes.js";
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

dotenv.config()
const app = express()

app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
}));

app.get('/api/data', (req, res) => {
    res.json({ message: 'CORS aktif!' });
});

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => res.send('Scentsy is running~ ✨'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))