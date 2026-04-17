package server

import (
	"log"
	"net/http"

	"github.com/dotping-me/p2p-fs/utils"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func HandleWebsocket(sm *SessionManager, w http.ResponseWriter, r *http.Request) {
	log.Println("Client reached /ws endpoint")
	conn, _ := upgrader.Upgrade(w, r, nil)

	// Creates client
	client := &Client{
		id:   utils.GenerateId(8),
		conn: conn,
		send: make(chan Message),
	}

	log.Printf("Client %s successfully connected!", client.id)

	// Starts services
	go readLoop(sm, client)
	go writeLoop(client)
}

func readLoop(sm *SessionManager, client *Client) {
	for {
		var msg Message

		err := client.conn.ReadJSON(&msg)
		if err != nil {
			return
		}

		// Handles different types of messages
		switch msg.Type {

		// Client wants to join a session
		// The Session ID is provided by the frontend

		case "join":
			sessionObj := sm.GetOrCreate(msg.Session)
			if sessionObj.AddClient(client) {
				client.session = sessionObj

				log.Println("New Session:", msg.Session)
				log.Println("New Client:", client.id)
				log.Printf("%v\n", sm.sessions[msg.Session].clients)

				break
			}

			log.Printf("Failed to add Client %s to Session %s\n", client.id, msg.Session)

		default:
			if client.session == nil {
				return
			}

			client.session.channel <- msg
		}
	}
}

func writeLoop(client *Client) {
	for msg := range client.send {
		log.Printf("Client %s sending: [%s]!\n", client.id, msg.Type)
		client.conn.WriteJSON(msg)
	}
}
