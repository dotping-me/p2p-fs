import { sendSignal } from "./ws.js";

var peerConn = null;
var channel = null;
var onDataCallback = null;
var currentSession = null;

function setupChannel() {
    channel.onopen = () => console.log("Channel open!");
    channel.onmessage = (e) => onDataCallback(e.data);
}

export function setSession(id) {
    currentSession = id;
}

export function newComms(onData) { // onData is a callback function
    onDataCallback = onData;

    peerConn = new RTCPeerConnection({
        iceServers: [

            // STUN server
            { urls: "stun:stun.l.google.com:19302" },

            // TURN servers (Fallback for when STUN fails)

            // Currently using Metered TURN with hardcoded creds for now
            // TODO: Switch to using coturn (Self-host TURN)

            {
                urls: "turn:YOUR_TURN_URL",
                username: "YOUR_USERNAME",
                credential: "YOUR_PASSWORD"
            }
        ]
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
                session: currentSession,
                payload: JSON.stringify(event.candidate)
            });
        }
    };

    peerConn.onconnectionstatechange = () => {
        console.log("State:", peerConn.connectionState);
    };
}

export function createOffer(sessionID) {
    currentSession = sessionID;

    channel = peerConn.createDataChannel("file");
    setupChannel();

    console.log(channel);

    // Harry Potter wizardry here!
    return peerConn.createOffer()
        .then(offer => peerConn.setLocalDescription(offer).then(() => offer))
        .then(offer => {
        sendSignal({
            type: "offer",
            session: currentSession,
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
            session: msg.session,
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