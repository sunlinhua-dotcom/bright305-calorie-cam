# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port 8080 (Zeabur requirement)
EXPOSE 8080

# Start the application on port 8080
CMD ["npm", "start", "--", "-p", "8080"]
