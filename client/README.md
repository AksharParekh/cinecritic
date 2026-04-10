# Cinecritic (MERN-MOVIE)

Fronted (Client)

## Optional: Public Data Fallback When Backend Is Down

You can let the client fetch public movie/person data directly from TMDB when your backend is unavailable.

Create `client/.env.local` with:

```env
REACT_APP_TMDB_FALLBACK=true
REACT_APP_TMDB_BASE_URL=https://api.themoviedb.org/3/
REACT_APP_TMDB_KEY=your_tmdb_v3_api_key
```

Notes:
- This fallback only applies to public endpoints (home, list, search, person, media detail public fields).
- Auth-required features still require backend (signin/signup, favorites, write/delete reviews, password update, admin metrics).