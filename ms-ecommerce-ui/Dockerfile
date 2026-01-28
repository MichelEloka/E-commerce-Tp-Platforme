FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --quiet --include=dev
COPY . .
RUN chmod -R +x node_modules/.bin

# Déclarer les arguments pour qu'ils soient disponibles comme variables d'environnement pendant le build
ARG VITE_MEMBERSHIP_API
ARG VITE_PRODUCT_API
ARG VITE_ORDER_API

RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV PORT=5173
COPY --from=build /app/dist ./dist
RUN npm install -g serve@14.2.1
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
