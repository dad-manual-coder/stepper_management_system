import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import recordRoutes from './routes/recordRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1); 
    }
};

connectDB();

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 

app.use('/api/records', recordRoutes);

app.get('/', (req, res) => {
    res.send('BMS API is running...');
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
