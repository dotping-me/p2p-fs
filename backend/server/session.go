// TODO: Properly handle disconnections
// TODO: Return error to frontend if failed to add client
// TODO: Make the Client's ID (on the frontend) be the Session's ID
// TODO: Do not create a session if id being searched is not found, return error
// TODO: Add "Join" confirmation

package server

import "sync"

type Session struct {
	id      string
	clients map[string]*Client
	channel chan Message
	mu      sync.Mutex
}

// 1. Frontend gives user an ID
// 2. If ID already exists and is free, user joins that session
// 3. Else, create session

func NewSession(id string) *Session {
	s := &Session{
		id:      id,
		clients: make(map[string]*Client),
		channel: make(chan Message),
	}

	go s.Run()
	return s
}

func (s *Session) AddClient(c *Client) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if len(s.clients) >= 2 {
		return false
	}

	s.clients[c.id] = c
	return true
}

func (s *Session) RemoveClient(id string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	delete(s.clients, id)
}

func (s *Session) Run() {
	for msg := range s.channel {

		s.mu.Lock()
		for id, client := range s.clients {
			if id != msg.From {

				select {
				case client.send <- msg:
				default:
					// Apparently this avoids crashes ???
				}

			}
		}

		s.mu.Unlock()
	}
}
