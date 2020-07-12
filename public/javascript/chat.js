
(() => {
   console.log("chat.js");
   let socket = io();
   let chatList = document.querySelector(".chatList");
   let chatForm = document.querySelector(".chatForm");
   let chatInput = document.querySelector(".chatInput");
   let loginForm = document.querySelector(".loginForm");
   let userCount = document.querySelector(".userCount");

   if(chatForm) {
      chatForm.addEventListener("submit", (e) => {
         e.preventDefault();
         socket.emit("chat message", chatInput.value);
         chatInput.value = "";
      });
   }

   if(loginForm) {
      loginForm.addEventListener("submit", (e) => {
         // console.log("login");
         socket.emit("login");
      });
   }

   socket.on("new chat message", res => {
      console.log(res);
      chatList.insertAdjacentHTML("beforeend",`<li class="chatItem">${res.userName}: ${res.msg}</li>`);
   });
   
   socket.on("users update", res => {
      console.log(res);
      userCount.innerText = `Online users: ${res.usersConnected}`;
   });

})();

