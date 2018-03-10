FROM node:8-slim

# Install global typeorm for db migrations
RUN npm install -g typeorm 
RUN npm install -g pm2

# Create app directory
RUN mkdir -p /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/package.json
RUN cd /usr/src/app && npm install

# Bundle app source
COPY . /usr/src/app
WORKDIR /usr/src/app

ADD docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000 3080

ENTRYPOINT ["/docker-entrypoint.sh"]

