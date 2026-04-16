package utils

import "math/rand"

// Generates a random ID
func GenerateId(n uint) string {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789"

	b := make([]byte, 8)
	for i := range b {
		b[i] = chars[rand.Intn(len(chars))]
	}

	return string(b)
}
