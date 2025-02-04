FROM node:18-alpine AS builder
WORKDIR /app

# Package-Dateien kopieren
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# Restlichen Code kopieren und Frontend bauen
COPY . .
RUN npm run build

# Production-Stage
FROM node:18-alpine
WORKDIR /app

# Kopiere nur die benötigten Dateien
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]