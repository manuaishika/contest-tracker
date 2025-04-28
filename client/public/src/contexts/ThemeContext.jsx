import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has previously selected a theme
    const savedTheme = localStorage.getItem('theme');
    // Or use system preference if no saved preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme === 'dark' || (!savedTheme && prefersDark);
  });

  // Update theme when isDarkMode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// client/src/contexts/BookmarkContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { addBookmark, removeBookmark, getUserBookmarks } from '../services/bookmarkService';

export const BookmarkContext = createContext();

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Generate a pseudo user ID if none exists
  const getUserId = () => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }
    return userId;
  };

  const userId = getUserId();

  // Fetch user's bookmarks on initial load
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const data = await getUserBookmarks(userId);
        setBookmarks(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch bookmarks');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [userId]);

  // Add bookmark function
  const addUserBookmark = async (contestId) => {
    try {
      setLoading(true);
      const newBookmark = await addBookmark(userId, contestId);
      setBookmarks(prev => [...prev, newBookmark]);
      setError(null);
      return newBookmark;
    } catch (err) {
      setError(err.message || 'Failed to add bookmark');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove bookmark function
  const removeUserBookmark = async (bookmarkId) => {
    try {
      setLoading(true);
      await removeBookmark(bookmarkId, userId);
      setBookmarks(prev => prev.filter(bookmark => bookmark._id !== bookmarkId));
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to remove bookmark');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if a contest is bookmarked
  const isBookmarked = (contestId) => {
    return bookmarks.some(bookmark => bookmark.contestId._id === contestId);
  };

  // Get bookmark id for a contest
  const getBookmarkId = (contestId) => {
    const bookmark = bookmarks.find(bookmark => bookmark.contestId._id === contestId);
    return bookmark ? bookmark._id : null;
  };

  return (
    <BookmarkContext.Provider value={{
      bookmarks,
      loading,
      error,
      addBookmark: addUserBookmark,
      removeBookmark: removeUserBookmark,
      isBookmarked,
      getBookmarkId,
      userId
    }}>
      {children}
    </BookmarkContext.Provider>
  );
};