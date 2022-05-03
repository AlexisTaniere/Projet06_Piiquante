require('dotenv').config();

const express = require('express');

const app = express();

const cors = require('cors')


const mongoose = require('mongoose');

const User = require('./Models/users');

const userRoutes = require('./routes/user');

const sauceRoutes = require('./routes/sauce');

const path = require('path');

const rateLimit = require('express-rate-limit');

const helmet = require("helmet");

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests
app.use(limiter);






mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5akoi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


 
  app.use(helmet({crossOriginResourcePolicy:false}));
  // app.use(cors());

app.use(express.json())

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);
app.use('/images', express.static(path.join(__dirname,'images')));


module.exports = app;