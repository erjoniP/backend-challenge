FROM node:20-alpine

WORKDIR /app/backend

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Expose ports
EXPOSE 3000

CMD ["npm", "start"] 