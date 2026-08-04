package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"
	"time"
)

type JWTClaims struct {
	Sub   string `json:"sub"`
	Email string `json:"email"`
	Exp   int64  `json:"exp"`
	Iat   int64  `json:"iat"`
}

type JWTHeader struct {
	Alg string `json:"alg"`
	Typ string `json:"typ"`
}

// GenerateToken generates a signed JWT token for the user with 7 days lifetime.
func GenerateToken(userID, email, secret string) (string, error) {
	header := JWTHeader{
		Alg: "HS256",
		Typ: "JWT",
	}

	headerJSON, err := json.Marshal(header)
	if err != nil {
		return "", err
	}

	now := time.Now()
	claims := JWTClaims{
		Sub:   userID,
		Email: email,
		Iat:   now.Unix(),
		Exp:   now.Add(7 * 24 * time.Hour).Unix(),
	}

	claimsJSON, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}

	headerEncoded := base64.RawURLEncoding.EncodeToString(headerJSON)
	claimsEncoded := base64.RawURLEncoding.EncodeToString(claimsJSON)

	signingInput := headerEncoded + "." + claimsEncoded

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(signingInput))
	signature := mac.Sum(nil)

	signatureEncoded := base64.RawURLEncoding.EncodeToString(signature)

	return signingInput + "." + signatureEncoded, nil
}

// ValidateToken validates a JWT token and returns its claims.
func ValidateToken(tokenString, secret string) (*JWTClaims, error) {
	parts := strings.Split(tokenString, ".")
	if len(parts) != 3 {
		return nil, errors.New("invalid token format")
	}

	headerEncoded, claimsEncoded, signatureEncoded := parts[0], parts[1], parts[2]

	signingInput := headerEncoded + "." + claimsEncoded

	// Verify signature
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(signingInput))
	expectedSignature := mac.Sum(nil)

	actualSignature, err := base64.RawURLEncoding.DecodeString(signatureEncoded)
	if err != nil {
		return nil, errors.New("invalid signature encoding")
	}

	if !hmac.Equal(actualSignature, expectedSignature) {
		return nil, errors.New("invalid signature")
	}

	// Decode claims
	claimsJSON, err := base64.RawURLEncoding.DecodeString(claimsEncoded)
	if err != nil {
		return nil, errors.New("invalid claims encoding")
	}

	var claims JWTClaims
	if err := json.Unmarshal(claimsJSON, &claims); err != nil {
		return nil, err
	}

	// Verify expiration
	if time.Now().Unix() > claims.Exp {
		return nil, errors.New("token has expired")
	}

	return &claims, nil
}
