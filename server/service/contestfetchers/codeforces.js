const axios = require('axios');
const Contest = require('../../models/Contest');

const fetchCodeforcesContests = async () => {
  try {
    const response = await axios.get('https://codeforces.com/api/contest.list');
    
    if (response.data.status !== 'OK') {
      throw new Error('Failed to fetch Codeforces contests');
    }
    
    const contests = response.data.result.map(contest => ({
      name: contest.name,
      platform: 'Codeforces',
      url: `https://codeforces.com/contest/${contest.id}`,
      startTime: new Date(contest.startTimeSeconds * 1000),
      endTime: new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000),
      duration: contest.durationSeconds / 60, // Convert to minutes
      contestId: contest.id.toString(),
      uniqueId: `codeforces_${contest.id}`
    }));
    
    // Save contests to database
    for (const contest of contests) {
      await Contest.findOneAndUpdate(
        { uniqueId: contest.uniqueId },
        contest,
        { upsert: true, new: true }
      );
    }
    
    console.log(`Fetched ${contests.length} Codeforces contests`);
    return contests;
  } catch (error) {
    console.error('Error fetching Codeforces contests:', error.message);
    return [];
  }
};

module.exports = { fetchCodeforcesContests };

// server/services/contestFetchers/codechefService.js
const axios = require('axios');
const cheerio = require('cheerio');
const Contest = require('../../models/Contest');

const fetchCodechefContests = async () => {
  try {
    const response = await axios.get('https://www.codechef.com/contests');
    const $ = cheerio.load(response.data);
    const contests = [];
    
    // Process both present and future contests
    const tables = [
      { selector: '#present-contests-data', status: 'present' },
      { selector: '#future-contests-data', status: 'future' }
    ];
    
    for (const table of tables) {
      $(table.selector).find('tbody tr').each((i, el) => {
        const code = $(el).find('td:nth-child(1)').text().trim();
        const name = $(el).find('td:nth-child(2)').text().trim();
        const url = `https://www.codechef.com/${code}`;
        
        // Parse date and time
        const startTimeStr = $(el).find('td:nth-child(3)').text().trim();
        const endTimeStr = $(el).find('td:nth-child(4)').text().trim();
        
        const startTime = new Date(startTimeStr);
        const endTime = new Date(endTimeStr);
        const duration = (endTime - startTime) / (1000 * 60); // Convert to minutes
        
        contests.push({
          name,
          platform: 'CodeChef',
          url,
          startTime,
          endTime,
          duration,
          contestId: code,
          uniqueId: `codechef_${code}`
        });
      });
    }
    
    // Save contests to database
    for (const contest of contests) {
      await Contest.findOneAndUpdate(
        { uniqueId: contest.uniqueId },
        contest,
        { upsert: true, new: true }
      );
    }
    
    console.log(`Fetched ${contests.length} CodeChef contests`);
    return contests;
  } catch (error) {
    console.error('Error fetching CodeChef contests:', error.message);
    return [];
  }
};

module.exports = { fetchCodechefContests };

// server/services/contestFetchers/leetcodeService.js
const axios = require('axios');
const Contest = require('../../models/Contest');

const fetchLeetcodeContests = async () => {
  try {
    const query = `
      query {
        contestUpcomingContests {
          title
          titleSlug
          startTime
          duration
          cardImg
        }
        allContests {
          title
          titleSlug
          startTime
          duration
        }
      }
    `;
    
    const response = await axios.post('https://leetcode.com/graphql', {
      query
    });
    
    const upcomingContests = response.data.data.contestUpcomingContests || [];
    const allContests = response.data.data.allContests || [];
    
    // Combine and format contests
    const contests = [...upcomingContests, ...allContests].map(contest => {
      const startTime = new Date(contest.startTime * 1000);
      const endTime = new Date((contest.startTime + contest.duration) * 1000);
      
      return {
        name: contest.title,
        platform: 'LeetCode',
        url: `https://leetcode.com/contest/${contest.titleSlug}`,
        startTime,
        endTime,
        duration: contest.duration / 60, // Convert to minutes
        contestId: contest.titleSlug,
        uniqueId: `leetcode_${contest.titleSlug}`
      };
    });
    
    // Remove duplicates based on uniqueId
    const uniqueContests = contests.filter((contest, index, self) =>
      index === self.findIndex(c => c.uniqueId === contest.uniqueId)
    );
    
    // Save contests to database
    for (const contest of uniqueContests) {
      await Contest.findOneAndUpdate(
        { uniqueId: contest.uniqueId },
        contest,
        { upsert: true, new: true }
      );
    }
    
    console.log(`Fetched ${uniqueContests.length} LeetCode contests`);
    return uniqueContests;
  } catch (error) {
    console.error('Error fetching LeetCode contests:', error.message);
    return [];
  }
};

module.exports = { fetchLeetcodeContests };

// server/services/scheduledJobs/fetchContests.js
const cron = require('node-cron');
const { fetchCodeforcesContests } = require('../contestFetchers/codeforcesService');
const { fetchCodechefContests } = require('../contestFetchers/codechefService');
const { fetchLeetcodeContests } = require('../contestFetchers/leetcodeService');

// Schedule job to run every 6 hours
const fetchContestsJob = cron.schedule('0 */6 * * *', async () => {
  console.log('Running scheduled job to fetch contests');
  
  try {
    await Promise.all([
      fetchCodeforcesContests(),
      fetchCodechefContests(),
      fetchLeetcodeContests()
    ]);
    
    console.log('All contests fetched successfully');
  } catch (error) {
    console.error('Error in scheduled job:', error);
  }
});

// Initial fetch when server starts
const initialFetch = async () => {
  console.log('Performing initial contest fetch');
  
  try {
    await Promise.all([
      fetchCodeforcesContests(),
      fetchCodechefContests(),
      fetchLeetcodeContests()
    ]);
    
    console.log('Initial contest fetch completed');
  } catch (error) {
    console.error('Error in initial fetch:', error);
  }
};

initialFetch();

module.exports = fetchContestsJob;