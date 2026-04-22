FROM node:20 AS build
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build

# Servidor NGINX para servir el frontend
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
