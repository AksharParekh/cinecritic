import { LoadingButton } from "@mui/lab";
import { Box, Stack, Toolbar } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import genreApi from "../api/modules/genre.api";
import mediaApi from "../api/modules/media.api";
import Container from "../components/common/Container";
import MediaGrid from "../components/common/MediaGrid";
import uiConfigs from "../configs/ui.configs";

const GenreCatalogPage = () => {
  const { mediaType, genreId } = useParams();
  const location = useLocation();

  const [genreName, setGenreName] = useState(location.state?.genreName || "Genre");
  const [medias, setMedias] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const getGenreName = async () => {
      if (location.state?.genreName) return;

      const { response, err } = await genreApi.getList({ mediaType });
      if (err) return;

      const found = (response?.genres || []).find((genre) => String(genre.id) === String(genreId));
      if (found?.name) setGenreName(found.name);
    };

    getGenreName();
  }, [location.state, mediaType, genreId]);

  useEffect(() => {
    setMedias([]);
    setPage(1);
  }, [mediaType, genreId]);

  useEffect(() => {
    const getCatalogByGenre = async () => {
      setLoading(true);

      const { response, err } = await mediaApi.getByGenre({ mediaType, genreId, page });

      setLoading(false);

      if (err) return toast.error(err.message);

      const results = response?.results || [];
      setHasMore(page < (response?.total_pages || 0));

      if (page > 1) setMedias((prev) => [...prev, ...results]);
      else setMedias(results);
    };

    if (["movie", "tv"].includes(mediaType)) {
      getCatalogByGenre();
    }
  }, [mediaType, genreId, page]);

  return (
    <>
      <Toolbar />
      <Box sx={{ ...uiConfigs.style.mainContent }}>
        <Container header={`${genreName} ${mediaType === "movie" ? "Movies" : "Series"}`}>
          <Stack spacing={3}>
            <MediaGrid medias={medias} mediaType={mediaType} />

            {hasMore && (
              <LoadingButton
                loading={loading}
                onClick={() => setPage((prev) => prev + 1)}
              >
                load more
              </LoadingButton>
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default GenreCatalogPage;
