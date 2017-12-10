FROM node:9.2-alpine
ENV NODE_ENV production
RUN npm install -g nodemon
WORKDIR /usr/src/app
# COPY ["package.json", "npm-shrinkwrap.json*", "./"]
# RUN npm install --production --silent && mv node_modules ../
COPY . .
RUN npm install
# EXPOSE 3000
CMD npm start

