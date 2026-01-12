# role-based-access-dashboard-304334-304343

## Backend (Express) environment variables

The backend supports JWT authentication and role-based access control.

Required / recommended env vars:

- `JWT_SECRET` (recommended): Secret used to sign/verify JWTs.
  - If not set, the backend uses a **dev-only fallback** (`dev_only_change_me`). Do not rely on this in production.
- `DATABASE_URL` (preferred) or `POSTGRES_URL`: PostgreSQL connection string for `pg`.
  - If not provided, the backend will *attempt* to read a local/dev URL from:
    `role-based-access-dashboard-304334-304345/database_postgres/db_connection.txt`
- `FRONTEND_ORIGIN` (optional): If set, allowed CORS origin for the React app. Defaults allow `http://localhost:3000`.

## Endpoints

- `POST /api/auth/register` `{ email, password }`
- `POST /api/auth/login` `{ email, password }` -> `{ token, user }`
- `POST /api/auth/logout` (stateless JWT: no-op, client deletes token)
- `GET /api/auth/me` (requires `Authorization: Bearer <token>`)
- `GET /api/dashboard/admin` (requires `admin` role)
- `GET /api/dashboard/user` (requires `user` role)

Swagger docs: `/docs`

```bash
# Example login
curl -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"password123"}'
```

```bash
# Example calling a protected route
curl http://localhost:3001/api/dashboard/admin \
  -H "Authorization: Bearer <TOKEN>"
```

