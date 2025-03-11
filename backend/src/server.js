const fastify = require('fastify')({logger: true});
const mongoose = require('mongoose');
require('dotenv').config();
const monitoring = require('./utils/monitoring');

/**
 * Main application startup function
 * Handles the initialization of MongoDB connection and Fastify server
 * Uses async/await pattern for better error handling and readability
 */
const start = async () => {
    try {
        // Establish MongoDB connection before starting the server
        // This ensures database is ready to handle requests
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true, 
            useUnifiedTopology: true
        });
        fastify.log.info('MongoDB connected');

        // Initialize the Fastify server with configured host and port
        // Port defaults to 3000 if not specified in environment variables
        await fastify.listen({ 
            port: process.env.PORT || 3000,
            host: '0.0.0.0'  // Listen on all network interfaces
        });
        fastify.log.info(`Server listening on ${fastify.server.address().port}`);

        // Setup API monitoring
        monitoring.setupAPIMonitoring(fastify);
    } catch (err) {
        fastify.log.error(err)
        process.exit(1);  // Exit on critical errors
    }
};

// Register routes with API prefix
// All routes will be prefixed with /api
fastify.register(require('./routes/sources'), { prefix: '/api'});

// Start the application
start();