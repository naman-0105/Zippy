import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { useAppData } from "../context/AppContext";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {setUser, setIsAuth} = useAppData();

  const responseGoogle = async (authResult: any) => {
    setLoading(true);
    try {
      const result = await axios.post(`${authService}/api/auth/login`, {
        code: authResult["code"],
      });

      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message);
      setLoading(false);
      setUser(result.data.user);
      setIsAuth(true);
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Problem while login");
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
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute -left-10 top-0 h-96 w-96 rounded-full bg-indigo-400/20 mix-blend-multiply blur-3xl filter"></div>
      <div className="absolute -right-10 top-0 h-96 w-96 rounded-full bg-violet-400/20 mix-blend-multiply blur-3xl filter"></div>
      <div className="absolute -bottom-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-400/20 mix-blend-multiply blur-3xl filter"></div>

      <div className="relative z-10 w-full max-w-md rounded-4xl border border-white/60 bg-white/70 p-8 shadow-[0_8px_40px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-10">
        
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-violet-500 shadow-lg shadow-indigo-200">
            <span className="text-3xl font-bold text-white">Z</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Zippy
          </h1>
          <p className="mt-2 text-center text-sm font-medium text-slate-500">
            Log in or sign up to continue
          </p>
        </div>

        <button
          onClick={googleLogin}
          disabled={loading}
          className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 ease-in-out hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FcGoogle 
            size={22} 
            className="transition-transform duration-200 group-hover:scale-110" 
          />
          {loading ? "Signing in ..." : "Continue with Google"}
        </button>

        <div className="mt-8 text-center text-xs leading-relaxed text-slate-400">
          By continuing, you agree with our{" "}
          <span className="cursor-pointer font-semibold text-indigo-600 transition-colors hover:text-indigo-500 hover:underline">
            Terms of Service
          </span>{" "}
          &{" "}
          <span className="cursor-pointer font-semibold text-indigo-600 transition-colors hover:text-indigo-500 hover:underline">
            Privacy Policy
          </span>
        </div>

      </div>
    </div>
  );
};

export default Login;
