package server

import (
	"log"
	"net/http"

	"github.com/dotping-me/p2p-fs/utils"
	"github.com/gorilla/websocket"
)

type Client struct {
	id   string
	conn *websocket.Conn
	send chan Message
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func HandleWebsocket(hub *Hub, w http.ResponseWriter, r *http.Request) {

	// Creates client
	conn, _ := upgrader.Upgrade(w, r, nil)
	client := &Client{
		id:   utils.GenerateId(8),
		conn: conn,
		send: make(chan Message),
	}

	hub.connections[client.id] = client // Adds client to list of connections
	log.Printf("New Client! ID: %s\n", client.id)

	go readMessages(hub, client)
	go write(client)
}

// Infinte loop to continue reading messages and broadcasting them
func readMessages(hub *Hub, client *Client) {
	for {
		var msg Message
		if err := client.conn.ReadJSON(&msg); err != nil {
			break
		}

		hub.broadcast <- msg
	}
}

func write(client *Client) {
	for msg := range client.send {
		client.conn.WriteJSON(msg)
	}
}
