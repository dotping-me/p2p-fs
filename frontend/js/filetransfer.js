// TODO: Switch to streaming bits

import { getChannel, getPeerConnStatus } from "./comms.js";

const CHUNK_SIZE = 16 * 1024;

let buffers = [];
let expectedSize = 0;
let receivedSize = 0;
let receivedFilename = null;

// To handle multiple files
let fileQueue = [];
let isSending = false;

export function sendFile(file) {
    fileQueue.push(file);
    processQueue();
}

function processQueue() {
    
    // Transfer already in process or no more files to transfer
    if (isSending || fileQueue.length === 0) {
        document.getElementById("status").innerText = getPeerConnStatus();    
        return;
    }

    // Sends first file in queue
    const file = fileQueue.shift();
    isSending = true;
    document.getElementById("status").innerText = "sending...";

    const channel = getChannel();
    if (!channel || channel.readyState !== "open") {
        alert("Not connected");
        isSending = false;
        return;
    }

    // Sends metadata
    channel.send(JSON.stringify({
        type: "meta",
        name: file.name,
        size: file.size
    }));

    let offset = 0;
    const reader = new FileReader();
    // alert("Sending data");

    // Recursively sends chunks of current file
    reader.onload = (e) => {
        channel.send(e.target.result);
        offset += e.target.result.byteLength;

        // Sends next chunk
        if (offset < file.size) {
            readSlice(offset);
        }

        // End transfer or send next file
        else {
            isSending = false;
            processQueue();
        }
    };

    function readSlice(offset) {
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        reader.readAsArrayBuffer(slice);
    }

    readSlice(0); // Starts transfer
}

// For receiving peer
export function handleIncomingData(data, onComplete) {
    document.getElementById("status").innerText = "receiving...";

    if (typeof data === "string") {
        const meta = JSON.parse(data);

        if (meta.type === "meta") {
            buffers = [];
            receivedSize = 0;
            expectedSize = meta.size;
            receivedFilename = meta.name;
        }
        
        // alert("Receiving data");
        return;
    }

    // Receives chunk
    buffers.push(data);
    receivedSize += data.byteLength;

    // Assemble chunks if all chunks received
    if (receivedSize === expectedSize) {
        document.getElementById("status").innerText = getPeerConnStatus();

        const blob = new Blob(buffers);
        onComplete(blob);
    }
}

export function getReceivedFilename() {
    return receivedFilename;
}