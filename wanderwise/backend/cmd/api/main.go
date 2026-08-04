package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/ShaharyarShakir/wanderwise/internal/database"
	"github.com/ShaharyarShakir/wanderwise/internal/handlers"
	"github.com/ShaharyarShakir/wanderwise/internal/middleware"
	"github.com/ShaharyarShakir/wanderwise/internal/repository"
	"github.com/ShaharyarShakir/wanderwise/internal/service"
)

func main() {
	// Load environment variables from .env
	loadEnv(".env")

	dbURL := os.Getenv("TURSO_DATABASE_URL")
	dbToken := os.Getenv("TURSO_AUTH_TOKEN")
	jwtSecret := os.Getenv("JWT_SECRET")

	if dbURL == "" || dbToken == "" || jwtSecret == "" {
		log.Fatal("Missing required environment variables: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, or JWT_SECRET")
	}

	// Connect to Turso Database
	db, err := database.Connect(dbURL, dbToken)
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}
	defer db.Close()
	log.Println("Connected to Turso database successfully.")

	// Run Database migrations
	err = database.RunMigrations(db, "migrations/001_init.sql")
	if err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize repository, service, and handler layers
	userRepo := repository.NewUserRepository(db)
	authService := service.NewAuthService(userRepo, jwtSecret)
	authHandler := handlers.NewAuthHandler(authService)

	mux := http.NewServeMux()

	// Public Routes
	mux.HandleFunc("POST /auth/register", authHandler.Register)
	mux.HandleFunc("POST /auth/login", authHandler.Login)

	// Protected Routes (Wrapped in AuthMiddleware)
	mux.Handle("GET /auth/me", middleware.AuthMiddleware(jwtSecret)(http.HandlerFunc(authHandler.Me)))

	// Health Check
	mux.HandleFunc("GET /health", healthHandler)

	// Wrap in CORS middleware
	handler := corsMiddleware(mux)

	server := http.Server{
		Addr:    ":8080",
		Handler: handler,
	}

	fmt.Println("WanderWise API running on :8080")
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = fmt.Fprint(w, `{"status":"ok","service":"go-api"}`)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// loadEnv parses a .env file and sets environment variables.
func loadEnv(filepath string) {
	content, err := os.ReadFile(filepath)
	if err != nil {
		log.Printf("Warning: .env file not found at %s. Relying on system environment variables.", filepath)
		return
	}
	lines := strings.Split(string(content), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			val := strings.TrimSpace(parts[1])
			if strings.HasPrefix(val, "\"") && strings.HasSuffix(val, "\"") {
				val = val[1 : len(val)-1]
			}
			os.Setenv(key, val)
		}
	}
}