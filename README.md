# Space Surveyor

Space Surveyor is a retro-inspired space exploration and combat game. Pilot a survey ship across sectors, deliver survey data to end zones, fight off raiders, and manage fuel as you push deeper into more dangerous space.

## Features

- Sector-based exploration with dynamic difficulty zones.
- Arcade combat with enemy ships, asteroids, and gravity wells.
- Survey-driven score multiplier and reward flow.
- HUD with compass, minimap, fuel gauge, and score effects.
- Top-10 leaderboard backed by a PHP + MySQL API.

## Recent Updates

- Difficulty scaling is now ring-based: ring 0 has 1 red star, ring 1 has 1-2 red + 1-2 yellow, ring 2 has 2-3 red + 2-3 yellow + 1 blue, and ring 3+ scales linearly (red/yellow: ring..ring+1, blue: ring-2..ring-1).
- Ship bearings now use glowing chevron pairs for the nearest scan points, plus faint fuel bearings around the ship.
- Alerts now include a start-of-game prompt, scan completion refuels the tank and inserts "Fuel tanks refilled!" before the enemy alert.
- Fuel/score tuning: max fuel doubled, fuel pickups refill full tank (ratio 1.0), rotation no longer consumes fuel, and survey score doubled.
- Visual polish: deep space noir UI theme, parallax dust, star halos, particle bloom, engine heat shimmer, speed-based trail coloring, and subtle screen shake on impacts/surveys.

## Controls

- Movement: WASD or Arrow keys
- Fire: Space
- Zoom: Z (out), X (in)
- Quit when stranded: Q (when out of fuel)
- Return to start: Esc
- Start screen: Space to continue, Shift+Space to reset world

## Scoring

Scoring values live in `src/game/gameLoop.js` under `SCORE_POINTS`.

Earn points by destroying asteroids or enemies, collecting fuel, or delivering survey data to drop zones.

Multiplier:
- Each completed survey increases the multiplier by 1.
- The multiplier applies to combat and pickups after surveys (asteroids, enemies, fuel).

## Leaderboard Rules

The backend enforces:
- Scores are integers.
- Minimum qualifying score is 100.
- Top 10 only, sorted by score (desc), then newest first.
- Ties replace the existing 10th place entry.
- Names are uppercased, filtered to `[A-Z0-9_]`, max 12 characters.
- Profanity is filtered server-side (fallback to `ANON`).

The leaderboard is seeded with an initial top-10 list on first run.

## Project Structure

```
/
  index.html
  src/
    game/
    entities/
    ui/
  assets/
    ui/sprites/
    sounds/
  api/
    bootstrap.php
    score/index.php
    schema.sql
  .env.example
```

## Local Setup (PHP + MySQL)

### 1) Create `.env`

Copy `.env.example` to `.env` and fill in credentials:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=game_scores
DB_USER=game_user
DB_PASS=your_password_here
```

`.env` is ignored by git.

### 2) Create the database table

Run the SQL in `api/schema.sql` in your MySQL client or phpMyAdmin.

### 3) Run locally

From the project root:

```
php -S localhost:8000
```

Open:
- `http://localhost:8000/`
- `http://localhost:8000/api/score/` (API)

Note: some PHP setups require the trailing slash for directory index resolution.

## Deployment

- Run the build: `node tools/build.js`
- Upload: `dist/index.html` and `dist/game.js` (plus `assets/` only if assets changed)
- Do not upload: `src/` or `tools/` for code-only updates

## API Endpoints

- `GET /api/score`  
  Returns top 10 leaderboard entries.

- `POST /api/score`  
  Body: `{ "name": "AAA", "score": 1234 }`

## Deployment (cPanel + phpMyAdmin)

1) Upload `index.html`, `src/`, `assets/`, `api/`, and `.env` into `public_html/`.
2) Ensure PHP 7.2.5+ is enabled.
3) Run `api/schema.sql` in phpMyAdmin.
4) Confirm the API:
   - `https://yourdomain.com/api/score/`
5) Play the game:
   - `https://yourdomain.com/`

If your host uses DB name/user prefixes, update `.env` accordingly (e.g., `account_game_scores`, `account_game_user`).

## Notes

- The leaderboard is persisted in MySQL.
- The Node server is no longer used; PHP handles the API.
