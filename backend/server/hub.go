package server

type Hub struct {
	connections map[string]*Client
	broadcast   chan Message
}

func NewHub() *Hub {
	return &Hub{
		connections: make(map[string]*Client),
		broadcast:   make(chan Message),
	}
}

func (h *Hub) Run() {
	for msg := range h.broadcast {
		for id, client := range h.connections {
			if id != msg.From {
				client.send <- msg
			}
		}
	}
}
