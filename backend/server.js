const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const authController = require('./controllers/authController');
const campaignAssetsRoutes = require('./routes/campaignAssetRoutes');
const leadsRoutes = require('./routes/leadRoutes');

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

connectDB();

const skipAuthVerification = (req, res, next) => {
  const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password'];
  if (
    publicRoutes.includes(req.path) ||
    req.path.startsWith('/api/auth/reset-password/') ||
    req.path.startsWith('/api/leads/download/')
  ) return next();
  return authController.verifyToken(req, res, next);
};

app.use(skipAuthVerification);
app.use('/uploads', express.static('uploads'));
app.use('/api/user', userRoutes);
app.use('/api/campaign', campaignRoutes);
app.use('/api/campaigns', campaignAssetsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
