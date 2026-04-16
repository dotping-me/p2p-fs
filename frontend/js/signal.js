let socket = null;

// It doesn't matter if backend IDs and frontend IDs do not match
const clientId = Math.random().toString(36).substring(2, 10);

export function newSignal(onMessage) { // onMessage is a callback function
    
    // Creates websocket
    socket = new WebSocket(`ws://${location.host}/ws`);
    socket.onmessage = async (e) => {
        const msg = JSON.parse(e.data);
        if (msg.from === clientId) return;
        
        console.log("Received signal:", msg.type);
        onMessage(msg);
    }

}

export function sendSignal(data) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.warn("Socket not ready!");
        return;
    }

    socket.send(JSON.stringify({ ...data, from: clientId }));
}