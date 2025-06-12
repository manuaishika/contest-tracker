const axios = require('axios');
const Contest = require('../../models/Contest');

const fetchLeetcodeContests = async () => {
  try {
    const query = `
      query {
        allContests {
          title
          titleSlug
          startTime
          duration
          status
        }
      }
    `;

    const response = await axios.post('https://leetcode.com/graphql', {
      query,
      variables: {}
    });

    if (!response.data.data.allContests) {
      throw new Error('Failed to fetch LeetCode contests');
    }

    const contests = response.data.data.allContests
      .filter(contest => contest.status !== 'FINISHED')
      .map(contest => {
        const startTime = new Date(contest.startTime * 1000);
        return {
          name: contest.title,
          platform: 'LeetCode',
          url: `https://leetcode.com/contest/${contest.titleSlug}`,
          startTime,
          duration: contest.duration / 60, // Convert to minutes
          endTime: new Date(startTime.getTime() + contest.duration * 1000),
          status: contest.status,
          platformContestId: contest.titleSlug
        };
      });

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
    console.error('Error fetching LeetCode contests:', error.message);
    throw error;
  }
};

module.exports = { fetchLeetcodeContests }; 