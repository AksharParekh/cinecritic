import { Box, Button, Chip, Stack, Toolbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import genreApi from "../api/modules/genre.api";
import mediaApi from "../api/modules/media.api";
import Container from "../components/common/Container";
import MediaGrid from "../components/common/MediaGrid";
import uiConfigs from "../configs/ui.configs";
import { routesGen } from "../routes/routes";

const mediaTypes = ["movie", "tv"];

const GenrePage = () => {
  const [mediaType, setMediaType] = useState(mediaTypes[0]);
  const [genres, setGenres] = useState([]);
  const [randomCatalogs, setRandomCatalogs] = useState({
    movie: { title: "", medias: [] },
    tv: { title: "", medias: [] }
  });

  useEffect(() => {
    const getGenres = async () => {
      const { response, err } = await genreApi.getList({ mediaType });

      if (err) return toast.error(err.message);
      setGenres(response?.genres || []);
    };

    getGenres();
  }, [mediaType]);

  useEffect(() => {
    const getRandomCatalog = async ({ type }) => {
      const { response: genreResponse, err: genreErr } = await genreApi.getList({ mediaType: type });

      if (genreErr) {
        toast.error(genreErr.message);
        return;
      }

      const genreList = genreResponse?.genres || [];
      const randomGenre = genreList[Math.floor(Math.random() * genreList.length)];

      if (randomGenre) {
        const { response, err } = await mediaApi.getByGenre({
          mediaType: type,
          genreId: randomGenre.id,
          page: 1
        });

        if (!err && response?.results?.length > 0) {
          setRandomCatalogs((prev) => ({
            ...prev,
            [type]: {
              title: `${randomGenre.name} ${type === "movie" ? "Movies" : "Series"}`,
              medias: response.results.slice(0, 8)
            }
          }));
          return;
        }
      }

      const { response: fallbackResponse, err: fallbackErr } = await mediaApi.getList({
        mediaType: type,
        mediaCategory: "popular",
        page: 1
      });

      if (fallbackErr) {
        toast.error(fallbackErr.message);
        return;
      }

      setRandomCatalogs((prev) => ({
        ...prev,
        [type]: {
          title: `Popular ${type === "movie" ? "Movies" : "Series"}`,
          medias: (fallbackResponse?.results || []).slice(0, 8)
        }
      }));
    };

    getRandomCatalog({ type: "movie" });
    getRandomCatalog({ type: "tv" });
  }, []);

  return (
    <>
      <Toolbar />
      <Box sx={{ ...uiConfigs.style.mainContent }}>
        <Container header="Browse Genres">
          <Stack spacing={3}>
            <Stack direction="row" spacing={1} justifyContent="center">
              {mediaTypes.map((type) => (
                <Button
                  key={type}
                  variant={mediaType === type ? "contained" : "text"}
                  sx={{
                    color: mediaType === type ? "primary.contrastText" : "text.primary"
                  }}
                  onClick={() => setMediaType(type)}
                >
                  {type}
                </Button>
              ))}
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="center">
              {genres.map((genre) => (
                <Chip
                  key={genre.id}
                  label={genre.name}
                  clickable
                  component={Link}
                  to={routesGen.genreCatalog(mediaType, genre.id)}
                  state={{ genreName: genre.name }}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6" fontWeight="700">
                {randomCatalogs.movie.title || "Random Movie Picks"}
              </Typography>
              <MediaGrid medias={randomCatalogs.movie.medias} mediaType="movie" />
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6" fontWeight="700">
                {randomCatalogs.tv.title || "Random Series Picks"}
              </Typography>
              <MediaGrid medias={randomCatalogs.tv.medias} mediaType="tv" />
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default GenrePage;
