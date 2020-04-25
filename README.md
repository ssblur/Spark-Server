# Spark Backend
The backend for the Spark application. Written in node, utilizes MySQL.

# Installation
## Prerequisites
To use this software, you must install node.js and npm. For Ubuntu and Debian, this is as easy as running `sudo apt install npm nodejs`. For Windows machines, you can download node and npm [Here](https://nodejs.org/en/download/).

## Installation
To install, first you must either `git clone` this project into a folder, or download and unzip it.

After this, some additional node modules are needed to run this project. These can be installed by navigating to the project's download directory and running `npm install .`.

## Configuration
To finish setting up the project, you just need to configure it. You can create `config.json` by running the file with `node .`. 

Everything generally works out of the box, but you should set "secret" to some non-default value. I would suggest some randomly generated and reasonably long string.

# Usage
After install, you can run the server with `node .`.

## Test Mode
You can initialize the server in test mode by appending the `test` flag, as in `node . test`. This will expose some pages which can be used to test features such as sending and receiving chat messages.