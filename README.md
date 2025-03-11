# Google Workspace Log Collection Service

## Overview
This service integrates with Google Workspace Admin SDK to collect and forward logs. It features automatic log collection, secure credential storage, and robust error handling with monitoring capabilities.

## Tech Stack
- Node.js
- Fastify
- MongoDB
- Redis
- Elasticsearch & Kibana
- Docker & Docker Compose

## Prerequisites
- Docker and Docker Compose
- Node.js 20 or later
- Google Workspace Admin Account
- MongoDB
- Redis

## Quick Start

1. Clone the repository and navigate to the backend directory:
```bash
git clone <repository-url>
cd <repository-name>/backend
```

2. Create a .env file:
```bash
cp .env.example .env
```

Configure the following variables:
```env
MONGO_URI=mongodb://mongodb:27017/backendchallenge
REDIS_URL=redis://redis:6379
ENCRYPTION_SECRET=your-secure-encryption-key
ELASTIC_URL=http://elasticsearch:9200
PORT=3000
```

3. Start the application using Docker:
```bash
docker compose up --build
```

The application will be available at:
- API: http://localhost:3000
- Kibana: http://localhost:5601
- Elasticsearch: http://localhost:9200

## API Documentation

### Add New Source
```bash
POST /api/add-source
```
Request body:
```json
{
  "sourceType": "google_workspace",
  "credentials": {
    "clientEmail": "service-account@your-domain.com",
    "privateKey": "-----BEGIN PRIVATE KEY-----\n...",
    "scopes": ["admin.googleapis.com"]
  },
  "logFetchInterval": 300,
  "callbackUrl": "https://your-webhook.com/logs"
}
```

### List Sources
```bash
GET /api/sources
```

### Remove Source
```bash
DELETE /api/remove-source/:id
```

## Monitoring

### Metrics Available in Kibana
- API Response Times
- Log Collection Success Rate
- Error Rates
- Number of Logs Collected
- Source Health Status

### Setting up Kibana Dashboards
1. Access Kibana at http://localhost:5601
2. Go to Stack Management > Index Patterns
3. Create a new index pattern for "app-metrics*"
4. Navigate to Dashboards to create visualizations

## Error Handling
The service implements several retry mechanisms:
- API Rate Limiting: Exponential backoff
- Failed Webhook Deliveries: 5 retry attempts
- Connection Issues: Automatic reconnection
- Credential Expiration: Automatic notification

## Development

### Local Setup
```bash
# Install dependencies
npm install

# Start MongoDB
docker compose up mongodb

# Start Redis
docker compose up redis

# Start the application
npm start
```

### Running Tests
```bash
# Generate test metrics
node test/generate-metrics.js
```

## Deployment

### Docker Deployment
```bash
docker compose up --build
```

### Kubernetes Deployment
```bash
# Apply Kubernetes configurations
kubectl apply -f k8s/deployment.yaml
```

### Cloud Deployment (AWS)
The project includes Terraform configurations for AWS deployment:
```bash
cd terraform
terraform init
terraform apply
```

## Architecture
- **API Layer**: Fastify for handling HTTP requests
- **Queue Layer**: BullMQ/Redis for job scheduling
- **Storage Layer**: MongoDB for source configuration
- **Monitoring Layer**: Elasticsearch/Kibana for metrics
- **Security Layer**: Encryption for sensitive data

# Backend Challenge: Google Workspace Event Integration

## Introduction
Welcome to the **Cybee.ai Backend Challenge**!  

This challenge will test your ability to **integrate with a cloud event source**, specifically **Google Workspace Admin SDK logs**, and build a system that:
1. **Accepts a new source** (`POST /add-source`) with authentication credentials.
2. **Periodically fetches logs** from Google Workspace.
3. **Processes and forwards logs** to a specified callback URL.
4. **Handles edge cases** like API rate limits, failures, and credential expiration.

If you complete the challenge successfully, you'll get a chance to talk with our team at Cybee.ai!

---

## Tech Stack Requirements
Your solution must be built using:

- Node.js
- Fastify (for API development)
- MongoDB (for storing sources and logs)
- Redis (for caching and job scheduling)
- Elasticsearch (for log indexing) (optional but a plus)
- Google Workspace Admin SDK (for fetching event logs)

## Requirements

### 1. Build a Secure REST API
Develop a **Fastify-based API** that allows users to connect a cloud event source and receive logs.

#### Endpoints
- `POST /add-source`
  - Accepts **Google Workspace** as a source type.
  - Stores API credentials securely.
  - Validates credentials before storing.
  
- `DELETE /remove-source/:id`
  - Removes an existing event source.

- `GET /sources`
  - Returns a list of active sources.

---

### 2. Source Configuration & Data Model
When a user adds a Google Workspace integration, the system should store:
```json
{
  "id": "uuid",
  "sourceType": "google_workspace",
  "credentials": {
    "clientEmail": "string",
    "privateKey": "string",
    "scopes": ["admin.googleapis.com"]
  },
  "logFetchInterval": 300,
  "callbackUrl": "https://example.com/webhook"
}
```
**Notes:**
- Credentials should be **stored securely** (e.g., encrypted in MongoDB).
- `logFetchInterval` defines how often logs should be fetched (in seconds).
- `callbackUrl` is where processed logs should be sent.

---

### 3. Fetch & Forward Logs Automatically
- Once a source is added, the system should:
  - **Schedule a job** to fetch logs at `logFetchInterval` (e.g., using a queue like BullMQ).
  - Call **Google Workspace Admin SDK** (`Reports API`) to fetch **audit logs**.
  - **Forward logs** to the `callbackUrl` of the source.
  - **Retry failed requests** and handle rate limits.

**Example Log from Google Workspace:**
```json
{
  "id": "log-id",
  "timestamp": "2024-03-10T12:00:00Z",
  "actor": {
    "email": "admin@example.com",
    "ipAddress": "192.168.1.1"
  },
  "eventType": "LOGIN",
  "details": {
    "status": "SUCCESS"
  }
}
```

---

### 4. Handle Edge Cases
Your system should properly handle:
**API rate limits** – Backoff and retry.  
**Credential expiration** – Detect and alert the user.  
**Callback failures** – Retry failed webhook deliveries.  
**Duplicate logs** – Ensure logs are not duplicated.  
**High availability** – Ensure logs keep flowing even if one instance restarts.  

---

### 5. Deployment & Bonus
- (Required) Provide a **README** with:
  - Setup instructions.
  - API documentation.
  - Explanation of how retries and scheduling work.
- (Bonus) Deploy the solution using **Docker & a cloud provider**.
- (Bonus) Implement **monitoring** (e.g., log metrics to Elasticsearch).

---

## How to Submit
1. Fork this repository and implement your solution in a `backend/` folder.
2. Add a `README.md` with setup and usage instructions.
3. Submit a pull request.

If your solution meets the challenge requirements, we'll reach out to schedule a conversation. Looking forward to seeing your work!

# Log Collection Challenge

## Structure

