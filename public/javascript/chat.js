
(() => {
   console.log("chat.js");
   let socket = io();
   let chatList = document.querySelector(".chatList");
   let chatForm = document.querySelector(".chatForm");
   let chatInput = document.querySelector(".chatInput");

   chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      socket.emit("chat message", chatInput.value);
      chatInput.value = "";
   });

   socket.on("new chat message", res => {
      console.log(res);
      chatList.insertAdjacentHTML("beforeend",`<li class="chatItem">${res.userName}: ${res.msg}</li>`);
   });
   

})();

