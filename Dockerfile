FROM node:latest
WORKDIR /app
COPY . .

ENV PATH "$PATH:~/.npm-global/bin"

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["node", "index.js"]

