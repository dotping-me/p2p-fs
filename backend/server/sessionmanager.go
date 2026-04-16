package server

import "sync"

type SessionManager struct {
	sessions map[string]*Session
	mu       sync.Mutex
}

func NewSessionManager() *SessionManager {
	return &SessionManager{
		sessions: make(map[string]*Session),
	}
}

func (sm *SessionManager) GetOrCreate(id string) *Session {
	sm.mu.Lock()
	defer sm.mu.Unlock()

	// Tries to find exitsing session with that ID
	if s, ok := sm.sessions[id]; ok {
		return s
	}

	// No existing sessions found, creates new session
	s := NewSession(id)
	sm.sessions[id] = s
	return s
}
