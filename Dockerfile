# The base image is Node, which is using a lightweight version of Linux
FROM node:latest
WORKDIR /app

# Copies the contents of this directory into the Docker container
COPY . .

# The shell is changed to bash so I could install the following
SHELL ["/bin/bash", "-c"]

# Installing Brew for Linux
RUN apt update
RUN apt -y install libnss3-tools


RUN git clone https://github.com/Homebrew/brew ~/.linuxbrew/Homebrew
RUN mkdir ~/.linuxbrew/bin
RUN apt -y install locales && localedef -i en_US -f UTF-8 en_US.UTF-8
RUN ln -s ~/.linuxbrew/Homebrew/bin/brew ~/.linuxbrew/bin
RUN eval $(~/.linuxbrew/bin/brew shellenv)

RUN hash -r
ENV PATH "$PATH:~/.linuxbrew/bin"
RUN source ~/.bashrc

# End of Brew install

# Installs mkcert
RUN brew install mkcert

# Creates the certificate
RUN mkcert sparkserver.local

# Renames the certificates to match what the server expects
RUN mv sparkserver.local-key.pem privkey.pem
RUN mv sparkserver.local.pem certificate.pem

# If there is issues with the container, I would suspect this line. 
# Comment it out if there's an issue
RUN cd ..

ENV PATH "$PATH:~/.npm-global/bin"
RUN npm install --silent

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["node", "index.js"]

