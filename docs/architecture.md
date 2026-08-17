# BlogVerse Architecture Documentation

## System Overview

BlogVerse follows a **microservice architecture** where each domain concern is handled by a dedicated service. All client requests flow through the API Gateway, which handles authentication, routing, and CORS.

## Architecture Diagram

```
                         ┌──────────────────────────────┐
                         │      React Frontend            │
                         │  React 19 + Vite + TypeScript  │
                         │      Port: 3000               │
                         └──────────────┬───────────────┘
                                        │ HTTPS
                         ┌──────────────▼───────────────┐
                         │         API Gateway            │
                         │   Spring Cloud Gateway WebFlux  │
                         │         Port: 8080             │
                         │                                │
                         │  ● JWT Validation              │
                         │  ● CORS Handling               │
                         │  ● Rate Limiting               │
                         │  ● Request Routing via Eureka  │
                         └──┬──────┬──────┬──────┬───────┘
                            │      │      │      │
              ┌─────────────┘      │      │      └──────────────┐
              │              ┌─────┘      └───────┐             │
    ┌─────────▼────┐   ┌─────▼──────┐   ┌────────▼──┐  ┌───────▼──────┐
    │  auth-service│   │user-service│   │post-service│  │interaction   │
    │  Port: 8081  │   │ Port: 8082 │   │ Port: 8083 │  │  Port: 8084  │
    │              │   │            │   │            │  │              │
    │ ● Register   │   │ ● Profiles │   │ ● Posts    │  │ ● Likes      │
    │ ● Login      │   │ ● Follow   │   │ ● Feed     │  │ ● Comments   │
    │ ● OAuth2     │   │ ● Avatar   │   │ ● Hashtags │  │ ● Bookmarks  │
    │ ● JWT/Refresh│   │ ● Bio      │   │ ● Drafts   │  │ ● Shares     │
    └─────┬────────┘   └──────┬─────┘   └─────┬──────┘  └──────┬───────┘
          │                   │               │                  │
    ┌─────▼────────┐   ┌──────▼─────┐   ┌────▼──────┐
    │ media-service│   │notif-svc   │   │search-svc │
    │  Port: 8085  │   │ Port: 8086 │   │ Port: 8087│
    │              │   │            │   │           │
    │ ● Upload     │   │ ● Create   │   │ ● Users   │
    │ ● Validate   │   │ ● Read     │   │ ● Posts   │
    │ ● S3/MinIO   │   │ ● Mark Read│   │ ● Tags    │
    └──────────────┘   └────────────┘   └───────────┘
                  │
    ┌─────────────▼──────────────────────────────────────┐
    │          Eureka Discovery Server  (Port: 8761)       │
    │    All microservices register here for lb:// routing │
    └─────────────────────────────────────────────────────┘
                  │
    ┌─────────────▼──────────────┐   ┌────────────────────────┐
    │     MySQL 8.x               │   │    MinIO / AWS S3      │
    │  (Per-service schemas)      │   │   (Media storage)      │
    │                             │   │                        │
    │  blogverse_auth             │   │  Bucket: blogverse-    │
    │  blogverse_users            │   │          media         │
    │  blogverse_posts            │   │                        │
    │  blogverse_interactions     │   │  Images, Videos        │
    │  blogverse_media            │   │  stored here, NOT in DB│
    │  blogverse_notifications    │   │                        │
    │  blogverse_search           │   └────────────────────────┘
    └─────────────────────────────┘
```

## Communication Patterns

### 1. Client → Gateway → Service (Standard)
```
Browser → API Gateway (JWT validation) → Target Service (X-User-* headers)
```

### 2. Service → Service (Internal)
Services communicate via REST using Spring Cloud LoadBalancer + Eureka:
```java
// Example: interaction-service calling notification-service
@LoadBalanced WebClient → lb://notification-service/api/internal/notifications
```

### 3. JWT Flow
```
1. User logs in → auth-service generates JWT
2. Frontend stores token in memory + refresh token in httpOnly cookie
3. Each API request: Authorization: Bearer <token>
4. Gateway validates, extracts claims, injects X-User-Id, X-User-Email, X-User-Role headers
5. Downstream services read headers, NO re-validation needed
```

## Security Architecture

### JWT Claims
```json
{
  "sub": "12345",
  "userId": "12345",
  "email": "user@example.com",
  "username": "raghvendra",
  "role": "USER",
  "iss": "blogverse-auth",
  "iat": 1700000000,
  "exp": 1700000900
}
```

### Token Lifecycle
- **Access Token**: 15 minutes (configurable)
- **Refresh Token**: 7 days, stored in `refresh_tokens` table
- **Rotation**: Each refresh generates a new refresh token (old one invalidated)

### BCrypt Password Hashing
- Cost factor: 12
- Google OAuth2 users: no password stored (`provider = 'GOOGLE'`)

## Database-per-Service Pattern

Each service has its own logical MySQL schema. This ensures:
- **Service autonomy**: Schema changes don't affect other services
- **Data isolation**: Services cannot directly query each other's databases
- **Independent scaling**: Each service's DB can be extracted to dedicated RDS instance

## Unique Feature Implementations

### Trending Algorithm
```
trendingScore = (likes × 2) + (comments × 3) + (shares × 4) + views + recencyFactor
recencyFactor = 1 / (1 + hoursSincePosted * 0.1)
```
Score is recomputed on every interaction and stored in the `posts` table.

### Reading Time
```java
int wordCount = content.split("\\s+").length;
int readingTimeMinutes = (int) Math.ceil(wordCount / 200.0);
```
200 WPM is the average adult reading speed.

### Personalized Feed Algorithm
```sql
SELECT p.* FROM posts p
WHERE p.user_id IN (
    SELECT following_id FROM followers WHERE follower_id = :userId
)
ORDER BY 
    (p.like_count * 2 + p.comment_count * 3 + p.share_count * 4 + p.view_count) DESC,
    p.created_at DESC
LIMIT :size OFFSET :offset
```

## Scalability Considerations

| Concern | Current Solution | Future Enhancement |
|---|---|---|
| Search | MySQL LIKE queries | Elasticsearch |
| Notifications | REST polling | Kafka + WebSocket |
| Media | AWS S3 / MinIO | CDN (CloudFront) |
| Feed | DB query | Redis cache + fan-out |
| Auth | Stateless JWT | Rate limiting per user |

