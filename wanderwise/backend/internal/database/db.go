package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/tursodatabase/libsql-client-go/libsql"
)

// Connect opens a connection to the Turso DB.
func Connect(dbURL, authToken string) (*sql.DB, error) {
	connStr := fmt.Sprintf("%s?authToken=%s", dbURL, authToken)
	db, err := sql.Open("libsql", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}

// RunMigrations checks if the users table exists. If not, it executes migration SQL.
func RunMigrations(db *sql.DB, migrationFilePath string) error {
	var tableExists bool
	err := db.QueryRow("SELECT EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='users')").Scan(&tableExists)
	if err != nil {
		return fmt.Errorf("failed to check if users table exists: %w", err)
	}

	if tableExists {
		log.Println("Database already initialized, skipping migrations.")
		return nil
	}

	log.Printf("Initializing database schema from %s...", migrationFilePath)
	content, err := os.ReadFile(migrationFilePath)
	if err != nil {
		return fmt.Errorf("failed to read migration file: %w", err)
	}

	_, err = db.Exec(string(content))
	if err != nil {
		return fmt.Errorf("failed to execute migrations: %w", err)
	}

	log.Println("Database schema successfully initialized!")
	return nil
}
