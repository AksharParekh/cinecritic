const envConfig = {
  tmdbBaseUrl: process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3/",
  tmdbKey: process.env.TMDB_KEY || "",
  tmdbAccessToken: process.env.TMDB_ACCESS_TOKEN || ""
};

envConfig.hasTmdbCredentials = Boolean(envConfig.tmdbKey || envConfig.tmdbAccessToken);

export default envConfig;
