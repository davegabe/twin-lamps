FROM node:16
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package*.json ./
RUN npm install -g typescript
RUN npm install --production=false
# Bundle app source
COPY . .
CMD [ "npm", "start" ]