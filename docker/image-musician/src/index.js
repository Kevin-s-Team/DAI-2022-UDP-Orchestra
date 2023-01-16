const dgram = require('dgram')
const { argv } = require('process')
const socket = dgram.createSocket('udp4')
const { uuid } = require('uuidv4')
const protocol = require('./musician-protocol')


/*const multicast = {
    multicastAddress: "231.6.7.9",
    port: 8059
}*/
 
 const instrumentSounds = {
     piano: 'ti-ta-ti',
     trumpet: 'pouet',
     flute: 'trulu',
     violin: 'gzi-gzi',
     drum: 'boum-boum'
}

if(process.argv.length != 3 || !(process.argv[2] in instrumentSounds)){
    console.log('error with args');
    process.exit(1);
}

const instrument = argv[2];
const sound = instrumentSounds[instrument];
const idMusician = uuid();

const payload = JSON.stringify({
    idMusician,
    sound
});

setInterval( () => {
    socket.send(payload, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, (err, bytes) => {
        if(err){
            console.log(err);
        }
        else{
            console.log("Sending payload: " + payload + " via port " + socket.address().port);
        }
    });
}, protocol.INTERVAL);
