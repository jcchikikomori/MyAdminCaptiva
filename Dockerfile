# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Install curl
RUN apk --no-cache add curl

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json ./
# If you have a package-lock.json, uncomment the next line
COPY package-lock.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application for production
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# The command to start the app
CMD ["npm", "start"]
