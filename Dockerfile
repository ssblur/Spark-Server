FROM node:latest
WORKDIR /app
COPY . .
SHELL ["/bin/bash", "-c"]

RUN apt update
RUN apt -y install libnss3-tools


RUN git clone https://github.com/Homebrew/brew ~/.linuxbrew/Homebrew
RUN mkdir ~/.linuxbrew/bin

RUN apt -y install locales && localedef -i en_US -f UTF-8 en_US.UTF-8

RUN ln -s ~/.linuxbrew/Homebrew/bin/brew ~/.linuxbrew/bin
RUN eval $(~/.linuxbrew/bin/brew shellenv)

RUN hash -r

# RUN export PATH=~/.linuxbrew/bin:$PATH
ENV PATH "$PATH:~/.linuxbrew/bin"
RUN source ~/.bashrc

RUN brew install mkcert

# RUN cd mkcert/

RUN mkcert sparkserver.local

RUN mv sparkserver.local-key.pem privkey.pem
RUN mv sparkserver.local.pem certificate.pem

RUN cd ..

ENV PATH "$PATH:~/.npm-global/bin"
RUN npm install --silent

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["node", "index.js"]

