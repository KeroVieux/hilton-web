FROM nginx:latest
LABEL authors="Dino"

COPY dist/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
