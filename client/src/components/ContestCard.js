import React from 'react';

function ContestCard({ contest }) {
  return (
    <div className="contest-card">
      <div className="contest-info">
        <div className="contest-time">Starts in {contest.time}</div>
        <div className="contest-title">{contest.name}</div>
        <div className="contest-platform">{contest.platform}</div>
        <a href={contest.link} target="_blank" rel="noopener noreferrer" className="contest-btn">View Contest</a>
      </div>
      <div className="contest-logo">
        <img src={contest.logo} alt={contest.platform} />
      </div>
    </div>
  );
}

export default ContestCard; 