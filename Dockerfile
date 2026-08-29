FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci
COPY client ./client
RUN npm run build -w client

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci --omit=dev && npm cache clean --force
COPY server ./server
COPY --from=builder /app/client/dist ./client/dist
RUN chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node", "server/src/index.js"]

