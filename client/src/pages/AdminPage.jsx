import { Alert, Box, Button, Chip, Divider, Grid, IconButton, MenuItem, Paper, Stack, Switch, TextField, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import Container from "../components/common/Container";
import uiConfigs from "../configs/ui.configs";
import { routesGen } from "../routes/routes";
import reviewApi from "../api/modules/review.api";
import favoriteApi from "../api/modules/favorite.api";
import mediaApi from "../api/modules/media.api";
import adminUtils from "../utils/admin.utils";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

const adminMovieStorageKey = "cinecritic_admin_movies";

const emptyMovieForm = {
  title: "",
  mediaType: "movie",
  releaseYear: "",
  rating: "",
  posterUrl: "",
  overview: ""
};

const AdminPage = () => {
  const { user } = useSelector((state) => state.user);
  const [metrics, setMetrics] = useState({
    myReviews: 0,
    myFavorites: 0,
    movieResults: 0,
    tvResults: 0
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  const [authorities, setAuthorities] = useState([]);
  const [movieItems, setMovieItems] = useState([]);
  const [movieForm, setMovieForm] = useState(emptyMovieForm);
  const [editId, setEditId] = useState(null);

  const canCreateContent = authorities.includes("content:create");
  const canEditContent = authorities.includes("content:edit");
  const canDeleteContent = authorities.includes("content:delete");
  const canManageAuthorities = authorities.includes("admins:manage");

  useEffect(() => {
    if (!user?.username) return;
    setAuthorities(adminUtils.getAuthorities(user.username));
  }, [user]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(adminMovieStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setMovieItems(parsed);
      }
    } catch {
      setMovieItems([]);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const getMetrics = async () => {
      setMetricsLoading(true);

      const [reviewRes, favoriteRes, movieRes, tvRes] = await Promise.all([
        reviewApi.getList(),
        favoriteApi.getList(),
        mediaApi.getList({ mediaType: "movie", mediaCategory: "popular", page: 1 }),
        mediaApi.getList({ mediaType: "tv", mediaCategory: "popular", page: 1 })
      ]);

      setMetrics({
        myReviews: reviewRes.response?.length || 0,
        myFavorites: favoriteRes.response?.length || 0,
        movieResults: movieRes.response?.results?.length || 0,
        tvResults: tvRes.response?.results?.length || 0
      });

      setMetricsLoading(false);
    };

    getMetrics();
  }, [user]);

  const saveMovieItems = (nextItems) => {
    setMovieItems(nextItems);
    window.localStorage.setItem(adminMovieStorageKey, JSON.stringify(nextItems));
  };

  const onToggleAuthority = (authority) => {
    if (!canManageAuthorities || !user?.username) return;

    const nextAuthorities = authorities.includes(authority)
      ? authorities.filter((item) => item !== authority)
      : [...authorities, authority];

    setAuthorities(nextAuthorities);
    adminUtils.setAuthorities(user.username, nextAuthorities);
  };

  const onChangeMovieForm = (key, value) => {
    setMovieForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmitMovie = () => {
    const normalized = {
      ...movieForm,
      title: movieForm.title.trim(),
      mediaType: movieForm.mediaType,
      releaseYear: movieForm.releaseYear.toString().trim(),
      rating: movieForm.rating.toString().trim(),
      posterUrl: movieForm.posterUrl.trim(),
      overview: movieForm.overview.trim()
    };

    if (!normalized.title || !normalized.overview) return;
    if (!canCreateContent && !editId) return;
    if (!canEditContent && editId) return;

    if (editId) {
      const updated = movieItems.map((item) => item.id === editId
        ? { ...item, ...normalized, updatedAt: new Date().toISOString() }
        : item);
      saveMovieItems(updated);
      setEditId(null);
      setMovieForm(emptyMovieForm);
      return;
    }

    const nextItem = {
      id: Date.now().toString(),
      ...normalized,
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveMovieItems([nextItem, ...movieItems]);
    setMovieForm(emptyMovieForm);
  };

  const onEditMovie = (item) => {
    if (!canEditContent) return;

    setEditId(item.id);
    setMovieForm({
      title: item.title,
      mediaType: item.mediaType || "movie",
      releaseYear: item.releaseYear || "",
      rating: item.rating || "",
      posterUrl: item.posterUrl || "",
      overview: item.overview || ""
    });
  };

  const onDeleteMovie = (id) => {
    if (!canDeleteContent) return;
    saveMovieItems(movieItems.filter((item) => item.id !== id));
    if (editId === id) {
      setEditId(null);
      setMovieForm(emptyMovieForm);
    }
  };

  const onTogglePublishedMovie = (id) => {
    if (!canEditContent) return;
    const updated = movieItems.map((item) => item.id === id
      ? { ...item, published: !item.published, updatedAt: new Date().toISOString() }
      : item);
    saveMovieItems(updated);
  };

  const publishedMoviesCount = useMemo(
    () => movieItems.filter((item) => item.published).length,
    [movieItems]
  );

  return (
    <Box sx={{ ...uiConfigs.style.mainContent }}>
      <Container header="Admin">
        <Paper sx={{ padding: 3 }}>
          <Stack spacing={4}>
            <Typography variant="h5" fontWeight="700">
              Admin Dashboard
            </Typography>

            <Typography variant="body1">
              Welcome, {user?.displayName || user?.username}. This area is restricted to admin users.
            </Typography>

            <Grid container spacing={2}>
              {[
                { label: "My Reviews", value: metrics.myReviews },
                { label: "My Favorites", value: metrics.myFavorites },
                { label: "Popular Movies", value: metrics.movieResults },
                { label: "Popular TV", value: metrics.tvResults },
                { label: "Admin Movies", value: movieItems.length },
                { label: "Published Movies", value: publishedMoviesCount }
              ].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.label}>
                  <Paper variant="outlined" sx={{ padding: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="h5" fontWeight="700">
                      {metricsLoading ? "..." : item.value}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Divider />

            <Stack spacing={1}>
              <Typography variant="h6" fontWeight="700">Authorities</Typography>
              <Typography variant="body2" color="text.secondary">
                Enable or disable admin capabilities for your account.
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {adminUtils.defaultAuthorities.map((authority) => {
                  const enabled = authorities.includes(authority);

                  return (
                    <Chip
                      key={authority}
                      label={`${authority}${enabled ? " (enabled)" : ""}`}
                      color={enabled ? "primary" : "default"}
                      onClick={() => onToggleAuthority(authority)}
                      variant={enabled ? "filled" : "outlined"}
                      clickable={canManageAuthorities}
                    />
                  );
                })}
              </Stack>

              {!canManageAuthorities && (
                <Alert severity="info" sx={{ marginTop: 1 }}>
                  You can view authorities, but admins:manage is required to update them.
                </Alert>
              )}
            </Stack>

            <Divider />

            <Stack spacing={2}>
              <Typography variant="h6" fontWeight="700">Admin Movie Manager</Typography>
              <Typography variant="body2" color="text.secondary">
                Add movies or series that are managed by admins.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Movie/Series Title"
                    fullWidth
                    value={movieForm.title}
                    onChange={(e) => onChangeMovieForm("title", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Type"
                    select
                    fullWidth
                    value={movieForm.mediaType}
                    onChange={(e) => onChangeMovieForm("mediaType", e.target.value)}
                  >
                    <MenuItem value="movie">Movie</MenuItem>
                    <MenuItem value="tv">TV Series</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Release Year"
                    fullWidth
                    value={movieForm.releaseYear}
                    onChange={(e) => onChangeMovieForm("releaseYear", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Rating (e.g. 8.4)"
                    fullWidth
                    value={movieForm.rating}
                    onChange={(e) => onChangeMovieForm("rating", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Poster URL"
                    fullWidth
                    value={movieForm.posterUrl}
                    onChange={(e) => onChangeMovieForm("posterUrl", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Overview"
                    fullWidth
                    multiline
                    rows={3}
                    value={movieForm.overview}
                    onChange={(e) => onChangeMovieForm("overview", e.target.value)}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={onSubmitMovie}
                  disabled={editId ? !canEditContent : !canCreateContent}
                >
                  {editId ? "Save Changes" : "Add Movie"}
                </Button>
                {editId && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditId(null);
                      setMovieForm(emptyMovieForm);
                    }}
                  >
                    Cancel Edit
                  </Button>
                )}
              </Stack>

              {movieItems.length === 0 && (
                <Alert severity="info">No admin movies yet. Add your first movie above.</Alert>
              )}

              <Stack spacing={2}>
                {movieItems.map((item) => (
                  <Paper key={item.id} variant="outlined" sx={{ padding: 2 }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight="700">{item.title}</Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="caption" color="text.secondary">Published</Typography>
                          <Switch
                            checked={Boolean(item.published)}
                            onChange={() => onTogglePublishedMovie(item.id)}
                            disabled={!canEditContent}
                          />
                          <IconButton onClick={() => onEditMovie(item)} disabled={!canEditContent}>
                            <EditOutlinedIcon />
                          </IconButton>
                          <IconButton onClick={() => onDeleteMovie(item.id)} disabled={!canDeleteContent}>
                            <DeleteOutlineOutlinedIcon />
                          </IconButton>
                        </Stack>
                      </Stack>

                      <Stack direction="row" spacing={1}>
                        <Chip size="small" label={item.mediaType === "tv" ? "TV Series" : "Movie"} />
                        {item.releaseYear && <Chip size="small" label={`Year ${item.releaseYear}`} variant="outlined" />}
                        {item.rating && <Chip size="small" label={`Rating ${item.rating}`} variant="outlined" />}
                      </Stack>

                      {item.posterUrl ? (
                        <Box
                          sx={{
                            width: { xs: "100%", sm: "220px" },
                            height: "320px",
                            borderRadius: "8px",
                            backgroundColor: "background.default",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundImage: `url(${item.posterUrl})`
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: { xs: "100%", sm: "220px" },
                            height: "320px",
                            borderRadius: "8px",
                            border: "1px dashed",
                            borderColor: "divider",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">No poster</Typography>
                        </Box>
                      )}

                      <Typography variant="body2">{item.overview}</Typography>

                      <Typography variant="caption" color="text.secondary">
                        Updated: {dayjs(item.updatedAt).format("DD-MM-YYYY HH:mm")}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button variant="contained" component={Link} to={routesGen.reviewList}>
                Manage Reviews
              </Button>
              <Button variant="outlined" component={Link} to={routesGen.favoriteList}>
                User Favorites
              </Button>
              <Button variant="outlined" component={Link} to={routesGen.home}>
                Back to Home
              </Button>
            </Stack>

            <Typography variant="caption" color="text.secondary">
              Access is restricted to the Akshar_190 account.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminPage;
