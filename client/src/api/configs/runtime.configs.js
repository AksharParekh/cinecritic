const runtimeConfigs = {
  tmdbBaseUrl: process.env.REACT_APP_TMDB_BASE_URL || "https://api.themoviedb.org/3/",
  tmdbKey: process.env.REACT_APP_TMDB_KEY || "",
  tmdbFallbackEnabled:
    (process.env.REACT_APP_TMDB_FALLBACK || "false") === "true" &&
    Boolean(process.env.REACT_APP_TMDB_KEY)
};

export default runtimeConfigs;