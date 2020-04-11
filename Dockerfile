FROM node:latest
WORKDIR /app
COPY . .

RUN apt update
RUN apt -y install libnss3-tools

RUN git clone https://github.com/Homebrew/brew ~/.linuxbrew/Homebrew
RUN mkdir ~/.linuxbrew/bin
RUN ln -s ~/.linuxbrew/Homebrew/bin/brew ~/.linuxbrew/bin
RUN eval $(~/.linuxbrew/bin/brew shellenv)

RUN cd mkcert/

RUN mkcert sparkserver.local

RUN mv sparkserver.local-key.pem ../privkey.pem
RUN mv sparkserver.local.pem ../certificate.pem

RUN cd ..

ENV PATH "$PATH:~/.npm-global/bin"
RUN npm install --silent

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["node", "index.js"]

