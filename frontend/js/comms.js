import { sendSignal } from "./signal.js";

var peerConn = null;
var channel = null;
var onDataCallback = null;

function setupChannel() {
    channel.onopen = () => console.log("Channel open!");
    channel.onmessage = (e) => onDataCallback(e.data);
}

export function newComms(onData) { // onData is a callback function
    onDataCallback = onData;

    peerConn = new RTCPeerConnection({
        
        /*
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" }
        ]
        */
       
    });

    console.log(peerConn);

    // Sets behaviour on connection
    peerConn.ondatachannel = (event) => {
        channel = event.channel;
        setupChannel();
    };

    peerConn.onicecandidate = (event) => {
        if (event.candidate) {
            sendSignal({
                type: "candidate",
                payload: JSON.stringify(event.candidate)
            });
        }
    };

    peerConn.onconnectionstatechange = () => {
        console.log("State:", peerConn.connectionState);
    };
}

export function createOffer() {
    channel = peerConn.createDataChannel("file");
    setupChannel();

    console.log(channel);

    // Harry Potter wizardry here!
    return peerConn.createOffer()
        .then(offer => peerConn.setLocalDescription(offer).then(() => offer))
        .then(offer => {
        sendSignal({
            type: "offer",
            payload: JSON.stringify(offer)
        });
    });
}

export async function handleSignal(msg) {

    switch (msg.type) {
    case "offer":
        await peerConn.setRemoteDescription(
            new RTCSessionDescription(JSON.parse(msg.payload))
        );

        const answer = await peerConn.createAnswer();
        await peerConn.setLocalDescription(answer);

        sendSignal({
            type: "answer",
            payload: JSON.stringify(answer)
        });

        break;

    case "answer":
        await peerConn.setRemoteDescription(
            new RTCSessionDescription(JSON.parse(msg.payload))
        );

        break;

    case "candidate":
        await peerConn.addIceCandidate(
            new RTCIceCandidate(JSON.parse(msg.payload))
        );

        break;
  }
}

export function getChannel() {
    return channel;
}