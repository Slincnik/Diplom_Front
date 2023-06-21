FROM node:lts-alpine

# делаем каталог 'app' текущим рабочим каталогом
RUN mkdir /app
WORKDIR /app

# копируем package.json
COPY package.json .

# устанавливаем зависимости проекта
RUN npm install

# копируем файлы и каталоги проекта в текущий рабочий каталог (т.е. в каталог 'app')

COPY . .

# Nginx configuration
RUN apk add --no-cache nginx
ADD docker/nginx.conf /etc/nginx/nginx.conf
ADD docker/cloudflare /etc/nginx/cloudflare
COPY docker/conf.d/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]