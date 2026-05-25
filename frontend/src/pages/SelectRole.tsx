import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authService } from "../main";

type Role = "customer" | "rider" | "seller" | null;
const SelectRole = () => {
  const [role, setRole] = useState<Role>(null);
  const { setUser } = useAppData();
  const navigate = useNavigate();

  const roles: Role[] = ["customer", "rider", "seller"];

  const addRole = async () => {
    try {
      const { data } = await axios.put(
        `${authService}/api/auth/add/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      localStorage.setItem("token", data.token);
      setUser(data.user);

      navigate("/", { replace: true });
    } catch (error) {
      alert("something went wrong");
      console.log(error);
    }
  };
return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute -left-10 top-0 h-96 w-96 rounded-full bg-indigo-400/20 mix-blend-multiply blur-3xl filter"></div>
      <div className="absolute -right-10 top-0 h-96 w-96 rounded-full bg-violet-400/20 mix-blend-multiply blur-3xl filter"></div>
      <div className="absolute -bottom-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-400/20 mix-blend-multiply blur-3xl filter"></div>

      <div className="relative z-10 w-full max-w-sm rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-[0_8px_40px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-10">
        <h1 className="mb-8 text-center text-3xl font-extrabold tracking-tight text-slate-900">
          Choose your role
        </h1>

        <div className="space-y-4">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`w-full rounded-2xl border px-4 py-4 text-sm font-bold capitalize transition-all duration-200 ${
                role === r
                  ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 shadow-sm ring-1 ring-indigo-500"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-slate-50"
              }`}
            >
              Continue as {r}
            </button>
          ))}
        </div>

        <button
          disabled={!role}
          onClick={addRole}
          className={`mt-8 w-full rounded-2xl px-4 py-4 text-sm font-bold transition-all duration-200 ${
            role
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg"
              : "cursor-not-allowed bg-slate-100 text-slate-400 opacity-70"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SelectRole;
