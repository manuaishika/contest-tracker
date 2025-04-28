import React, { useContext, useState } from 'react';
import { BookmarkContext } from '../../contexts/BookmarkContext';
import CountdownTimer from './CountdownTimer';
import BookmarkButton from '../ui/BookmarkButton';
import SolutionLink from '../solutions/SolutionLink';
import { formatDate } from '../../utils/dateUtils';
import { getPlatformColor } from '../../utils/platformUtils';

const ContestCard = ({ contest, showSolution = false }) => {
  const { isBookmarked, addBookmark, removeBookmark, getBookmarkId } = useContext(BookmarkContext);
  const [loading, setLoading] = useState(false);
  
  const handleBookmarkToggle = async () => {
    try {
      setLoading(true);
      if (isBookmarked(contest._id)) {
        const bookmarkId = getBookmarkId(contest._id);
        await removeBookmark(bookmarkId);
      } else {
        await addBookmark(contest._id);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const isUpcoming = contest.startTime > now;
  const isOngoing = contest.startTime <= now && contest.endTime >= now;
  const isPast = contest.endTime < now;
  
  const statusClass = isUpcoming 
    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    : isOngoing 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  
  const platformColor = getPlatformColor(contest.platform);
  
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${platformColor}`}>
              {contest.platform}
            </span>
            <span className={`ml-2 inline-block px-2 py-1 text-xs font-semibold rounded-full ${statusClass}`}>
              {isUpcoming ? 'Upcoming' : isOngoing ? 'Ongoing' : 'Past'}
            </span>
          </div>
          <BookmarkButton 
            isBookmarked={isBookmarked(contest._id)} 
            onClick={handleBookmarkToggle}
            disabled={loading}
          />
        </div>
        
        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
          {contest.name}
        </h3>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>
            <span className="font-medium">Start:</span> {formatDate(contest.startTime)}
          </p>
          <p>
            <span className="font-medium">End:</span> {formatDate(contest.endTime)}
          </p>
          <p>
            <span className="font-medium">Duration:</span> {Math.round(contest.duration / 60)} hour(s)
          </p>
          
          {isUpcoming && (
            <div className="mt-3">
              <span className="font-medium">Starts in:</span>
              <CountdownTimer targetDate={contest.startTime} />
            </div>
          )}
          
          {isOngoing && (
            <div className="mt-3">
              <span className="font-medium">Ends in:</span>
              <CountdownTimer targetDate={contest.endTime} />
            </div>
          )}
        </div>
        
        <div className="mt-4 flex flex-col space-y-2">
          <a 
            href={contest.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            Go to Contest
          </a>
          
          {showSolution && isPast && (
            <SolutionLink contestId={contest._id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ContestCard;

// client/src/components/contests/ContestFilters.jsx
import React from 'react';

const ContestFilters = ({ filters, setFilters }) => {
  const handlePlatformChange = (platform) => {
    let platformFilters;
    
    if (filters.platform) {
      const currentPlatforms = filters.platform.split(',');
      
      if (currentPlatforms.includes(platform)) {
        // Remove platform if already selected
        platformFilters = currentPlatforms
          .filter(p => p !== platform)
          .join(',');
      } else {
        // Add platform if not selected
        platformFilters = [...currentPlatforms, platform].join(',');
      }
    } else {
      // No platforms selected yet
      platformFilters = platform;
    }
    
    // If empty, set to null/undefined to clear the filter
    setFilters(prev => ({
      ...prev,
      platform: platformFilters || undefined,
      page: 1 // Reset page when changing filters
    }));
  };
  
  const handleStatusChange = (status) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? undefined : status,
      page: 1 // Reset page when changing filters
    }));
  };
  
  const handleSearchChange = (e) => {
    const { value } = e.target;
    setFilters(prev => ({
      ...prev,
      search: value || undefined,
      page: 1 // Reset page when changing filters
    }));
  };
  
  const handleReset = () => {
    setFilters({});
  };
  
  const selectedPlatforms = filters.platform ? filters.platform.split(',') : [];
  
  return (
    <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filters</h2>
      
      <div className="space-y-4">
        {/* Platform filters */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Platforms</h3>
          <div className="flex flex-wrap gap-2">
            {['Codeforces', 'CodeChef', 'LeetCode'].map(platform => (
              <button
                key={platform}
                onClick={() => handlePlatformChange(platform)}
                className={`px-3 py-1.5 text-sm rounded-md transition
                  ${selectedPlatforms.includes(platform) 
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
        
        {/* Status filters */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Status</h3>
          <div className="flex flex-wrap gap-2">
            {['upcoming', 'ongoing', 'past'].map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-3 py-1.5 text-sm rounded-md capitalize transition
                  ${filters.status === status 
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        
        {/* Search filter */}
        <div>
          <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Search</h3>
          <input
            type="text"
            placeholder="Search contests..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {/* Reset button */}
        <div className="flex justify-end">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContestFilters;

// client/src/components/contests/ContestList.jsx
import React, { useEffect, useState } from 'react';
import ContestCard from './ContestCard';
import Loader from '../ui/Loader';
import { getContests } from '../../services/contestService';

const ContestList = ({ filters, showSolutions }) => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true);
        const response = await getContests({
          ...filters,
          limit: pagination.limit,
          page: filters.page || pagination.page
        });
        
        setContests(response.data);
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          pages: response.pagination.pages
        });
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch contests');
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, [filters, pagination.limit]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      filters.page = newPage;
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  if (loading && contests.length === 0) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500 dark:text-red-400">
        <p>Error: {error}</p>
        <button 
          onClick={() => setPagination(prev => ({ ...prev }))} // Trigger re-fetch
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (contests.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-gray-400">
        <p>No contests found matching your filters.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contests.map(contest => (
          <ContestCard 
            key={contest._id} 
            contest={contest} 
            showSolution={showSolutions}
          />
        ))}
      </div>
      
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-3 py-2 rounded-l-md border border-gray-300 dark:border-gray-700 text-sm font-medium
                ${pagination.page === 1 
                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
            >
              Previous
            </button>
            
            {[...Array(pagination.pages).keys()].map(i => {
              const page = i + 1;
              // Show first page, last page, current page, and pages around current
              if (
                page === 1 || 
                page === pagination.pages || 
                (page >= pagination.page - 1 && page <= pagination.page + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium
                      ${pagination.page === page 
                        ? 'bg-indigo-600 text-white dark:bg-indigo-700' 
                        : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                  >
                    {page}
                  </button>
                );
              }
              
              // Show ellipsis for skipped pages
              if (
                (page === 2 && pagination.page > 3) || 
                (page === pagination.pages - 1 && pagination.page < pagination.pages - 2)
              ) {
                return (
                  <span
                    key={page}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    ...
                  </span>
                );
              }
              
              return null;
            })}
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className={`px-3 py-2 rounded-r-md border border-gray-300 dark:border-gray-700 text-sm font-medium
                ${pagination.page === pagination.pages 
                  ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
      
      {loading && contests.length > 0 && (
        <div className="flex justify-center mt-6">
          <Loader size="small" />
        </div>
      )}
    </div>
  );
};

export default ContestList;

// client/src/components/contests/CountdownTimer.jsx
import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const formatTime = (value) => {
    return value < 10 ? `0${value}` : value;
  };

  if (Object.keys(timeLeft).length === 0) {
    return <span className="text-sm font-medium text-red-500 dark:text-red-400">Time's up!</span>;
  }

  return (
    <div className="mt-1 font-mono text-sm">
      {timeLeft.days > 0 && (
        <span className="font-medium">{timeLeft.days}d </span>
      )}
      <span className="font-medium">
        {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
      </span>
    </div>
  );
};

export default CountdownTimer;