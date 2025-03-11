const { Client } = require('@elastic/elasticsearch');
const os = require('os');

class Monitoring {
    constructor() {
        this.client = new Client({ node: process.env.ELASTIC_URL || 'http://localhost:9200' });
        this.hostname = os.hostname();
    }

    /**
     * Log metrics to Elasticsearch
     * @param {string} metricType - Type of metric (e.g., 'log_fetch', 'api_call')
     * @param {Object} data - Metric data
     */
    async logMetric(metricType, data) {
        try {
            await this.client.index({
                index: 'app-metrics',
                document: {
                    timestamp: new Date(),
                    hostname: this.hostname,
                    type: metricType,
                    ...data
                }
            });
        } catch (error) {
            console.error('Failed to log metric:', error);
        }
    }

    /**
     * Monitor API endpoints
     * @param {FastifyInstance} fastify - Fastify instance
     */
    setupAPIMonitoring(fastify) {
        fastify.addHook('onResponse', async (request, reply) => {
            await this.logMetric('api_request', {
                method: request.method,
                url: request.url,
                statusCode: reply.statusCode,
                responseTime: reply.getResponseTime()
            });
        });
    }

    /**
     * Monitor log fetching operations
     * @param {Object} source - Source configuration
     * @param {number} logsCount - Number of logs fetched
     * @param {Error} error - Error if any
     */
    async logFetchOperation(source, logsCount, error = null) {
        await this.logMetric('log_fetch', {
            sourceId: source._id,
            sourceType: source.sourceType,
            logsCount,
            status: error ? 'error' : 'success',
            error: error ? error.message : null
        });
    }
}

module.exports = new Monitoring(); 