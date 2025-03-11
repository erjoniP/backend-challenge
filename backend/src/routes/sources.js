const Source = require('../models/Source');
const { encrypt } = require('../utils/encryption');

/**
 * API Routes for managing log sources
 * Provides endpoints for CRUD operations on log sources
 * @param {FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Route options
 */
async function routes(fastify, options) {
  /**
   * Add new log source
   * POST /api/add-source
   * Creates and configures a new log source with encrypted credentials
   */
  fastify.post('/add-source', async (request, reply) => {
    try {
      const { sourceType, credentials, logFetchInterval, callbackUrl } = request.body;
      
      // Validate source type
      if (sourceType !== 'google_workspace') {
        return reply.code(400).send({ error: 'Only google_workspace source type is supported.' });
      }

      // TODO: Add validation for Google Admin SDK credentials

      // Encrypt sensitive credentials before storage
      credentials.privateKey = encrypt(credentials.privateKey);

      const source = new Source({ sourceType, credentials, logFetchInterval, callbackUrl });
      await source.save();

      // Log successful source creation
      fastify.log.info(`Scheduled log fetch job for source ${source._id}`);
      
      reply.code(201).send(source);
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  /**
   * List all sources
   * GET /api/sources
   * Retrieves all configured log sources
   */
  fastify.get('/sources', async (request, reply) => {
    try {
      const sources = await Source.find();
      reply.send(sources);
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  /**
   * Remove source
   * DELETE /api/remove-source/:id
   * Deletes a log source and its associated jobs
   */
  fastify.delete('/remove-source/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const result = await Source.findByIdAndDelete(id);
      if (!result) {
        return reply.code(404).send({ error: 'Source not found' });
      }
      // TODO: Implement cleanup of associated queue jobs
      reply.send({ message: 'Source removed successfully' });
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
}

module.exports = routes;
