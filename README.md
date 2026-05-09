# Maritime Operations & Compliance API

Backend for a maritime operations platform used to manage vessel maintenance, safety drills, crew participation, and compliance risk.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env`:
   ```env
   PORT=5000
   DATABASE_URL=mongodb://localhost:27017/maritime
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   ACCESS_SECRET=replace_with_strong_secret
   REFRESH_TOKEN_SECRET=replace_with_strong_refresh_secret
   ```
3. Start MongoDB locally.
4. Start the API:
   ```bash
   npm run dev
   ```
5. Health check:
   ```bash
   GET http://localhost:5000/health
   ```

## Default Admin Bootstrap

The server creates one `superAdmin` if it does not exist:

- Email: `janu@gmail.com`
- Password: `Password@1`

Use this account only to create `admin` users. Operational work belongs to `admin` and `crew`.

## Architecture Decisions

- Express + TypeScript with controller, service, route, model, and validation layers.
- MongoDB/Mongoose models for ships, users, maintenance tasks, and safety drills.
- Zod request validation at route boundaries.
- httpOnly cookie authentication for access and refresh tokens.
- Role-based access control:
  - `superAdmin`: creates admins only.
  - `admin`: manages ships, crew, maintenance, drills, and compliance.
  - `crew`: views assigned tasks/drills and submits updates.
- Compliance is calculated from completed maintenance and drill participant completion, with overdue and late work highlighted as risk.

## Documentation

- Business flow: `docs/BUSINESS_FLOW.md`
- Validation and access matrix: `docs/VALIDATION_MATRIX.md`
