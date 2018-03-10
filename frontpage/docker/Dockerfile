FROM node:8-slim

# Install Python and nginx.
RUN apt-get update \
  && apt-get install -y nginx git \
  && rm -rf /var/lib/apt/lists/*

# Create app directory
RUN mkdir -p /usr/src/app
RUN npm install -g @angular/cli

COPY package.json /usr/src/app/package.json
RUN cd /usr/src/app && npm install && npm install --no-optional qrious@v3.0.1 --unsafe-perm

# copy app source
COPY . /usr/src/app
WORKDIR /usr/src/app

COPY docker/nginx/default /etc/nginx/templates/default.tmpl
ADD docker/nginx/robots.txt /var/www/html

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
	&& ln -sf /dev/stderr /var/log/nginx/error.log

# update nginx default config so links work
RUN sed -i 's/try_files $uri $uri\/ =404;/try_files $uri $uri\/ \/index.html;/g' /etc/nginx/sites-available/default

EXPOSE 80 443

ADD docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]


