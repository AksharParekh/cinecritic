import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { setAuthModalOpen } from "../../redux/features/authModalSlice";
import adminUtils from "../../utils/admin.utils";

const AdminProtectedPage = ({ children }) => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(setAuthModalOpen(!user));
  }, [user, dispatch]);

  if (!user) return null;
  if (!adminUtils.isAdminUser(user)) return <Navigate to="/" replace />;

  return children;
};

export default AdminProtectedPage;
