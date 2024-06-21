FROM node:alpine AS chatbot

RUN apk update && apk upgrade
ADD /chatbot/ /srv/app/

WORKDIR /srv/app/
RUN npm install http express natural node-fetch --save

EXPOSE 3000/tcp

ENTRYPOINT ["node", "--trace-warnings", "app.js"]