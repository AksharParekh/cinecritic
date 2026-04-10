const localGenres = {
  movie: [
    { id: 28, name: "Action" },
    { id: 18, name: "Drama" },
    { id: 35, name: "Comedy" },
    { id: 878, name: "Sci-Fi" }
  ],
  tv: [
    { id: 18, name: "Drama" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 10765, name: "Sci-Fi & Fantasy" }
  ]
};

const localCatalog = {
  movie: {
    popular: [
      {
        id: 910001,
        title: "Local Frontiers",
        overview: "A rescue team crosses forbidden zones to recover a missing satellite core.",
        vote_average: 7.8,
        poster_path: "https://picsum.photos/seed/local-frontiers-p/500/750",
        backdrop_path: "https://picsum.photos/seed/local-frontiers-b/1280/720",
        genre_ids: [28, 878],
        release_date: "2025-03-14"
      },
      {
        id: 910002,
        title: "Night Shift Atlas",
        overview: "A city mapper discovers hidden routes that appear only after midnight.",
        vote_average: 7.4,
        poster_path: "https://picsum.photos/seed/night-shift-atlas-p/500/750",
        backdrop_path: "https://picsum.photos/seed/night-shift-atlas-b/1280/720",
        genre_ids: [18, 35],
        release_date: "2024-10-22"
      }
    ],
    top_rated: [
      {
        id: 910003,
        title: "Signal Over Water",
        overview: "Two rivals track a decades-old radio signal from a submerged town.",
        vote_average: 8.4,
        poster_path: "https://picsum.photos/seed/signal-over-water-p/500/750",
        backdrop_path: "https://picsum.photos/seed/signal-over-water-b/1280/720",
        genre_ids: [18, 878],
        release_date: "2022-06-09"
      },
      {
        id: 910004,
        title: "Neon Orchard",
        overview: "A farming collective grows luminous crops that attract corporate spies.",
        vote_average: 7.9,
        poster_path: "https://picsum.photos/seed/neon-orchard-p/500/750",
        backdrop_path: "https://picsum.photos/seed/neon-orchard-b/1280/720",
        genre_ids: [35, 18],
        release_date: "2024-04-30"
      }
    ]
  },
  tv: {
    popular: [
      {
        id: 920001,
        name: "Harbor Unit",
        overview: "A coastal task force handles emergencies no map admits exist.",
        vote_average: 7.5,
        poster_path: "https://picsum.photos/seed/harbor-unit-p/500/750",
        backdrop_path: "https://picsum.photos/seed/harbor-unit-b/1280/720",
        genre_ids: [80, 18],
        first_air_date: "2024-01-05"
      },
      {
        id: 920002,
        name: "Moonline Hotel",
        overview: "Staff at an orbital hotel solve guests' secrets between docking cycles.",
        vote_average: 7.3,
        poster_path: "https://picsum.photos/seed/moonline-hotel-p/500/750",
        backdrop_path: "https://picsum.photos/seed/moonline-hotel-b/1280/720",
        genre_ids: [10765, 35],
        first_air_date: "2025-02-01"
      }
    ],
    top_rated: [
      {
        id: 920003,
        name: "The Last Archive",
        overview: "A memory librarian protects erased histories from being permanently lost.",
        vote_average: 8.6,
        poster_path: "https://picsum.photos/seed/last-archive-p/500/750",
        backdrop_path: "https://picsum.photos/seed/last-archive-b/1280/720",
        genre_ids: [18, 80],
        first_air_date: "2021-03-03"
      },
      {
        id: 920004,
        name: "Glassline",
        overview: "A forensic architecture team reconstructs crimes from shattered structures.",
        vote_average: 8,
        poster_path: "https://picsum.photos/seed/glassline-p/500/750",
        backdrop_path: "https://picsum.photos/seed/glassline-b/1280/720",
        genre_ids: [80, 18],
        first_air_date: "2023-05-16"
      }
    ]
  }
};

const getLocalList = ({ mediaType, mediaCategory }) => {
  const typeCatalog = localCatalog[mediaType] || {};
  return typeCatalog[mediaCategory] || [];
};

const getLocalAll = ({ mediaType }) => {
  const typeCatalog = localCatalog[mediaType] || {};
  return [...(typeCatalog.popular || []), ...(typeCatalog.top_rated || [])];
};

const getLocalById = ({ mediaType, mediaId }) => {
  const targetId = Number(mediaId);
  return getLocalAll({ mediaType }).find((item) => item.id === targetId);
};

const searchLocal = ({ mediaType, query }) => {
  const normalized = (query || "").trim().toLowerCase();
  if (!normalized) return [];

  return getLocalAll({ mediaType }).filter((item) => {
    const text = (item.title || item.name || "").toLowerCase();
    return text.includes(normalized);
  });
};

export {
  localGenres,
  getLocalList,
  getLocalById,
  searchLocal,
  getLocalAll
};
