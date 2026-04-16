// TODO: Rewrite everything in Typescript

import { newSignal, sendSignal } from "./ws.js";
import { newComms, createOffer, handleSignal } from "./comms.js";
import { sendFile, handleIncomingData } from "./filetransfer.js";

// Just for dev tools
import { getChannel } from "./comms.js";
window.getChannel = getChannel; 

let currentSession = null;

function attachEventListeners() {

    // Session logic
    document.getElementById("newSession").onclick = () => {
        currentSession = Math.random().toString(36).substring(2, 10);
        sendSignal({
            type: "join",
            session: currentSession
        });

        console.log("Session created:", currentSession);
        document.getElementById("session").innerText = currentSession;
    };

    document.getElementById("joinSession").onclick = () => {
        currentSession = prompt("Enter session ID:"); // TODO: Change to a form
        sendSignal({
            type: "join",
            session: currentSession
        });

        console.log("Joined session:", currentSession);
        document.getElementById("session").innerText = currentSession;
    };

    // File transfer logic
    document.getElementById("connectBtn").onclick = () => {
        createOffer();
    };

    document.getElementById("sendBtn").onclick = () => {
        const file = document.getElementById("fileInput").files[0];
        if (file) sendFile(file);
    };
}

window.onload = () => {
    newSignal(handleSignal);

    newComms((data) => {
        handleIncomingData(data, (blob) => {
            
            // Reconstructs received image
            const receivedImage = URL.createObjectURL(blob);
            document.getElementById("preview").src = receivedImage;

        });
    });

    attachEventListeners();
}