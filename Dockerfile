FROM nginx:alpine
COPY nginx.conf /etc/nginx/
COPY default.conf /etc/nginx/conf.d/
COPY site /usr/share/nginx/html
