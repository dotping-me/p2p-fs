import { newSignal } from "./signal.js";
import { newComms, createOffer, handleSignal } from "./comms.js";
import { sendFile, handleIncomingData } from "./filetransfer.js";

// Just for dev tools
import { getChannel } from "./comms.js";
window.getChannel = getChannel; 

function attachEventListeners() {
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