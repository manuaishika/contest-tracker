const axios = require('axios');
const cheerio = require('cheerio');
const Contest = require('../../models/Contest');

const fetchCodechefContests = async () => {
  try {
    const response = await axios.get('https://www.codechef.com/api/list/contests/all');
    
    if (!response.data.future_contests && !response.data.present_contests) {
      throw new Error('Failed to fetch CodeChef contests');
    }
    
    const allContests = [
      ...response.data.future_contests || [],
      ...response.data.present_contests || []
    ];

    const contests = allContests.map(contest => ({
      name: contest.contest_name,
      platform: 'CodeChef',
      url: `https://www.codechef.com/${contest.contest_code}`,
      startTime: new Date(contest.contest_start_date),
      endTime: new Date(contest.contest_end_date),
      duration: (new Date(contest.contest_end_date) - new Date(contest.contest_start_date)) / (1000 * 60),
      status: new Date() < new Date(contest.contest_start_date) ? 'UPCOMING' : 'RUNNING',
      platformContestId: contest.contest_code
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
    console.error('Error fetching CodeChef contests:', error.message);
    throw error;
  }
};

module.exports = { fetchCodechefContests }; 