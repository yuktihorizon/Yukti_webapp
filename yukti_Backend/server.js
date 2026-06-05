const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();
console.log('DB connected. Moving on to create Express app...');
const app = express();

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(cors({
    credentials : true,
    origin : ['process.env.FRONTEND_URL']
}))
app.use(express.json());

const setupRoutes = require('./routes');

setupRoutes(app);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
