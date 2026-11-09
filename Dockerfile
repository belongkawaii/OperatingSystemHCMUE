# ================================
#          Build Stage
# ================================
FROM node:24.12.0-alpine AS builder

WORKDIR /app/

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

RUN npm run build

# ================================
#          Run Stage
# ================================
FROM nginxinc/nginx-unprivileged:alpine3.22 AS runner

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/ /usr/share/nginx/html/

EXPOSE 80

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]