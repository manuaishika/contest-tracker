import React from 'react';
import ContestCard from '../components/ContestCard';
import './Home.css';

const contests = [
  {
    name: 'Codeforces Round #784 (Div. 2)',
    platform: 'Codeforces',
    time: '2d 12h',
    link: 'https://codeforces.com/contest/784',
    logo: 'https://sta.codeforces.com/s/11607/images/codeforces-logo-with-telegram.png',
  },
  {
    name: 'LeetCode Weekly Contest 300',
    platform: 'LeetCode',
    time: '5d 2h',
    link: 'https://leetcode.com/contest/weekly-contest-300',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png',
  },
  {
    name: 'CodeChef Starters 45',
    platform: 'CodeChef',
    time: '10d 18h',
    link: 'https://www.codechef.com/START45',
    logo: 'https://s3.amazonaws.com/codechef_shared/sites/all/themes/abessive/logo.svg',
  },
];

function Home() {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Contest Dashboard</h1>
      <p className="dashboard-subtitle">Your central hub for competitive programming. Track upcoming contests, monitor ongoing competitions, and analyze your performance across various platforms.</p>
      <h2 className="section-title">Upcoming Contests</h2>
      <div className="contest-list">
        {contests.map((contest, idx) => (
          <ContestCard contest={contest} key={idx} />
        ))}
      </div>
      <h2 className="section-title">Performance Overview</h2>
      <div className="performance-overview">
        <div className="performance-card">
          <div className="performance-title">Contest History</div>
          <div className="performance-value">1200</div>
          <div className="performance-desc">Last 6 Months <span className="positive">+5%</span></div>
          <div className="performance-chart">(chart placeholder)</div>
        </div>
        <div className="performance-card">
          <div className="performance-title">Platform Performance</div>
          <div className="performance-value">85%</div>
          <div className="performance-desc">All Time <span className="positive">+10%</span></div>
          <div className="performance-bars">
            <div>Codeforces</div>
            <div>LeetCode</div>
            <div>CodeChef</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;