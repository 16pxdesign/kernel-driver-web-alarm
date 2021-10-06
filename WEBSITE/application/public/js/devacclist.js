const socket = io.connect('uniiotproject.ml:443', {secure: true});
var objjson = new Object();
objjson.id = document.getElementById("deviceid").textContent;
objjson.type = "ARM"
const parse = JSON.stringify(objjson);
socket.emit('hardware/request', parse);
//FIX BUG NEED TWICE
var test = new Object();
test.id = document.getElementById("deviceid").textContent;
test.type = "ALARM"
const parse2 = JSON.stringify(test);
socket.emit('hardware/request', parse2);

socket.on('hardware/respond', (message) => {
    console.log("message" + message)
    if (message.action == "ALARM")
        highlight(message.action, message)

    if (message.action == "ARM")
        highlight(message.action, message)
});

socket.on('hardware/live', (message) => {
    console.log('live mess' + message)
    try {
        var liveevent = JSON.parse(message)
        
        console.log("message" + liveevent)
        if (liveevent.action == "ALARM")
            highlight(liveevent.action, liveevent)

        if (liveevent.action == "ARM")
            highlight(liveevent.action, liveevent)

        console.log("co mamy " + liveevent.action);

        if(liveevent.action=="PIR")
            highlight(liveevent.action, liveevent)
        if(liveevent.action=="BUTTON")
            highlight(liveevent.action, liveevent)
        if(liveevent.action=="RESISTOR")
            highlight(liveevent.action, liveevent)
        if(liveevent.action=="DOOR")
            highlight(liveevent.action, liveevent)


    }catch (e) {
        console.log("live not parse ")
    }
    
});

function highlight(id, data) {

    var obj = document.getElementById(id);
    console.log(obj)
    var date = new Date(data.timestamp)
    if(data.value === undefined){
        obj.innerHTML = "<div class=\'card-header\'>" + data.action + "</div><p class=\'time\'>" + date + "</p><p class=\'state\'>n/a</p>";

    }else {
        obj.innerHTML = "<div class=\'card-header\'>" + data.action + "</div><p class=\'time\'>" + date + "</p><p class=\'state\'>" + data.value + "</p>";

    }
    obj.addEventListener("click", function(e){
        e.preventDefault;


        obj.classList.remove("backgroundAnimated");



        void obj.offsetWidth;

        obj.classList.add("backgroundAnimated");
    }, false);

    eventFire(document.getElementById(id), 'click');

}

function timeConverter(timestamp) {
    var a = new Date(timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}

function eventFire(el, etype){
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        var evObj = document.createEvent('Events');
        evObj.initEvent(etype, true, false);
        el.dispatchEvent(evObj);
    }
}