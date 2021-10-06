const socket = io.connect('uniiotproject.ml:443',{secure: true});

socket.emit('devices/request','dashboard')

socket.on('devices/respond', (message)=>{
    deviceItem(message);
});

function selectDevice(id) {
    console.log('clik'+id);
    window.location.href = "/device/"+id;
}

function deviceItem(device){
    const divElement = document.createElement('div');
    divElement.classList.add('card');
    divElement.classList.add('m-4');
    divElement.classList.add('text-white');
    divElement.classList.add('bg-primary');
    divElement.classList.add('mb-3');
    divElement.id = device
    divElement.type = "button"

    divElement.innerHTML = "<div class='card-header'>"+device+"</div>";
    document.querySelector('.devices').appendChild(divElement)
    document.getElementById(device).addEventListener('click', function (event) {
        selectDevice(this.id);
    });


}