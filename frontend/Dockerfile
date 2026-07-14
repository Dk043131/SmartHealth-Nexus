# Stage 1: Compile React assets
FROM node:18-alpine AS build

WORKDIR /app

# Copy package lock and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve static files using Nginx
FROM nginx:stable-alpine

# Copy compiled assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose Nginx server port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
