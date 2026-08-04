package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/ShaharyarShakir/wanderwise/internal/middleware"
	"github.com/ShaharyarShakir/wanderwise/internal/repository"
	"github.com/ShaharyarShakir/wanderwise/internal/service"
)

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

type registerRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type userResponse struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type registerResponse struct {
	User  userResponse `json:"user"`
	Token string       `json:"token"`
}

type loginResponse struct {
	Token string `json:"token"`
}

func writeError(w http.ResponseWriter, status int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": message})
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req registerRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	user, token, err := h.authService.Register(r.Context(), req.Name, req.Email, req.Password)
	if err != nil {
		if errors.Is(err, repository.ErrDuplicateEmail) {
			writeError(w, http.StatusConflict, err.Error())
			return
		}
		if errors.Is(err, service.ErrNameRequired) ||
			errors.Is(err, service.ErrNameTooLong) ||
			errors.Is(err, service.ErrInvalidEmail) ||
			errors.Is(err, service.ErrPasswordTooShort) ||
			errors.Is(err, service.ErrPasswordRequirements) {
			writeError(w, http.StatusBadRequest, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	res := registerResponse{
		User: userResponse{
			ID:    user.ID,
			Name:  user.Name,
			Email: user.Email,
		},
		Token: token,
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(res)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req loginRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	token, err := h.authService.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			writeError(w, http.StatusUnauthorized, err.Error())
			return
		}
		writeError(w, http.StatusInternalServerError, "Internal server error")
		return
	}

	res := loginResponse{
		Token: token,
	}

	_ = json.NewEncoder(w).Encode(res)
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	user, err := h.authService.CurrentUser(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	res := userResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
	}

	_ = json.NewEncoder(w).Encode(res)
}
