package server

type Message struct {
	Type    string `json:"type"` // Request, response, ...
	From    string `json:"from"`
	To      string `json:"to"`
	Payload string `json:"payload"`
}
