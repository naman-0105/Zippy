import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import RestaurantPartner from "./pages/RestaurantPartner";
import RiderPartner from "./pages/RiderPartner";
import ProtectedRoute from "./components/protectedRote";
import PublicRoute from "./components/publicRoute";
import Navbar from "./components/navbar";
import Account from "./pages/Account";
import { useAppData } from "./context/AppContext";
import Restaurant from "./pages/Restaurant";
import RestaurantPage from "./pages/RestaurantPage";
import Cart from "./pages/Cart";
import AddAddressPage from "./pages/Address";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import Orders from "./pages/Orders";
import OrderPage from "./pages/OrderPage";
import RiderDashboard from "./pages/RiderDashboard";
import Admin from "./pages/Admin";

const App = () => {
  const { user, isAuth, loading } = useAppData();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-semibold text-slate-500">Loading Zippy...</p>
      </div>
    );
  }

  if (user && user.role === "seller") {
    return <Restaurant />;
  }
  if (user && user.role === "rider") {
    return <RiderDashboard />;
  }
  if (user && user.role === "admin") {
    return <Admin />;
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public partner info routes */}
        <Route path="/restaurant" element={<RestaurantPartner />} />
        <Route path="/rider" element={<RiderPartner />} />

        {/* Public login route */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Root route: Landing page for public, Home page for authenticated customer */}
        <Route path="/" element={isAuth ? <Home /> : <Landing />} />

        {/* Protected customer routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/paymentsuccess/:paymentId"
            element={<PaymentSuccess />}
          />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order/:id" element={<OrderPage />} />
          <Route path="/address" element={<AddAddressPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
