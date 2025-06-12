const axios = require('axios');
const Contest = require('../../models/Contest');

const fetchCodeforcesContests = async () => {
  try {
    const response = await axios.get('https://codeforces.com/api/contest.list');
    
    if (response.data.status !== 'OK') {
      throw new Error('Failed to fetch Codeforces contests');
    }
    
    const contests = response.data.result
      .filter(contest => !contest.phase.includes('FINISHED'))
      .map(contest => ({
        name: contest.name,
        platform: 'Codeforces',
        url: `https://codeforces.com/contest/${contest.id}`,
        startTime: new Date(contest.startTimeSeconds * 1000),
        duration: contest.durationSeconds / 60, // Convert to minutes
        endTime: new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000),
        status: contest.phase,
        platformContestId: contest.id.toString()
      }));

    // Save contests to database
    for (const contest of contests) {
      await Contest.findOneAndUpdate(
        { platform: contest.platform, platformContestId: contest.platformContestId },
        contest,
        { upsert: true, new: true }
      );
    }

    return contests;
  } catch (error) {
    console.error('Error fetching Codeforces contests:', error.message);
    throw error;
  }
};

module.exports = { fetchCodeforcesContests }; 