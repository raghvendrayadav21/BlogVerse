# BlogVerse — Write. Connect. Share.

> A production-quality full-stack social blogging and content-sharing platform built with Spring Boot Microservices + React + TypeScript.

[![Java](https://img.shields.io/badge/Java-21-orange)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-lightblue)](https://www.mysql.com/)

---

## Architecture Overview

```
Frontend (React 19 + Vite + Tailwind CSS) — Port 5173
    │
    ▼
API Gateway (Spring Cloud Gateway) — Port 8080
    │ JWT Validation + CORS + Routing
    ├── auth-service          (Port 8081) — Register, Login, OAuth2, JWT
    ├── user-service          (Port 8082) — Profiles, Follow/Unfollow
    ├── post-service          (Port 8083) — Posts, Drafts, Hashtags, Feed
    ├── interaction-service   (Port 8084) — Likes, Comments, Bookmarks
    ├── media-service         (Port 8085) — File & Image Uploads
    ├── notification-service  (Port 8086) — Notifications
    └── search-service        (Port 8087) — Search (users, posts, tags)

    All services register with:
    Eureka Discovery Server   (Port 8761)
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS v4, Framer Motion |
| State | TanStack Query v5, Zustand |
| Backend | Java 21, Spring Boot 3.3.4 |
| Microservices | Spring Cloud 2023.0.3, Eureka, Spring Cloud Gateway |
| Security | Spring Security 6, JWT (Auth0 java-jwt), BCrypt, OAuth2 |
| Database | MySQL 8.x (localhost:3306) |

---

## Prerequisites

Before running locally on localhost, ensure you have installed:

- **Java 21+** — [Download](https://adoptium.net/)
- **Maven 3.9+** — [Download](https://maven.apache.org/)
- **Node.js 20+** — [Download](https://nodejs.org/)
- **MySQL 8.x Server** (running locally on port 3306)

---

## Quick Start — Local Development (Localhost)

### 1. Clone and configure

```bash
git clone https://github.com/yourusername/blogverse.git
cd blogverse
cp .env.example .env
```

Edit `.env` and fill in your local MySQL password and secrets:
- `MYSQL_ROOT_PASSWORD` — local MySQL password
- `JWT_SECRET` — random 64+ character string
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` (optional, for OAuth2)

### 2. Build and run backend services

```bash
# Build the entire multi-module Maven project
cd backend
mvn clean install -DskipTests

# Start Discovery Server first:
cd eureka-server && mvn spring-boot:run

# In separate terminal windows, start each microservice:
cd auth-service && mvn spring-boot:run
cd user-service && mvn spring-boot:run
cd post-service && mvn spring-boot:run
cd interaction-service && mvn spring-boot:run
cd media-service && mvn spring-boot:run
cd notification-service && mvn spring-boot:run
cd search-service && mvn spring-boot:run

# Finally start the API Gateway:
cd api-gateway && mvn spring-boot:run
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend app will be running at: **http://localhost:5173** (or port configured by Vite).

---

## API Documentation

All services expose Swagger UI at `/swagger-ui.html` on their respective ports.

### Authentication Endpoints
| Method | URL | Description |
|---|---|---|
| POST | `/api/auth/register` | Register with email/password |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Revoke refresh token |
| GET | `/oauth2/authorization/google` | Initiate Google OAuth2 |

### Posts
| Method | URL | Description |
|---|---|---|
| POST | `/api/posts` | Create post |
| GET | `/api/posts/feed` | Get personalized feed |
| GET | `/api/posts/trending` | Get trending posts |
| POST | `/api/posts/{id}/like` | Like a post |
| POST | `/api/posts/{id}/comments` | Comment on a post |
| POST | `/api/posts/{id}/bookmark` | Bookmark a post |

See full API docs in [docs/api-documentation.md](docs/api-documentation.md)

---

## Google OAuth2 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable the "Google+ API" or "People API"
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web Application**
6. Add authorized redirect URI: `http://localhost:8081/login/oauth2/code/google`
7. Copy Client ID and Client Secret to your `.env` file

---

## Running Tests

```bash
# Run all backend tests
cd backend
mvn test

# Run with coverage report
mvn test jacoco:report

# View coverage report
open target/site/jacoco/index.html
```

---

## Project Structure

```
BlogVerse/
├── backend/
│   ├── pom.xml                     # Parent POM
│   ├── eureka-server/              # Service Discovery
│   ├── api-gateway/                # Single entry point + JWT validation
│   ├── auth-service/               # Registration, Login, OAuth2, JWT
│   ├── user-service/               # User profiles, Follow/Unfollow
│   ├── post-service/               # Posts, Drafts, Feed, Trending
│   ├── interaction-service/        # Likes, Comments, Bookmarks
│   ├── media-service/              # Image/Video upload to S3/MinIO
│   ├── notification-service/       # Real-time notifications
│   └── search-service/             # Search users, posts, hashtags
│
├── frontend/                       # React 19 + TypeScript + Tailwind
├── docker-compose.yml              # Local development stack
├── scripts/db-init.sql             # MySQL schema initialization
├── .env.example                    # Environment variable template
└── docs/                           # Architecture and API docs
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

**Built with ❤️ | BlogVerse — Write. Connect. Share.**
