const { fetchCodeforcesContests } = require('./contestFetchers/codeforcesService');
const { fetchCodechefContests } = require('./contestFetchers/codechefService');
const { fetchLeetcodeContests } = require('./contestFetchers/leetcodeService');

const updateAllContests = async () => {
  try {
    const results = await Promise.allSettled([
      fetchCodeforcesContests(),
      fetchCodechefContests(),
      fetchLeetcodeContests()
    ]);

    const response = {
      codeforces: results[0].status === 'fulfilled' ? 'success' : 'failed',
      codechef: results[1].status === 'fulfilled' ? 'success' : 'failed',
      leetcode: results[2].status === 'fulfilled' ? 'success' : 'failed'
    };

    if (results.some(result => result.status === 'rejected')) {
      console.error('Some contest fetches failed:', 
        results
          .filter(result => result.status === 'rejected')
          .map(result => result.reason)
      );
    }

    return response;
  } catch (error) {
    console.error('Error updating contests:', error);
    throw error;
  }
};

// Schedule contest updates
const scheduleContestUpdates = (interval = 30 * 60 * 1000) => { // Default 30 minutes
  setInterval(async () => {
    try {
      await updateAllContests();
      console.log('Contests updated successfully');
    } catch (error) {
      console.error('Failed to update contests:', error);
    }
  }, interval);
};

module.exports = {
  updateAllContests,
  scheduleContestUpdates
}; 