package server

import (
	"github.com/gorilla/websocket"
)

type Client struct {
	id      string
	conn    *websocket.Conn
	send    chan Message
	session *Session
}
