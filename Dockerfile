FROM node:8.9.4

MAINTAINER Rahul Islam <rahul@egnify.com>

ENV NODE_ENV=production
ENV PORT=3000
ENV NEW_RELIC_HOME=/usr/src/app
# Set a working directory
WORKDIR /usr/src/app

COPY ./package.json .
COPY ./yarn.lock .


# Install Node.js dependencies
RUN yarn install --production --no-progress

# Copy application files
COPY ./build .

EXPOSE 8080

CMD [ "node", "server.js" ]
