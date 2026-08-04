package service

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"net/mail"
	"strings"
	"time"
	"unicode"

	"github.com/ShaharyarShakir/wanderwise/internal/auth"
	"github.com/ShaharyarShakir/wanderwise/internal/models"
	"github.com/ShaharyarShakir/wanderwise/internal/repository"
)

var (
	ErrInvalidEmail         = errors.New("Invalid email format")
	ErrPasswordTooShort     = errors.New("Password must be at least 8 characters")
	ErrPasswordRequirements = errors.New("Password must contain at least one uppercase letter, one lowercase letter, and one number")
	ErrNameRequired         = errors.New("Name is required")
	ErrNameTooLong          = errors.New("Name must not exceed 50 characters")
	ErrInvalidCredentials   = errors.New("Invalid credentials")
)

type AuthService interface {
	Register(ctx context.Context, name, email, password string) (*models.User, string, error)
	Login(ctx context.Context, email, password string) (string, error)
	CurrentUser(ctx context.Context, userID string) (*models.User, error)
}

type authService struct {
	userRepo  repository.UserRepository
	jwtSecret string
}

func NewAuthService(userRepo repository.UserRepository, jwtSecret string) AuthService {
	return &authService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

// GenerateUUID generates a random UUID v4 string using crypto/rand.
func GenerateUUID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	b[6] = (b[6] & 0x0f) | 0x40 // Version 4
	b[8] = (b[8] & 0x3f) | 0x80 // Variant 10
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
}

func validateEmail(email string) bool {
	_, err := mail.ParseAddress(email)
	if err != nil {
		return false
	}
	// Check for standard format containing '@' and a dot after '@'
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return false
	}
	return strings.Contains(parts[1], ".")
}

func validatePassword(password string) error {
	if len(password) < 8 {
		return ErrPasswordTooShort
	}

	var hasUpper, hasLower, hasDigit bool
	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsDigit(char):
			hasDigit = true
		}
	}

	if !hasUpper || !hasLower || !hasDigit {
		return ErrPasswordRequirements
	}

	return nil
}

func (s *authService) Register(ctx context.Context, name, email, password string) (*models.User, string, error) {
	name = strings.TrimSpace(name)
	email = strings.TrimSpace(strings.ToLower(email))

	if name == "" {
		return nil, "", ErrNameRequired
	}
	if len(name) > 50 {
		return nil, "", ErrNameTooLong
	}

	if email == "" || !validateEmail(email) {
		return nil, "", ErrInvalidEmail
	}

	if err := validatePassword(password); err != nil {
		return nil, "", err
	}

	// Hash password
	hashedPassword, err := auth.HashPassword(password)
	if err != nil {
		return nil, "", err
	}

	user := &models.User{
		ID:           GenerateUUID(),
		Name:         name,
		Email:        email,
		PasswordHash: hashedPassword,
		CreatedAt:    time.Now(),
	}

	err = s.userRepo.CreateUser(ctx, user)
	if err != nil {
		return nil, "", err
	}

	// Generate JWT
	token, err := auth.GenerateToken(user.ID, user.Email, s.jwtSecret)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *authService) Login(ctx context.Context, email, password string) (string, error) {
	email = strings.TrimSpace(strings.ToLower(email))

	if email == "" || password == "" {
		return "", ErrInvalidCredentials
	}

	user, err := s.userRepo.FindUserByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			return "", ErrInvalidCredentials
		}
		return "", err
	}

	err = auth.ComparePassword(user.PasswordHash, password)
	if err != nil {
		return "", ErrInvalidCredentials
	}

	token, err := auth.GenerateToken(user.ID, user.Email, s.jwtSecret)
	if err != nil {
		return "", err
	}

	return token, nil
}

func (s *authService) CurrentUser(ctx context.Context, userID string) (*models.User, error) {
	user, err := s.userRepo.FindUserByID(ctx, userID)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			return nil, errors.New("Unauthorized")
		}
		return nil, err
	}
	return user, nil
}
