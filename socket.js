const chat = require("./models/chat");

module.exports = function(io) {

   let connectedUsers = {};
   let anonCount = 0;
   let userName = "";

   io.on("connection", (socket) => {
      console.log("user connected");
      console.log(socket.request.session);

      if(!socket.request.session.passport) {
         anonCount += 1;
         userName = "Anon"+anonCount;
         connectedUsers[userName] = socket;
      } else {
         userName = socket.request.session.passport.user;
         connectedUsers[userName] = socket;
      }

      socket.on("disconnect", function () {
         delete connectedUsers[userName];
         return console.log("The client has disconnected");
      });
      
      socket.on("chat message", function(msg) {
         console.log(socket.request.session);
         console.log(msg, userName);
         io.emit("new chat message", {userName, msg})
      })
      console.log(connectedUsers);
      
   });
}

