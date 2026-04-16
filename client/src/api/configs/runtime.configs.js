const contentApiBaseUrl = process.env.REACT_APP_CONTENT_API_BASE_URL || "https://bertflix-api.vercel.app/api/v1/";

const runtimeConfigs = {
  contentApiBaseUrl,
  authApiBaseUrl: process.env.REACT_APP_AUTH_API_BASE_URL || contentApiBaseUrl,
  localSyncApiBaseUrl: process.env.REACT_APP_LOCAL_SYNC_API_BASE_URL || "http://localhost:5000/api/v1/",
  tmdbBaseUrl: process.env.REACT_APP_TMDB_BASE_URL || "https://api.themoviedb.org/3/",
  tmdbKey: process.env.REACT_APP_TMDB_KEY || "",
  tmdbFallbackEnabled:
    (process.env.REACT_APP_TMDB_FALLBACK || "false") === "true" &&
    Boolean(process.env.REACT_APP_TMDB_KEY)
};

export default runtimeConfigs;