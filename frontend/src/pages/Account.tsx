import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import { BiLogOut, BiMapPin, BiPackage } from "react-icons/bi";

const Account = () => {
  const { user, setUser, setIsAuth } = useAppData();

  const firstLetter = user?.name.charAt(0).toUpperCase();

  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.setItem("token", "");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    toast.success("logout Success");
  };
  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900">My Account</h1>
      
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-5 border-b border-slate-100 bg-slate-50/50 p-6 sm:p-8">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 text-2xl font-extrabold text-white shadow-lg shadow-indigo-200">
            {firstLetter}
          </div>
          <div className="overflow-hidden">
            <h2 className="truncate text-xl font-extrabold text-slate-900">{user?.name}</h2>
            <p className="mt-1 truncate text-sm font-medium text-slate-500">{user?.email}</p>
          </div>
        </div>
        
        <div className="flex flex-col p-2 sm:p-4">
          <div
            className="group flex cursor-pointer items-center gap-4 rounded-2xl p-4 transition-all hover:bg-slate-50"
            onClick={() => navigate("/orders")}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-700">
              <BiPackage className="h-6 w-6" />
            </div>
            <span className="text-base font-bold text-slate-700 group-hover:text-slate-900">Your Orders</span>
          </div>
          
          <div
            className="group flex cursor-pointer items-center gap-4 rounded-2xl p-4 transition-all hover:bg-slate-50"
            onClick={() => navigate("/address")}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-700">
              <BiMapPin className="h-6 w-6" />
            </div>
            <span className="text-base font-bold text-slate-700 group-hover:text-slate-900">Addresses</span>
          </div>
          
          <div className="mx-4 my-2 border-t border-slate-100"></div>

          <div
            className="group flex cursor-pointer items-center gap-4 rounded-2xl p-4 transition-all hover:bg-rose-50"
            onClick={logoutHandler}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100 group-hover:text-rose-700">
              <BiLogOut className="h-6 w-6" />
            </div>
            <span className="text-base font-bold text-rose-600 group-hover:text-rose-700">Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
