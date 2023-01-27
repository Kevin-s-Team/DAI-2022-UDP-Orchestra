const dgram = require('node:dgram')
const { argv } = require('process')
const { v4: uuid } = require('uuid')
const protocol = require('./musician-protocol')

const instrumentSounds = {
    piano: 'ti-ta-ti',
    trumpet: 'pouet',
    flute: 'trulu',
    violin: 'gzi-gzi',
    drum: 'boum-boum'
}

// crée un socket UDP IPv4
const socket = dgram.createSocket('udp4')

// contrôle des arguments
if(argv.length != 3 || !(argv[2] in instrumentSounds)){
    console.log('Error with args');
    process.exit(1);
}

const instrument = argv[2];
const sound = instrumentSounds[instrument];
const idMusician = uuid();

// prépare le payload sous format JSON
const payload = JSON.stringify({
    idMusician,
    sound
});

// execute la fonction (lambda) suivante toute les 1000 ms (1s)
setInterval( () => {

    // envoie du payload sur le port 8059 et l'IP multicast 231.6.7.9
    socket.send(payload, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, (err) => {
        // callback appelé après que le message à été envoyé
        if(err){
            console.log(err);
        }
        else{
            console.log("Sending payload: " + payload + " via port " + socket.address().port);
        }
    });
}, protocol.INTERVAL);
