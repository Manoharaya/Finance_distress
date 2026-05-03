# --- Build Stage for Frontend ---
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# --- Build Stage for Backend ---
FROM python:3.11-slim
WORKDIR /app

# Install Node.js and Supervisor
RUN apt-get update && apt-get install -y \
    curl \
    supervisor \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Setup Backend
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt
COPY backend/ ./backend/

# Setup Frontend
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-builder /app/frontend/package.json ./frontend/package.json

# Copy Configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY .env .env

# Expose ports
EXPOSE 8000 3000

# Run migrations and start everything via supervisor
CMD sh -c "cd /app/backend && alembic upgrade head && /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf"
