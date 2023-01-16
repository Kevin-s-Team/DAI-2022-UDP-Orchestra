const dgram = require('dgram')
const { argv } = require('process')
const net = require('net')
const protocol = require('./auditor-protocol')
const day = require('dayjs')

const socket = dgram.createSocket('udp4')
const server = net.createServer(onClientConnection);

const musicians = new Map();

const soundsIntstruments = {
    'ti-ta-ti': 'piano',
    pouet: 'trumpet',
    trulu: 'flute',
    'gzi-gzi': 'violin',
    'boum-boum' : 'drum'
}


socket.bind(protocol.PROTOCOL_PORT, () => {
    console.log("Joining multicast group");
    socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

socket.on('message', (msg, rinfo) => {
    const { idMusician, sound } = JSON.parse(msg.toString());

    if(!musicians.has(idMusician)){
        const instrument = soundsIntstruments[sound];
        const activeSince = day();
        
        musicians.set(idMusician, {idMusician, instrument, activeSince, lastPlay:day()});
        console.log(musicians.get(idMusician));

    }
    else{
        var musician = musicians.get(idMusician);
        musicians.set(idMusician, {...musician, lastPlay:day()});
    }

});


function checkActive(){
    for(let key of musicians.keys()){
        var musician = musicians.get(key);
        if(day().diff(musician.lastPlay) > protocol.INTERVAL){
            musicians.delete(key);
        }
    }
}

setInterval(checkActive, 500);

server.listen(protocol.TCP_PORT, () => {
    console.log('Server started on port '+ protocol.TCP_PORT)
});


function onClientConnection(sock){
    console.log("new connection established");
        
    payload = [];
    for (const val of musicians.values()) {
        let res = {...val};
        delete res.lastPlay;
        console.log(res);
        payload.push(res);
    }
    sock.write(JSON.stringify(payload));
    sock.end();
};