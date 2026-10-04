import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import authService from "./services/authService/authService";
import { login, logout } from "./store/authSlice";

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const isReader = location.pathname.includes("/chapter/");
  
  useEffect(() => {
    const token = localStorage.getItem("deckle_token") || localStorage.getItem("deckle-token");

    if (!token) return;

    authService
      .getCurrentUser()
      .then((data) => {
        dispatch(login({ user: data.user, personas: data.personas }));
      })
      .catch(() => dispatch(logout()));
  }, [dispatch]);

  if (isReader) {
    return (
      <main className="min-h-screen w-full">
        <Outlet />
      </main>
    );
  }


  return (
    <div className="min-h-screen flex flex-col bg-page text-text-main transition-colors duration-200">
      <Header />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;
