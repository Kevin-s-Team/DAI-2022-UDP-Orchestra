const dgram = require('dgram')
const net = require('net')
const day = require('dayjs')
const protocol = require('./auditor-protocol')

// Pour le "fancy dashboard"
const http = require('http')

// crée un socket UDP IPv4
const socket = dgram.createSocket('udp4');

// crée un serveur TCP
const server = net.createServer(onClientConnection);

const musicians = new Map();

const soundsIntstruments = {
    'ti-ta-ti': 'piano',
    pouet: 'trumpet',
    trulu: 'flute',
    'gzi-gzi': 'violin',
    'boum-boum' : 'drum'
}


/* partie UDP */

// écoute sur le port 8059 du groupe multicast
socket.bind(protocol.PROTOCOL_PORT, () => {
    console.log("Joining multicast group");
    socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

// appelle la fonction lambda suivante lorsqu'on reçoit un event de type message
socket.on('message', (msg, rinfo) => {
    // récupération des données du message
    const { idMusician, sound } = JSON.parse(msg.toString());

    // si le musicien n'est pas dans la Map on l'ajoute dans la Map
    if(!musicians.has(idMusician)){
        const instrument = soundsIntstruments[sound];
        const activeSince = day();
        
        musicians.set(idMusician, {idMusician, instrument, activeSince, lastPlay:day()});
        console.log(musicians.get(idMusician));

    }
    else{ // sinon on met a jour la propriété lastPlay avec le temps actuel
        var musician = musicians.get(idMusician);
        musicians.set(idMusician, {...musician, lastPlay:day()});
    }
});


// fonction qui contrôle si un musicien à émis un son les 5 dernières sec,
// si ce n'est pas le cas il est enlevé de la Map
function checkActive(){
    for(let key of musicians.keys()){
        var musician = musicians.get(key);
        if(day().diff(musician.lastPlay) > protocol.INTERVAL){
            musicians.delete(key);
        }
    }
}

// la fonction de contrôle est exécutée toutes les 1/2 sec
setInterval(checkActive, 500);


/* partie TCP */

// le serveur TCP écoute sur le port 2205
server.listen(protocol.TCP_PORT, () => {
    console.log('Server started on port '+ protocol.TCP_PORT)
});

// fonction de callback lorsqu'un client se connecte
function onClientConnection(sock){
    console.log("New connection established");
      
    // préparation du message à envoyé
    payload = [];
    for (const val of musicians.values()) {
        let res = {...val};
        delete res.lastPlay;
        payload.push(res);
    }

    // envoie sur le socket puis termine la connexion
    sock.write(JSON.stringify(payload));
    sock.end();
};


/* partie Fancy - Ajout */
// To make a payload from the current state
function getCurrentStateAsJSON(){
	payload = [];
	for (const val of musicians.values()) {
		let res = {...val};
		delete res.lastPlay;
		console.log(res);
		payload.push(res);
	}

	return JSON.stringify(payload);
}

// Ultra basic http server answering with code 200 and the current state as JSON 
// to any incoming request
const httpServer = http.createServer((req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
	res.end(getCurrentStateAsJSON());
});

// Launch said server
httpServer.listen(3000, () => {
	console.log('Http server running on port 3000');
});
  