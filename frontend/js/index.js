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
    document.getElementById("newSessionBtn").onclick = () => {
        currentSession = Math.random().toString(36).substring(2, 10);
        sendSignal({
            type: "join",
            session: currentSession
        });

        console.log("Session created:", currentSession);
        document.getElementById("session").innerText = currentSession;
    };

    document.getElementById("joinSessionBtn").onclick = () => {
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

const MAX_NAME_LENGTH = 12;

// Helper function to format filename
function formatFileName(name) {
    if (!name) return "file";

    const parts = name.split(".");
    if (parts.length < 2) return name;

    const ext = parts.pop();      // Gets last element which is extension
    
    const base = parts.join("."); 
    if (base.length <= MAX_NAME_LENGTH) {
        return `${base}.${ext}`;
    }

    return `${base.slice(0, MAX_NAME_LENGTH)}...${ext}`;
}

function createListElement(name, url) {
    const container = document.getElementById("receivedFiles");

    const item = document.createElement("div");
    item.className = "file-item";

    const link = document.createElement("a");
    link.href = url;
    link.dataset.filename = name?.trim() || "file";

    // Clicking opens file in new tab
    link.target = "_blank";
    link.onclick = (e) => {
        e.preventDefault();
        window.open(url, "_blank");
    };

    /*
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
    */

    // Detects if received file is an image, if so show preview
    const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(name);
    let preview;

    if (isImage) {
        preview = document.createElement("img");
        preview.src = url;
        preview.className = "file-icon";
    }

    // Is a normal file
    else {
        preview = document.createElement("div");
        preview.className = "file-icon";
        preview.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>';
       
        preview.style.display = "flex";
        preview.style.alignItems = "center";
        preview.style.justifyContent = "center";
        preview.style.fontSize = "20px";
    }

    // Adds card with filename
    if (!isImage) {
        const fileName = document.createElement("div");
        fileName.className = "file-name";
        fileName.innerText = formatFileName(name);

        link.appendChild(preview);
        link.appendChild(fileName);

    } else {
        link.appendChild(preview);
    }

    item.appendChild(link);
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