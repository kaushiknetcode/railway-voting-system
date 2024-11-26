// src/components/VotingStats.tsx
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

const UNIT_VOTERS = {
  'Asansol Division': 17257,
  'Sealdah Division': 21038,
  'Howrah Division': 25224,
  'Malda Division': 9962,
  'Headquarter': 3296,
  'Kanchrapara Workshop': 7346,
  'Liluah Workshop': 6709,
  'Jamalpur Workshop': 6909
};

export default function VotingStats({ selectedUnit = 'all' }) {
  const [votingData, setVotingData] = useState<any>({});
  const [activeDate, setActiveDate] = useState<string>('');

  useEffect(() => {
    // Listen for active date
    const activeDateRef = ref(db, 'activeDate');
    onValue(activeDateRef, (snapshot) => {
      setActiveDate(snapshot.val() || '');
    });

    // Listen for voting data
    const votesRef = ref(db, 'votes');
    onValue(votesRef, (snapshot) => {
      setVotingData(snapshot.val() || {});
    });
  }, []);

  const calculateStats = () => {
    if (selectedUnit === 'all') {
      // Calculate zonal stats
      let totalVotesCast = 0;
      let maleVotesCast = 0;
      let femaleVotesCast = 0;
      const totalVoters = Object.values(UNIT_VOTERS).reduce((a: number, b: number) => a + b, 0);

      // Calculate votes from submitted data
      Object.values(votingData).forEach((unit: any) => {
        Object.values(unit).forEach((date: any) => {
          totalVotesCast += date.totalVotes || 0;
          maleVotesCast += date.maleVotes || 0;
          femaleVotesCast += date.femaleVotes || 0;
        });
      });

      return {
        totalVoters,
        votesCast: totalVotesCast,
        maleVotes: maleVotesCast,
        femaleVotes: femaleVotesCast,
        turnout: ((totalVotesCast / totalVoters) * 100).toFixed(2)
      };
    } else {
      // Calculate unit stats
      const unitData = votingData[selectedUnit] || {};
      const totalVoters = UNIT_VOTERS[selectedUnit];
      let totalVotesCast = 0;
      let maleVotesCast = 0;
      let femaleVotesCast = 0;

      Object.values(unitData).forEach((date: any) => {
        totalVotesCast += date.totalVotes || 0;
        maleVotesCast += date.maleVotes || 0;
        femaleVotesCast += date.femaleVotes || 0;
      });

      return {
        totalVoters,
        votesCast: totalVotesCast,
        maleVotes: maleVotesCast,
        femaleVotes: femaleVotesCast,
        turnout: ((totalVotesCast / totalVoters) * 100).toFixed(2)
      };
    }
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Total Voters and Turnout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Voters</h3>
          <p className="text-3xl font-bold">{stats.totalVoters.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Votes Cast</h3>
          <p className="text-3xl font-bold">{stats.votesCast.toLocaleString()}</p>
          <p className="text-lg text-blue-600 mt-2">{stats.turnout}% Turnout</p>
        </div>
      </div>

      {/* Vote Breakdown (only show if votes have been cast) */}
      {stats.votesCast > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Vote Breakdown</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Male Votes</p>
              <p className="text-xl font-bold">{stats.maleVotes.toLocaleString()}</p>
              <p className="text-sm text-blue-600">
                {((stats.maleVotes / stats.votesCast) * 100).toFixed(2)}% of total votes
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Female Votes</p>
              <p className="text-xl font-bold">{stats.femaleVotes.toLocaleString()}</p>
              <p className="text-sm text-blue-600">
                {((stats.femaleVotes / stats.votesCast) * 100).toFixed(2)}% of total votes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Voting Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-blue-600 h-4 rounded-full"
            style={{ width: `${stats.turnout}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {stats.votesCast.toLocaleString()} out of {stats.totalVoters.toLocaleString()} votes cast
        </p>
      </div>
    </div>
  );
}