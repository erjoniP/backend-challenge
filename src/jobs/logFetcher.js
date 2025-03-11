const { Queue, Worker, QueueScheduler } = require('bullmq');
const IORedis = require('ioredis');

// Initialize Redis connection for job queue
const redisConnection = new IORedis(process.env.REDIS_URL);

/**
 * BullMQ Queue setup for log fetching jobs
 * Handles scheduling and processing of periodic log fetch operations
 */
const logQueue = new Queue('log-fetch', { connection: redisConnection });
new QueueScheduler('log-fetch', { connection: redisConnection });

// Function to add a job for a given source
async function scheduleLogFetch(source) {
  await logQueue.add('fetch-logs', { sourceId: source._id }, {
    repeat: { every: source.logFetchInterval * 1000 },
    attempts: 5, // number of retry attempts
    backoff: { type: 'exponential', delay: 1000 }
  });
}

// Worker to process the job: fetch logs and forward them
const worker = new Worker('log-fetch', async job => {
  const { sourceId } = job.data;
  // Fetch the source from the DB
  const Source = require('../models/Source');
  const source = await Source.findById(sourceId);
  if (!source) throw new Error('Source not found');

    // Decrypt credentials for API access
    const { decrypt } = require('../utils/encryption');
    source.credentials.privateKey = decrypt(source.credentials.privateKey);

    // Fetch logs from Google Workspace
    const logs = await fetchGoogleWorkspaceLogs(source.credentials);

  // Forward logs to callback URL
  const axios = require('axios');
  try {
    await axios.post(source.callbackUrl, logs);
  } catch (err) {
    // Retry logic can be implemented here or let BullMQ handle retries
    throw new Error('Callback failed, will be retried');
  }
}, { connection: redisConnection });

// Placeholder function for fetching logs from Google Workspace
async function fetchGoogleWorkspaceLogs(credentials) {
    const auth = new google.auth.JWT({
        email: credentials.clientEmail,
        key: credentials.privateKey,
        scopes: credentials.scopes,
    });
    
    // TODO: Replace with actual API call
    return [{
        id: 'dummy-log-id',
        timestamp: new Date().toISOString(),
        actor: { 
            email: 'admin@example.com', 
            ipAddress: '192.168.1.1' 
        },
        eventType: 'LOGIN',
        details: { status: 'SUCCESS' }
    }];
}

module.exports = { scheduleLogFetch, logQueue };
