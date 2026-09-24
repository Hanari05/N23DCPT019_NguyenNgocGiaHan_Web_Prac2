const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const orderRoutes = require('./routes/orderRoutes');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('API Quan ly Don hang dang hoat dong...');
});

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('Thieu MONGO_URI. Hay tao file .env tu .env.example.');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected!');

    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server is running on port ${port}`));
  } catch (error) {
    console.error('Connection error:', error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) startServer();

module.exports = app;
