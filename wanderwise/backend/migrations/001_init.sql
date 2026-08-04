CREATE TABLE users (

id TEXT PRIMARY KEY,

email TEXT UNIQUE NOT NULL,

password_hash TEXT NOT NULL,

name TEXT NOT NULL,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);


CREATE TABLE trips (

id TEXT PRIMARY KEY,

user_id TEXT,

title TEXT,

city TEXT,

country TEXT,

created_at DATETIME DEFAULT CURRENT_TIMESTAMP

);


CREATE TABLE places (

id TEXT PRIMARY KEY,

name TEXT,

city TEXT,

country TEXT,

description TEXT

);