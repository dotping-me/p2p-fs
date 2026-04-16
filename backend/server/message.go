package server

type Message struct {
	Type    string `json:"type"` // Request, response, ...
	Session string `json:"session"`
	From    string `json:"from"`
	To      string `json:"to"`
	Payload string `json:"payload"`
}
