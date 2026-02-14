# Use an official Nginx image as a base image
FROM nginx:alpine

# Copy the static files to the Nginx HTML directory
COPY . /usr/share/nginx/html

# Expose the port the app runs on
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]