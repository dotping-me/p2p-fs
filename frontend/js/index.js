// TODO: Rewrite everything in Typescript
// TODO: Add confirmation before send
// TODO: Add progress bar

import { getClientID, newSignal, sendSignal } from "./ws.js";
import { newComms, createOffer, handleSignal } from "./comms.js";
import { sendFile, handleIncomingData, getReceivedFilename } from "./filetransfer.js";

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
        const files = document.getElementById("fileInput").files;
        for (let i = 0; i < files.length; i++) {
            sendFile(files[i]);
        }
    };
}

function createListElement(name, url) {
    const container = document.getElementById("receivedFiles");

    const item = document.createElement("div");
    item.className = "file-item";

    const link = document.createElement("a");
    link.href = url;
    link.innerText = name || "file";
    link.download = name; // Set download name

    link.target = "_blank";
    link.onclick = (e) => {
        e.preventDefault();
        window.open(url, "_blank");
    };

    // Adds download button
    const downloadBtn = document.createElement("button");
    downloadBtn.innerText = "Download";

    downloadBtn.onclick = () => {
        const a = document.createElement("a");
        a.href = url;
        a.download = name || "file";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    item.appendChild(link);
    item.appendChild(downloadBtn);

    container.appendChild(item);
}

window.onload = () => {
    document.getElementById("client").innerText = getClientID();

    newSignal(handleSignal);
    newComms((data) => {

        // Reconstructs received file
        // Normally this happens "recursively" for each file because it's a callback function
        handleIncomingData(data, (blob) => {            
            const url = URL.createObjectURL(blob);
            createListElement(getReceivedFilename(), url)
        });

    });

    attachEventListeners();
}