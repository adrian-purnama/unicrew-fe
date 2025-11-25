FROM node:18

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Build Vite project
COPY . .
RUN npm run build

# Install static-server (serve)
RUN npm install -g serve

# Expose your chosen port
EXPOSE 3501

# Start static server on port 3501
CMD ["serve", "-s", "dist", "-l", "3501"]
