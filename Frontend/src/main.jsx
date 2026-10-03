import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/500.css";
import "@fontsource/newsreader/600.css";
import "@fontsource/newsreader/400-italic.css";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from 'react-redux';
import store from './store/store.js';
import AuthPage from './pages/AuthPage.jsx';
import HomePage from "./pages/HomePage.jsx";
import BookDetailsPage from "./pages/BookDetailsPage.jsx";
import ReaderPage from "./pages/ReaderPage.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import RankingsPage from "./pages/RankingsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import CommunityPage from "./pages/CommunityPage.jsx";
import AuthorStudioPage from "./pages/AuthorStudioPage.jsx";

// Router Object Configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'book/:slug',
        element: <BookDetailsPage />,
      },
      {
        path: 'book/:slug/chapter/:chapterNum',
        element: <ReaderPage />,
      },
      {
        path: 'library',
        element: <LibraryPage />,
      },
      {
        path: 'rankings',
        element: <RankingsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'settings',
        element: <ProfilePage />,
      },
      {
        path: 'community',
        element: <CommunityPage />,
      },
      {
        path: 'studio',
        element: <AuthorStudioPage />,
      },
    ]
  },
  {
    path: '/login',
    element: <AuthPage />
  },
  {
    path: '/auth',
    element: <AuthPage />
  }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
