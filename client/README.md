# Cinecritic (MERN-MOVIE)

Fronted (Client)

```env
REACT_APP_TMDB_FALLBACK=true
REACT_APP_TMDB_BASE_URL=https://api.themoviedb.org/3/
REACT_APP_TMDB_KEY=your_tmdb_v3_api_key
```

Notes:
- This fallback only applies to public endpoints (home, list, search, person, media detail public fields).
- Auth-required features still require backend (signin/signup, favorites, write/delete reviews, password update, admin metrics).