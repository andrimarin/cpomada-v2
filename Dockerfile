FROM node:18-alpine

WORKDIR /app

# Configurar npm para evitar timeouts largos en redes lentas
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-factor 2 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm config set registry https://registry.npmjs.org/

COPY package*.json ./

# Instalar dependencias (capa cacheable si package.json no cambia)
RUN npm install --production --no-audit --no-fund --prefer-offline

# Copiar código backend
COPY backend ./backend

# Copiar frontend
COPY frontend ./frontend

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "backend/server.js"]