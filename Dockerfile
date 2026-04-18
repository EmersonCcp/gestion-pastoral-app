# =========================
# Etapa 1: Build
# =========================
FROM node:24 AS build

WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del proyecto
COPY . .

# Exponer puerto de Angular
EXPOSE 4200

# Levantar Angular en modo desarrollo
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "4200"]