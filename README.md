# Password Manager (Next.js + MongoDB)

A minimal password manager with secure authentication, AES-encrypted vault entries, and a simple UI.

## Project Structure

```
src/
  app/
    api/
      auth/
        login/route.ts
        logout/route.ts
        signup/route.ts
      passwords/
        route.ts
        [id]/route.ts
    dashboard/page.tsx
    login/page.tsx
    passwords/new/page.tsx
    page.tsx
  lib/
    auth.ts
    crypto.ts
    mongodb.ts
```

## Environment Variables

Create a `.env.local` file:

```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/password_manager
JWT_SECRET=replace-with-long-random-string
# 32 bytes (hex, base64, or 32-char utf8). Example hex:
ENCRYPTION_KEY=5d2f5b1f7b0f4a4e5d3b7c1d4f0e2b1a9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f
```

## Database Schema (MongoDB)

**users**
```
{
  _id: ObjectId,
  email: string,
  passwordHash: string,
  createdAt: Date
}
```

**passwords**
```
{
  _id: ObjectId,
  userId: ObjectId,
  title: string,
  username: string,
  url: string,
  passwordEncrypted: string,
  createdAt: Date,
  updatedAt: Date
}
```

## API Routes

### Auth
- `POST /api/auth/signup` — { email, password }
- `POST /api/auth/login` — { email, password }
- `POST /api/auth/logout`

### Password Vault
- `GET /api/passwords` — list entries (no plaintext password)
- `POST /api/passwords` — add entry
- `GET /api/passwords/:id` — decrypt and return a single entry
- `PUT /api/passwords/:id` — update entry
- `DELETE /api/passwords/:id` — delete entry

## Security Notes

- Passwords are hashed with bcrypt before storing.
- Vault passwords are encrypted with AES-256-GCM before storage.
- Decryption happens only on authenticated requests.
- Secrets are stored in environment variables (never in code).

## Running Locally

```
npm install
npm run dev
```

Visit http://localhost:3000
