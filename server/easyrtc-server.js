// Load required modules
//From https://nodejs.org/en/knowledge/HTTP/servers/how-to-create-a-HTTPS-server/
const fs = require('fs');
var Client = require('ftp');
const key = fs.readFileSync('./server/key.pem');
const cert = fs.readFileSync('./server/cert.pem');
const logFolderPath = './logs/';
var currentRoomLogs = {};
var currentUserRoom = {};

const https = require('https');
const http = require("http");                 // http server core module
const path = require("path");
const express = require("express");           // web framework external module
const socketIo = require("socket.io");        // web socket external module
const easyrtc = require("open-easyrtc");      // EasyRTC external module

// Set process name
process.title = "networked-aframe-server";

// Get port or default to 8080
const port = process.env.PORT || 8080;
// Setup and configure Express http server.
const app = express();
app.use(express.static(path.resolve(__dirname, "..", "examples")));

//Prepare FTP client for storing user logs on FTP server
var c = new Client();
//c.connect({host: '73.132.239.210', port: 21, user: 'FTP-garden-logs', password: 'password'});

//Testing with local network ftp server
c.connect({host: '192.168.0.16', port: 21, user: 'FTP-garden-logs', password: 'password'});

// Serve the example and build the bundle in development.
if (process.env.NODE_ENV === "development") {
  const webpackMiddleware = require("webpack-dev-middleware");
  const webpack = require("webpack");
  const config = require("../webpack.config");

  app.use(
    webpackMiddleware(webpack(config), {
      publicPath: "/"
    })
  );
}

// Start Express http server
//const webServer = http.createServer(app);
// Start Express https server
const webServer = https.createServer({key: key, cert: cert}, app);

// Start Socket.io so it attaches itself to Express server
const socketServer = socketIo.listen(webServer, {"log level": 1});
const myIceServers = [
  {"urls":"stun:stun1.l.google.com:19302"},
  {"urls":"stun:stun2.l.google.com:19302"},
  // {
  //   "urls":"turn:[ADDRESS]:[PORT]",
  //   "username":"[USERNAME]",
  //   "credential":"[CREDENTIAL]"
  // },
  // {
  //   "urls":"turn:[ADDRESS]:[PORT][?transport=tcp]",
  //   "username":"[USERNAME]",
  //   "credential":"[CREDENTIAL]"
  // }
];
easyrtc.setOption("appIceServers", myIceServers);
easyrtc.setOption("logLevel", "debug");
//easyrtc.setOption("logMessagesEnable", true);
easyrtc.setOption("demosEnable", false);

// Overriding the default easyrtcAuth listener, only so we can directly access its callback
easyrtc.events.on("easyrtcAuth", (socket, easyrtcid, msg, socketCallback, callback) => {
    easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, (err, connectionObj) => {
        if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
            callback(err, connectionObj);
            return;
        }

        connectionObj.setField("credential", msg.msgData.credential, {"isShared":false});

        console.log("["+easyrtcid+"] Credential saved!", connectionObj.getFieldValueSync("credential"));

        callback(err, connectionObj);
    });
});

// To test, lets print the credential to the console for every room join!
easyrtc.events.on("roomJoin", (connectionObj, roomName, roomParameter, callback) => {
    console.log("["+connectionObj.getEasyrtcid()+"] Credential retrieved!", connectionObj.getFieldValueSync("credential"));
    easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
    connectionObj.room(roomName,(err,connectionRoomObj) => {
      if(connectionRoomObj.getRoom().getConnectionCountSync() == 1){
        //Open a new file with filename as roomName+currenttimestamp if the user who joined the room is the only user in the room
        //Start logging all user position data from this room into this file
        currentRoomLogs[roomName] = roomName+Date.now()+'.txt';
      }
      //Save which room the user is in. Couldn't find a single function that would get the single current room for a user.
      currentUserRoom[connectionObj.getEasyrtcid()] = roomName;
    });
});

// Start EasyRTC server
easyrtc.listen(app, socketServer, null, (err, rtcRef) => {
    console.log("Initiated");

    rtcRef.events.on("roomCreate", (appObj, creatorConnectionObj, roomName, roomOptions, callback) => {
        console.log("roomCreate fired! Trying to create: " + roomName);

        appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
    });
});

// Modify onEmitEasyrtcMsg to print message data or store it in a database during the session!
easyrtc.events.on("easyrtcMsg", (connectionObj, msg, socketCallback, next) => {
  if(msg.msgType == 'customLogMessage'){
    msg.msgData['serverTime']=Date.now();
    var roomName = currentUserRoom[connectionObj.getEasyrtcid()];

    //Write logs to remote FTP server file
    c.on('ready', function() {
        c.put(JSON.stringify(msg.msgData)+'\n', currentRoomLogs[roomName], function(err) {
          if (err) throw err;
          c.end();
        });
    });
    //Write logs to local file
    //console.log("["+connectionObj.getEasyrtcid()+"] :", JSON.stringify(msg.msgData));
    /*fs.appendFile(logFolderPath+currentRoomLogs[roomName],JSON.stringify(msg.msgData)+'\n', (err) => {
      if (err) {
        console.log(err);
      }
      else {
        //console.log("Wrote to "+ logFolderPath+currentRoomLogs[roomName]);
      }
    });*/
  }
  else{
    easyrtc.events.defaultListeners.easyrtcMsg(connectionObj, msg, socketCallback, next);
  }
});


// Listen on port
webServer.listen(port, () => {
    console.log("listening on http://localhost:" + port);
});