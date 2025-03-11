const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * MongoDB Schema for log sources
 * Defines the structure for storing log source configurations
 * Currently supports Google Workspace as the only source type
 */
const SourceSchema = new Schema({
  sourceType: { type: String, required: true, enum: ['google_workspace'] },
  credentials: {
    clientEmail: { type: String, required: true },
    privateKey: { type: String, required: true },
    scopes: { type: [String], default: ['admin.googleapis.com'] }
  },
  logFetchInterval: { type: Number, default: 300 },
  callbackUrl: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Source', SourceSchema);