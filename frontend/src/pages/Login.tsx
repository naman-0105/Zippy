import axios from "axios";
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useAppData } from "../context/AppContext";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { setUser, setIsAuth } = useAppData();

  const roleParam = searchParams.get("role");
  const targetRole =
    roleParam === "seller" || roleParam === "rider" || roleParam === "customer"
      ? roleParam
      : "customer";

  const getTitle = () => {
    if (targetRole === "seller") return "Restaurant Partner Login";
    if (targetRole === "rider") return "Rider Login";
    return "Login to Zippy";
  };

  const getSubtitle = () => {
    if (targetRole === "seller")
      return "Sign in to manage your restaurant, menu and orders.";
    if (targetRole === "rider")
      return "Sign in to start receiving delivery orders.";
    return "Log in or sign up to order your favorite food.";
  };

  const responseGoogle = async (authResult: any) => {
    setLoading(true);
    try {
      const result = await axios.post(`${authService}/api/auth/login`, {
        code: authResult["code"],
      });

      let loggedInUser = result.data.user;

      // If user has no role set yet, assign the target role without asking
      if (!loggedInUser.role) {
        try {
          const roleRes = await axios.put(
            `${authService}/api/auth/add/role`,
            { role: targetRole }
          );
          loggedInUser = roleRes.data.user;
        } catch (roleErr) {
          console.error("Failed to assign role:", roleErr);
        }
      }

      toast.success(result.data.message || "Logged in successfully");
      setUser(loggedInUser);
      setIsAuth(true);
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Problem while logging in");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: () => {
      toast.error("Google Login Failed");
    },
    flow: "auth-code",
  });

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xs sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            to="/"
            className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white shadow-xs"
          >
            Z
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {getTitle()}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{getSubtitle()}</p>
        </div>

        <button
          onClick={() => googleLogin()}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FcGoogle size={20} />
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        {targetRole !== "customer" && (
          <div className="mt-6 text-center text-xs">
            <Link
              to="/login?role=customer"
              className="font-medium text-slate-500 hover:text-indigo-600"
            >
              ← Back to customer login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
