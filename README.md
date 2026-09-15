# CodeMentor AI

CodeMentor AI is a React learning workspace backed by Spring Boot. It explains Java and DSA prompts through an OpenAI-powered chat flow and saves completed responses in conversation history.

## Run locally

1. Install Java 17 and Node.js 20 or newer.
2. Set an OpenAI API key in the terminal that will run the backend:

   ```powershell
   $env:OPENAI_API_KEY = "your-key"
   ```

3. Start the backend:

   ```powershell
   cd backend
   .\mvnw.cmd spring-boot:run
   ```

4. In a second terminal, start the frontend:

   ```powershell
   npm.cmd install
   npm.cmd run dev
   ```

Open `http://localhost:5173`. The API runs at `http://localhost:8080`; Swagger is at `/swagger-ui.html` and the local H2 console is at `/h2-console`.

The default database is a persistent local H2 file under `backend/data`. To use PostgreSQL, set `SPRING_PROFILES_ACTIVE=postgres` plus `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD` before starting the backend.

## API endpoints

- `POST /api/chat` — sends `{ "prompt": "..." }` and saves a conversation after a successful AI response.
- `GET /api/history`, `GET /api/history/search?keyword=...`
- `PATCH /api/history/{id}/pin`, `PATCH /api/history/{id}/rename`
- `DELETE /api/history/{id}`
- `POST /api/auth/register`, `POST /api/auth/login`

For local UI development, chat and history endpoints are available without a token because the current UI has no sign-in screen. Set `SECURITY_REQUIRE_AUTH=true` only after adding JWT handling in the frontend.
