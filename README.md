> This application is in early stage of development, there might be security issues and some features might not be working

> TODO:
> - Redesign frontend
> - Automatic file deletion after certain amount of time
> - Ability to delete the file as the uploader
> - Encryption? Maybe? (Must do it client-side to save server resources)

# TextStash
A very simple pastebin/hastebin alternative

Also check out [TextStash](https://github.com/simoonoravec/textstash) if you like this!
# FileStash
A very simple file sharing service

# How to install
### Requirements:
- NodeJS (Recommended version: 20)
- NPM
```
git clone https://github.com/simoonoravec/filestash.git
cd filestash
npm install
```
Rename **config.example.js** to **config.js** and adjust the configuration as you need to

```
npm start
```
# Running in background
To run the application in background, I recommend using [PM2](https://www.npmjs.com/package/pm2). But feel free to use other methods (such as creating a *systemd* service).
### Simple PM2 guide:
I'm assuming you already have Node.js and NPM installed\
Recommeded version: 20
  1. *Follow the installation steps from above* ([How to install](#how-to-install))
  2. Stop the application if you already started it
  3. Install PM2 on your system `$ npm install pm2 -g`
  4. Start the application with PM2 `$ pm2 start index.js --name Filetash`
  5. Configure PM2 to start on boot `$ pm2 startup`
  6. Save PM2 process list `$ pm2 save`
  7. Done!

Complete PM2 documentation can be found here: https://pm2.keymetrics.io/docs/usage/quick-start/
