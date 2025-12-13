FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --quiet
COPY . .
RUN chmod -R +x node_modules/.bin
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV PORT=5173
COPY --from=build /app/dist ./dist
RUN npm install -g serve@14.2.1
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
