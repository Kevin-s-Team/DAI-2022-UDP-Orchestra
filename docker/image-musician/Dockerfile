FROM node:18

WORKDIR /opt/app
COPY src /opt/app/

RUN npm install

ENTRYPOINT ["node", "/opt/app/index.js"]