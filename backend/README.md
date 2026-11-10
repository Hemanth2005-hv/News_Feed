# NewsFeed Backend — Spring Boot REST API

Spring Boot 3 + MySQL + JWT authentication for the NewsFeed app.

> **Status:** code is complete and ready to run. To start it you need **Java 21** (installed ✅),
> **Maven**, and **MySQL** (neither is installed yet — see setup below).

## Tech Stack

- **Java 21**
- **Spring Boot 3.3** (Spring Web, Data JPA, Security, Validation)
- **MySQL** (database)
- **JJWT** 0.12 (JSON Web Tokens)

## Project Structure

```
backend/
├── pom.xml
└── src/main/
    ├── java/com/newsfeed/
    │   ├── config/       → SecurityConfig, CorsConfig
    │   ├── controller/   → AuthController, ArticleController, CategoriesController, SavedArticleController
    │   ├── dto/          → request/response records (RegisterRequest, ArticleDto …)
    │   ├── entity/       → User, Article, SavedArticle (JPA tables)
    │   ├── exception/    → ApiException, ResourceNotFoundException, GlobalExceptionHandler
    │   ├── repository/   → Spring Data JPA interfaces
    │   ├── security/     → JwtService, JwtAuthFilter, CustomUserDetailsService
    │   └── service/      → AuthService, ArticleService, SavedArticleService
    └── resources/
        ├── application.yml
        └── data.sql      → seeds 12 sample articles (the frontend uses live news)
```

## Setup (do once)

1. **Install Maven** — https://maven.apache.org/download.cgi (or use IntelliJ/Eclipse, which bundle it).
2. **Install MySQL** — https://dev.mysql.com/downloads/installer/ and note the root password.
3. **Configure credentials** — edit `src/main/resources/application.yml`:
   - set `spring.datasource.username` and `spring.datasource.password` to your MySQL root credentials.
   - replace `app.jwt.secret` with your own long random string (min 32 chars).

> **About the database:** the `newsfeed` database was created manually on this
> machine (see `setup.sql`). On a fresh install, the app can also create it
> automatically on startup (`createDatabaseIfNotExist=true`). The `users`,
> `articles`, and `saved_articles` tables are always created by Hibernate on
> first startup. If auto-creation fails (e.g. your MySQL user lacks
> privileges), create it manually first:
>
> ```bash
> mysql -u root -p < setup.sql
> ```

4. **Run it** from the `backend/` folder:

   ```bash
   mvn spring-boot:run
   ```

   The API starts at **http://localhost:8080/api** and seeds 12 articles.

## REST API

| Method | Endpoint                  | Auth   | Description                          |
|--------|---------------------------|--------|--------------------------------------|
| POST   | `/api/auth/register`      | Public | Create account → returns JWT         |
| POST   | `/api/auth/login`         | Public | Login → returns JWT                  |
| GET    | `/api/articles`           | Public | All articles (newest first)          |
| GET    | `/api/articles?category=X`| Public | Filter by category                   |
| GET    | `/api/articles?q=text`    | Public | Search title/description/source      |
| GET    | `/api/articles/trending`  | Public | Top 10 by views                      |
| GET    | `/api/articles/{id}`      | Public | Single article                       |
| GET    | `/api/categories`         | Public | Distinct categories                  |
| GET    | `/api/saved`              | JWT    | Logged-in user's saved articles      |
| POST   | `/api/saved/{articleId}`  | JWT    | Save an article                      |
| DELETE | `/api/saved/{articleId}`  | JWT    | Unsave an article                    |

### Example — register

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"secret123"}'
```

Response (JWT returned — send it as `Authorization: Bearer <token>` for protected calls):

```json
{ "token": "eyJhbGci...", "name": "John", "email": "john@example.com" }
```

### Example — call a protected endpoint

```bash
curl http://localhost:8080/api/saved \
  -H "Authorization: Bearer <token>"
```

## Connecting the React frontend

The frontend already includes `src/services/api.js` (axios) pointed at this API.
When the backend is running:

1. Store the token from login/register as `newsfeed_token` in localStorage
   (the axios interceptor attaches it automatically).
2. Swap the `NewsContext` fetch and the mock auth calls for the `articleApi` / `authApi` / `savedApi` functions.

Full integration steps are the final phase of the project plan (Phases 8–9).
