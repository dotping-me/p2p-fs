# 👥🧬 Peer-to-Peer File Sharing
A file sharing service that connects end users directly to each other which means that there are no central servers storing files. I might have reinvented the wheel but at least I learnt a lot and I wanted to make this for a certain *someone*...

## 💭 How it works?
I'll try to explain it.

1. **Session Management and Signaling Server using Go.**
    * The Go HTTP server just handles websockets and the forwarding of messages.
    * **Session IDs** are given by the *Frontend*.
    * Sessions have a hard limit of 2 connections max.

2. **Peer-to-Peer file transfer using WebRTC.**
    * When a user clicks *"Connect"*, a WebRTC handshake starts and is established when it receives a response from another user/peer in that same session.
    * It uses STUN and TURN servers for IP discovery.
    * Files are chunked and sent directly to connected peers.

3. **Public access via NGROK**
    * Exposes the local server (just the Go backend) publicly.

## 💻 Setup & Usage
Follow these steps to setup your environment.

1. **Clone the repository.**
    ```bash
    git clone https://github.com/dotping-me/p2p-fs.git
    ```

2. **Navigate to the project's backend directory.**
    ```bash
    cd p2p-fs/backend/
    ```

3. **Install Go dependencies.**
    ```bash
    go mod tidy
    ```

4. **Start the Go HTTP server.**
    ```
    go run ./main.go
    ```

5. **Expose signaling service through NGROK**
    ```bash
    ngrok http 8080
    ```