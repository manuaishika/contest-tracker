const { google } = require('googleapis');
const Contest = require('../../models/Contest');
const Solution = require('../../models/Solution');

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

// Fetch videos from a specific playlist
const fetchPlaylistVideos = async (playlistId) => {
  try {
    const response = await youtube.playlistItems.list({
      part: 'snippet,contentDetails',
      playlistId,
      maxResults: 50
    });
    
    return response.data.items.map(item => ({
      title: item.snippet.title,
      videoId: item.contentDetails.videoId,
      publishedAt: new Date(item.snippet.publishedAt),
      url: `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`
    }));
  } catch (error) {
    console.error(`Error fetching playlist ${playlistId}:`, error.message);
    return [];
  }
};

// Match YouTube videos with contests
const matchVideosWithContests = async (videos, platform) => {
  const contests = await Contest.find({ platform });
  const matches = [];
  
  for (const video of videos) {
    for (const contest of contests) {
      // Check if video title contains contest name or ID
      // This is a simple matching strategy and may need refinement
      const titleLower = video.title.toLowerCase();
      const contestNameLower = contest.name.toLowerCase();
      const contestIdLower = contest.contestId.toLowerCase();
      
      if (titleLower.includes(contestNameLower) || titleLower.includes(contestIdLower)) {
        matches.push({
          contest,
          video
        });
        break;
      }
    }
  }
  
  return matches;
};
