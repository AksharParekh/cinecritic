import { LoadingButton } from "@mui/lab";
import { Box, Button, Divider, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import Container from "./Container";
import reviewApi from "../../api/modules/review.api";
import TextAvatar from "./TextAvatar";

const ReviewItem = ({ review, onRemoved }) => {
  const { user } = useSelector((state) => state.user);

  const [onRequest, setOnRequest] = useState(false);

  const onRemove = async () => {
    if (onRequest) return;
    setOnRequest(true);

    const { response, err } = await reviewApi.remove({ reviewId: review.id });
    setOnRequest(false);

    if (err) toast.error(err.message);
    if (response) onRemoved(review.id);
  };

  return (
    <Box sx={{
      padding: { xs: 2, md: 2.5 },
      borderRadius: "14px",
      position: "relative",
      opacity: onRequest ? 0.6 : 1,
      border: "1px solid",
      borderColor: "divider",
      background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
      transition: "transform .2s ease, border-color .2s ease, background-color .2s ease",
      "&::before": {
        content: '""',
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: "4px",
        borderRadius: "14px 0 0 14px",
        backgroundColor: "primary.main",
        opacity: 0.8
      },
      "&:hover": {
        backgroundColor: "background.paper",
        borderColor: "primary.main",
        transform: "translateY(-2px)"
      }
    }}>
      <Stack direction="row" spacing={2}>
        {/* avatar */}
        <TextAvatar text={review.user?.displayName} />
        {/* avatar */}
        <Stack spacing={2} flexGrow={1}>
          <Stack spacing={0.8}>
            <Typography variant="h6" fontWeight="700">
              {review.user?.displayName}
            </Typography>
            <Stack direction="row" spacing={0.8} alignItems="center" color="text.secondary">
              <AccessTimeRoundedIcon sx={{ fontSize: "0.95rem" }} />
              <Typography variant="caption" letterSpacing="0.2px">
                {dayjs(review.createdAt).format("DD-MM-YYYY HH:mm:ss")}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1.2} alignItems="flex-start">
            <FormatQuoteRoundedIcon sx={{ color: "primary.main", mt: -0.3 }} />
            <Typography variant="body1" textAlign="justify" sx={{ lineHeight: 1.8 }}>
              {review.content}
            </Typography>
          </Stack>
          {user && user.id === review.user.id && (
            <LoadingButton
              variant="contained"
              startIcon={<DeleteIcon />}
              loadingPosition="start"
              loading={onRequest}
              onClick={onRemove}
              sx={{
                position: { xs: "relative", md: "absolute" },
                right: { xs: 0, md: "14px" },
                top: { xs: 0, md: "14px" },
                marginTop: { xs: 2, md: 0 },
                width: "max-content",
                borderRadius: "10px"
              }}
            >
              remove
            </LoadingButton>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

const MediaReview = ({ reviews, media, mediaType }) => {
  const { user } = useSelector((state) => state.user);
  const [listReviews, setListReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [onRequest, setOnRequest] = useState(false);
  const [content, setContent] = useState("");
  const [reviewCount, setReviewCount] = useState(0);

  const skip = 4;

  useEffect(() => {
    setListReviews([...reviews]);
    setFilteredReviews([...reviews].splice(0, skip));
    setReviewCount(reviews.length);
  }, [reviews]);

  const onAddReview = async () => {
    if (onRequest) return;
    if (!content.trim()) return toast.error("Review content can not be empty");
    setOnRequest(true);

    const body = {
      content,
      mediaId: media.id,
      mediaType,
      mediaTitle: media.title || media.name,
      mediaPoster: media.poster_path
    };

    const { response, err } = await reviewApi.add(body);

    setOnRequest(false);

    if (err) toast.error(err.message);
    if (response) {
      toast.success("Post review success");

      setListReviews((prev) => [response, ...prev]);
      setFilteredReviews((prev) => [response, ...prev]);
      setReviewCount(reviewCount + 1);
      setContent("");
    }
  };

  const onLoadMore = () => {
    setFilteredReviews([...filteredReviews, ...[...listReviews].splice(page * skip, skip)]);
    setPage(page + 1);
  };

  const onRemoved = (id) => {
    if (listReviews.findIndex(e => e.id === id) !== -1) {
      const newListReviews = [...listReviews].filter(e => e.id !== id);
      setListReviews(newListReviews);
      setFilteredReviews([...newListReviews].splice(0, page * skip));
    } else {
      setFilteredReviews([...filteredReviews].filter(e => e.id !== id));
    }

    setReviewCount(reviewCount - 1);

    toast.success("Remove review success");
  };

  return (
    <>
      <Container header={`Reviews (${reviewCount})`}>
        <Stack spacing={4} marginBottom={2}>
          {filteredReviews.map((item) => (
            item.user ? <Box key={item.id}>
              <ReviewItem review={item} onRemoved={onRemoved} />
              <Divider sx={{
                display: { xs: "block", md: "none" },
                marginTop: 2
              }} />
            </Box> : null
          ))}
          {filteredReviews.length < listReviews.length && (
            <Button
              onClick={onLoadMore}
              variant="outlined"
              sx={{
                borderRadius: "999px",
                width: "fit-content",
                alignSelf: "center",
                px: 3
              }}
            >
              load more
            </Button>
          )}
        </Stack>
        {user && (
          <>
            <Divider sx={{ mb: 2.5 }} />
            <Box sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "14px",
              p: { xs: 2, md: 2.5 },
              background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)"
            }}>
              <Stack direction="row" spacing={2}>
              <TextAvatar text={user.displayName} />
              <Stack spacing={2} flexGrow={1}>
                <Typography variant="h6" fontWeight="700">
                  Share your thoughts, {user.displayName}
                </Typography>
                <TextField
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  multiline
                  rows={4}
                  placeholder="Write your review"
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px"
                    }
                  }}
                />
                <LoadingButton
                  variant="contained"
                  size="large"
                  sx={{ width: "max-content", borderRadius: "10px", px: 3 }}
                  startIcon={<SendOutlinedIcon />}
                  loadingPosition="start"
                  loading={onRequest}
                  onClick={onAddReview}
                >
                  post
                </LoadingButton>
              </Stack>
              </Stack>
            </Box>
          </>
        )}
      </Container>
    </>
  );
};

export default MediaReview;