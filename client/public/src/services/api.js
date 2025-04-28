// client/src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Generic fetch helper with error handling
export const fetchData = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

// client/src/services/contestService.js
import { fetchData } from './api';

/**
 * Fetch contests with filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} - Contests data with pagination
 */
export const getContests = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  const data = await fetchData(`/contests?${queryParams.toString()}`);
  return data;
};

/**
 * Get a contest by ID
 * @param {string} id - Contest ID
 * @returns {Promise<Object>} - Contest data
 */
export const getContest = async (id) => {
  const data = await fetchData(`/contests/${id}`);
  return data.data;
};

/**
 * Trigger manual fetch of contests from all platforms
 * @returns {Promise<Object>} - Results of the fetch operation
 */
export const triggerContestFetch = async () => {
  const data = await fetchData('/contests/fetch', {
    method: 'POST'
  });
  return data.data;
};

// client/src/services/bookmarkService.js
import { fetchData } from './api';

/**
 * Get user's bookmarks
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of bookmarks
 */
export const getUserBookmarks = async (userId) => {
  const data = await fetchData(`/bookmarks?userId=${userId}`);
  return data.data;
};

/**
 * Add a bookmark
 * @param {string} userId - User ID
 * @param {string} contestId - Contest ID
 * @returns {Promise<Object>} - New bookmark data
 */
export const addBookmark = async (userId, contestId) => {
  const data = await fetchData('/bookmarks', {
    method: 'POST',
    body: JSON.stringify({ userId, contestId })
  });
  return data.data;
};

/**
 * Remove a bookmark
 * @param {string} bookmarkId - Bookmark ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const removeBookmark = async (bookmarkId, userId) => {
  await fetchData(`/bookmarks/${bookmarkId}?userId=${userId}`, {
    method: 'DELETE'
  });
};

// client/src/services/solutionService.js  
import { fetchData } from './api';

/**
 * Get solution for a contest
 * @param {string} contestId - Contest ID
 * @returns {Promise<Object>} - Solution data
 */
export const getSolutionByContest = async (contestId) => {
  try {
    const data = await fetchData(`/solutions/contest/${contestId}`);
    return data.data;
  } catch (error) {
    if (error.message.includes('404')) {
      return null; // No solution found, which is okay
    }
    throw error;
  }
};

/**
 * Get all solutions with optional filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} - Solutions data with pagination
 */
export const getSolutions = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  const data = await fetchData(`/solutions?${queryParams.toString()}`);
  return data;
};

/**
 * Add a solution for a contest
 * @param {Object} solutionData - Solution data
 * @returns {Promise<Object>} - New solution data
 */
export const addSolution = async (solutionData) => {
  const data = await fetchData('/solutions', {
    method: 'POST',
    body: JSON.stringify(solutionData)
  });
  return data.data;
};

/**
 * Trigger automatic fetching of solutions from YouTube
 * @returns {Promise<Object>} - Results of the fetch operation
 */
export const triggerSolutionFetch = async () => {
  const data = await fetchData('/solutions/fetch', {
    method: 'POST'
  });
  return data.data;
};