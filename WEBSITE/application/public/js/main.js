const socket = io();

socket.on('message', msg =>{
    const elementById = document.getElementById('xd');
    elementById.innerHTML = msg.toString();
});


