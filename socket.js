const chat = require("./models/chat");

module.exports = function(io) {

   let connectedUsers = {};
   let anonCount = 0;
   let usersConnected = 0;
   let userName = "";

   io.on("connection", (socket) => {
      console.log("user connected");
      console.log(socket.request.session);
      usersConnected += 1;

      io.emit("users update", {usersConnected});

      if(!socket.request.session.passport) {
         anonCount += 1;
         socket.userName = "Anon"+anonCount;
         connectedUsers[socket.userName] = socket;
      } else {
         socket.userName = socket.request.session.passport.user;
         connectedUsers[socket.userName] = socket;
      }

      socket.on("login", function() {
         console.log(socket.request.session);
         delete connectedUsers[socket.userName];
         socket.userName = socket.request.session.passport;
         connectedUsers[socket.userName] = socket;
      });
      

      socket.on("disconnect", function () {
         usersConnected -= 1;
         io.emit("users update", { usersConnected });
         delete connectedUsers[socket.userName];
         return console.log("The client has disconnected" + socket.userName);
      });
      
      socket.on("chat message", function(msg) {
         console.log(socket.request.session);
         console.log(msg, userName);
         io.emit("new chat message", {userName:socket.userName, msg})
      })
      console.log(connectedUsers);
      
   });
}

