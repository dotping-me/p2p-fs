import { getChannel } from "./comms.js";

const CHUNK_SIZE = 16 * 1024;

let buffers = [];
let expectedSize = 0;
let receivedSize = 0;

export function sendFile(file) {
    const channel = getChannel();
    console.log(channel);

    if (!channel || channel.readyState !== "open") {
        alert("Not connected");
        return;
    }

    channel.send(JSON.stringify({
        type: "meta",
        name: file.name,
        size: file.size
    }));

    let offset = 0;
    const reader = new FileReader();
    alert("Sending data");

    // Recursively sends chunks of file
    reader.onload = (e) => {
        channel.send(e.target.result);
        offset += e.target.result.byteLength;

        if (offset < file.size) {
            readSlice(offset);
        }
    };

    function readSlice(offset) {
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        reader.readAsArrayBuffer(slice);
    }

    readSlice(0);
}

// For receiving peer
export function handleIncomingData(data, onComplete) {
    if (typeof data === "string") {
        const meta = JSON.parse(data);

        if (meta.type === "meta") {
            buffers = [];
            receivedSize = 0;
            expectedSize = meta.size;
        }
        
        alert("Receiving data");
        return;
    }

    // Receives chunk
    buffers.push(data);
    receivedSize += data.byteLength;

    // Assemble chunks if all chunks received
    if (receivedSize === expectedSize) {
        const blob = new Blob(buffers);
        onComplete(blob);
    }
}