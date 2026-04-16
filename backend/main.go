package main

import (
	"log"
	"net/http"

	"github.com/dotping-me/p2p-fs/server"
)

// Serves frontend and handles websockets, file sharing and so on
func main() {
	hub := server.NewHub()
	go hub.Run() // Runs asynchronously

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		server.HandleWebsocket(hub, w, r)
	})

	// Serving static frontend files
	fs := http.FileServer(http.Dir("../frontend"))
	http.Handle("/", fs)

	log.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil)) // Starts server
}
