FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# where available (npm@5+)
COPY . .

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

EXPOSE 1337
CMD [ "node", "./bin/www" ]