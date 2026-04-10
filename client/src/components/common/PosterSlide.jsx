import { Box } from "@mui/material";
import { SwiperSlide } from "swiper/react";
import tmdbConfigs from "../../api/configs/tmdb.configs";
import AutoSwiper from "./AutoSwiper";

const PosterSlide = ({ posters }) => {
  const uniquePosters = [...new Map(
    (posters || [])
      .filter((item) => item?.file_path)
      .map((item) => [item.file_path, item])
  ).values()].slice(0, 10);

  const emptySlots = Math.max(0, 10 - uniquePosters.length);

  return (
    <AutoSwiper>
      {uniquePosters.map((item, index) => (
        <SwiperSlide key={`poster-${item.file_path}-${index}`}>
          <Box sx={{
            paddingTop: "160%",
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundImage: `url(${tmdbConfigs.posterPath(item.file_path)})`
          }} />
        </SwiperSlide>
      ))}

      {Array.from({ length: emptySlots }).map((_, index) => (
        <SwiperSlide key={`poster-empty-${index}`}>
          <Box sx={{
            paddingTop: "160%",
            backgroundColor: "transparent"
          }} />
        </SwiperSlide>
      ))}
    </AutoSwiper>
  );
};

export default PosterSlide;