# --- Stage 1: Build Stage ---
FROM node:20-alpine as builder

WORKDIR /app

# Copy package.json and package-lock.json first to cache dependencies
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm install

# Copy the rest of the frontend files
COPY . .

# Build the React app
RUN npm run build

# --- Stage 2: Production Serving Stage ---
# Use a lightweight Nginx image to serve the static build files
FROM nginx:alpine

# Copy the built files from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom Nginx config to handle routing (to prevent 404 on hard refresh)
# You may need to create an nginx.conf file to handle React routing/rewrites
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx listens on port 80 by default
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]