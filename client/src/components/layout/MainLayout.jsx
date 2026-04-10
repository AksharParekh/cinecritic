import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Footer from "../common/Footer";
import GlobalLoading from "../common/GlobalLoading";
import Topbar from "../common/Topbar";
import AuthModal from "../common/AuthModal";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { toast } from "react-toastify";
import userApi from "../../api/modules/user.api";
import favoriteApi from "../../api/modules/favorite.api";
import { setListFavorites, setUser } from "../../redux/features/userSlice";

const MainLayout = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    const authUser = async () => {
      const token = window.localStorage.getItem("actkn");

      // If there's no token, ensure user is cleared and skip API call
      if (!token) {
        dispatch(setUser(null));
        return;
      }

      const { response } = await userApi.getInfo();

      if (response) {
        dispatch(setUser(response));
        return;
      }

      // On error, explicitly remove stale token and clear user state so UI can't stay authenticated
      dispatch(setUser(null));
      try { window.localStorage.removeItem("actkn"); } catch {}
    };

    authUser();
  }, [dispatch]);

  useEffect(() => {
    const getFavorites = async () => {
      const { response, err } = await favoriteApi.getList();

      if (response) dispatch(setListFavorites(response));
      if (err) toast.error(err.message);
    };

    if (user) getFavorites();
    if (!user) dispatch(setListFavorites([]));
  }, [user, dispatch]);

  return (
    <>
      <GlobalLoading />

      {/* login modal */}
      <AuthModal />
      {/* login modal */}

      <Box display="flex" minHeight="100vh">
        {/* header */}
        <Topbar />
        {/* header */}

        {/* main */}
        <Box
          component="main"
          flexGrow={1}
          overflow="hidden"
          minHeight="100vh"
        >
          <Outlet />
        </Box>
        {/* main */}
      </Box>

      {/* footer */}
      <Footer />
      {/* footer */}
    </>
  );
};

export default MainLayout;