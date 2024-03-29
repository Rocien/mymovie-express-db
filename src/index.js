'use strict';

// Import necessary modules for the server
require('dotenv').config(); // Loads environment variables from .env file into process.env
const cors = require('cors'); // Importing cors settings
const express = require('express');
const { createClient } = require('redis'); // Redis client for connecting to Redis local server

const app = express(); // Creating an express app
app.use(cors()); // Using cors settings

// Initializing Redis client with connection URL from environment variables
const redisClient = createClient({
  url: process.env.REDIS_URL // Here i call the Redis URL with default port from .env
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect(); // called the variable and connect redis

// Middleware to attach the Redis client to the request object
app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

// parse JSON bodies in requests
app.use(express.json());

// Import routes from routers folder
const movieRoutes = require('./routers/movieRoutes');

app.use('/api', movieRoutes); // Use the routes with the '/api' prefix

// The server PORT set up, created a variable PORT then give it a value of the port from .env
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
