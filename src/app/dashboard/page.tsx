'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { ref, set, get, onValue } from 'firebase/database';
import UnitBarChart from '@/components/charts/UnitBarChart';
import GenderPieChart from '@/components/charts/GenderPieChart';

// Constants
const VOTING_DATES = ['2024-12-04', '2024-12-05', '2024-12-06', '2024-12-10'];

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

interface ActivityLog {
  unit: string;
  submittedBy: string;
  maleVotes: number;
  femaleVotes: number;
  totalVotes: number;
  timestamp: string;
  date: string;
}

interface VotingData {
  [unit: string]: {
    [date: string]: {
      [timestamp: string]: {
        maleVotes: number;
        femaleVotes: number;
        totalVotes: number;
        submittedBy: string;
        timestamp: string;
      }
    }
  }
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeDate, setActiveDate] = useState<string>('');
  const [maleVotes, setMaleVotes] = useState<number>(0);
  const [femaleVotes, setFemaleVotes] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [votingData, setVotingData] = useState<VotingData>({});
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isVotingEnabled, setIsVotingEnabled] = useState<boolean>(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(userStr);
    setUser(userData);
    setSelectedUnit(userData.role === 'admin' ? 'all' : userData.unit);
  
    // Listen for voting enabled status
    const votingEnabledRef = ref(db, 'votingEnabled');
    const votingEnabledUnsubscribe = onValue(votingEnabledRef, (snapshot) => {
      setIsVotingEnabled(snapshot.val() || false);
    });
  
    // Listen for active date
    const activeDateRef = ref(db, 'activeDate');
    const activeDateUnsubscribe = onValue(activeDateRef, (snapshot) => {
      setActiveDate(snapshot.val() || '');
    });
  
    // Listen for voting data
    const votesRef = ref(db, 'votes');
    const votesUnsubscribe = onValue(votesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setVotingData(data);
  
      // Process activity logs
      const logs: ActivityLog[] = [];
      Object.entries(data).forEach(([unit, unitData]: [string, any]) => {
        if (unitData) {
          Object.entries(unitData).forEach(([date, dateData]: [string, any]) => {
            if (dateData) {
              if (typeof dateData === 'object') {
                const entries = Object.entries(dateData);
                entries.forEach(([timestamp, entry]: [string, any]) => {
                  if (entry && entry.timestamp) {
                    logs.push({
                      unit,
                      date,
                      ...entry
                    });
                  }
                });
              }
            }
          });
        }
      });
  
      // Sort logs by timestamp, most recent first
      logs.sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  
      setActivityLogs(logs);
    });
  
    return () => {
      activeDateUnsubscribe();
      votingEnabledUnsubscribe();
      votesUnsubscribe();
    };
  }, [router]);

  const calculateUnitStats = (unitName: string) => {
    const unitData = votingData[unitName] || {};
    let totalVotesCast = 0;
    let maleVotesCast = 0;
    let femaleVotesCast = 0;

    Object.values(unitData).forEach((dateData) => {
      Object.values(dateData).forEach((entry) => {
        totalVotesCast += entry.totalVotes || 0;
        maleVotesCast += entry.maleVotes || 0;
        femaleVotesCast += entry.femaleVotes || 0;
      });
    });

    return {
      totalVotesCast,
      maleVotesCast,
      femaleVotesCast,
      turnoutPercentage: ((totalVotesCast / UNIT_VOTERS[unitName]) * 100).toFixed(2)
    };
  };

  const calculateZonalStats = () => {
    let totalVotesCast = 0;
    let maleVotesCast = 0;
    let femaleVotesCast = 0;
    const totalVoters = Object.values(UNIT_VOTERS).reduce((a, b) => a + b, 0);

    Object.values(votingData).forEach((unitData) => {
      Object.values(unitData).forEach((dateData) => {
        Object.values(dateData).forEach((entry) => {
          totalVotesCast += entry.totalVotes || 0;
          maleVotesCast += entry.maleVotes || 0;
          femaleVotesCast += entry.femaleVotes || 0;
        });
      });
    });

    return {
      totalVotesCast,
      maleVotesCast,
      femaleVotesCast,
      turnoutPercentage: ((totalVotesCast / totalVoters) * 100).toFixed(2)
    };
  };

  const handleSystemReset = async () => {
    try {
      if (!window.confirm('WARNING: Are you sure you want to reset the entire system?')) {
        return;
      }
      if (!window.confirm('This will delete ALL voting data and cannot be undone. Are you really sure?')) {
        return;
      }
      if (!window.confirm('FINAL WARNING: All data will be permanently deleted. Proceed?')) {
        return;
      }

      setMessage('Resetting system...');

      // Reset each path in the database
      await Promise.all([
        set(ref(db, 'votes'), null),
        set(ref(db, 'activeDate'), null),
        set(ref(db, 'votingEnabled'), false)
      ]);

      // Clear local states
      setVotingData({});
      setActivityLogs([]);
      setActiveDate('');
      setIsVotingEnabled(false);
      
      setMessage('System reset successful');

    } catch (error) {
      console.error('Error resetting system:', error);
      setMessage('Error resetting system. Please try again.');
    }
  };

  const handleVotingToggle = async () => {
    try {
      await set(ref(db, 'votingEnabled'), !isVotingEnabled);
      setMessage(`Voting ${!isVotingEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling voting status:', error);
      setMessage('Error toggling voting status');
    }
  };

  const handleDateActivation = async (date: string) => {
    if (!user || user.role !== 'admin') return;

    try {
      await set(ref(db, 'activeDate'), date);
      setMessage(`Date ${date} activated successfully`);
    } catch (error) {
      console.error('Error activating date:', error);
      setMessage('Failed to activate date');
    }
  };

  const handleVoteSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDate || !isVotingEnabled) {
      setMessage('Voting is currently disabled');
      return;
    }
  
    if (!window.confirm('Are you sure you want to submit these votes?')) {
      return;
    }
  
    setIsSubmitting(true);
    try {
      const totalVotes = maleVotes + femaleVotes;
      
      // Create a safe timestamp key by removing special characters
      const timestamp = new Date().getTime().toString(); // Use numeric timestamp instead
      const submissionRef = ref(db, `votes/${user.unit}/${activeDate}/${timestamp}`);
  
      const voteData = {
        maleVotes,
        femaleVotes,
        totalVotes,
        submittedBy: user.username,
        timestamp: new Date().toISOString() // Keep ISO string for display purposes
      };
  
      await set(submissionRef, voteData);
      
      setMessage('Votes submitted successfully');
      setMaleVotes(0);
      setFemaleVotes(0);
    } catch (error: any) {
      console.error('Error submitting votes:', error);
      setMessage(error.message || 'Error submitting votes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const prepareChartData = () => {
    const unitData = Object.keys(UNIT_VOTERS).map(unit => {
      const stats = calculateUnitStats(unit);
      return {
        name: unit,
        totalVoters: UNIT_VOTERS[unit],
        votedCount: stats.totalVotesCast
      };
    });

    return { unitData };
  };

  if (!user) return null;

  const stats = selectedUnit === 'all' ? calculateZonalStats() : calculateUnitStats(selectedUnit);
  const chartData = prepareChartData();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Railway Voting System</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user.username} ({user.role})</span>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                router.push('/login');
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Admin Controls */}
        {user.role === 'admin' && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-4">Admin Controls</h3>
            <div className="flex gap-4">
              <button
                onClick={handleVotingToggle}
                className={`px-4 py-2 rounded ${
                  isVotingEnabled 
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isVotingEnabled ? 'Disable Voting' : 'Enable Voting'}
              </button>
              <button
                onClick={handleSystemReset}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Reset System
              </button>
            </div>
            {!isVotingEnabled && (
              <p className="mt-2 text-sm text-red-500">
                Note: Voting is currently disabled. Enable voting to allow submissions.
              </p>
            )}
            {message && (
              <p className={`mt-2 text-sm ${
                message.includes('Error') ? 'text-red-500' : 'text-green-500'
              }`}>
                {message}
              </p>
            )}
          </div>
        )}

        {/* Voting Dates */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-medium mb-2">Voting Dates:</h3>
          <div className="flex gap-2 flex-wrap">
            {VOTING_DATES.map(date => {
              const [year, month, day] = date.split('-');
              const formattedDate = `${day}/${month}/${year}`;
              return (
                <button
                  key={date}
                  onClick={() => user.role === 'admin' && handleDateActivation(date)}
                  disabled={user.role !== 'admin'}
                  className={`px-4 py-2 rounded ${
                    activeDate === date 
                      ? 'bg-green-500 text-white' 
                      : user.role === 'admin'
                      ? 'bg-gray-200 hover:bg-gray-300 cursor-pointer'
                      : 'bg-gray-200'
                  }`}
                >
                  {formattedDate}
                  {activeDate === date && ' (Active)'}
                </button>
              );
            })}
          </div>
          {!activeDate && (
            <p className="mt-2 text-sm text-amber-500">
              No active date selected
            </p>
          )}
        </div>

        {/* Unit Selection */}
        <div className="bg-white rounded-lg shadow p-4">
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full md:w-64 p-2 border rounded-md"
          >
            <option value="all">All Units (Zonal View)</option>
            {Object.keys(UNIT_VOTERS).map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-2">Total Voters</h3>
            <p className="text-3xl font-bold">
              {(selectedUnit === 'all' 
                ? Object.values(UNIT_VOTERS).reduce((a, b) => a + b, 0)
                : UNIT_VOTERS[selectedUnit]
              ).toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-2">Votes Cast</h3>
            <p className="text-3xl font-bold">{stats.totalVotesCast.toLocaleString()}</p>
            <p className="text-blue-600">{stats.turnoutPercentage}% Turnout</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-2">Gender Split</h3>
            <p>Male: {stats.maleVotesCast.toLocaleString()}</p>
            <p>Female: {stats.femaleVotesCast.toLocaleString()}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-4">Unit-wise Progress</h3>
            <UnitBarChart data={chartData.unitData} />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-4">Gender Distribution</h3>
            <GenderPieChart 
              maleVotes={stats.maleVotesCast}
              femaleVotes={stats.femaleVotesCast}
            />
          </div>
        </div>

        {/* Vote Submission Form (for PO/APO only) */}
        {user.role !== 'admin' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Submit Votes - {user.unit}</h2>
            {!activeDate ? (
              <p className="text-red-500">Waiting for admin to activate voting date</p>
            ) : !isVotingEnabled ? (
              <p className="text-red-500">Voting is currently disabled</p>
            ) : (
              <form onSubmit={handleVoteSubmission} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Male Votes</label>
                  <input
                    type="number"
                    value={maleVotes || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMaleVotes(val === '' ? 0 : parseInt(val));
                    }}
                    className="mt-1 block w-full border rounded-md shadow-sm p-2"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Female Votes</label>
                  <input
                    type="number"
                    value={femaleVotes || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFemaleVotes(val === '' ? 0 : parseInt(val));
                    }}
                    className="mt-1 block w-full border rounded-md shadow-sm p-2"
                    min="0"
                  />
                </div>

                <div className="text-sm text-gray-600">
                  Total Votes to Submit: {maleVotes + femaleVotes}
                </div>

                {message && (
                  <div className={`text-sm ${
                    message.includes('Error') || message.includes('Failed')
                      ? 'text-red-500'
                      : 'text-green-500'
                  }`}>
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-2 px-4 rounded ${
                    isSubmitting
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Votes'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Activity Log */}
<div className="bg-white rounded-lg shadow p-6">
  <h2 className="text-xl font-bold mb-4">Activity Log</h2>
  <div className="space-y-4 max-h-96 overflow-y-auto">
    {activityLogs.filter(log => log.timestamp).map((log, index) => {
      const timestamp = new Date(log.timestamp);
      let formattedDate = 'Invalid Date';
      
      try {
        formattedDate = new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).format(timestamp);
      } catch (error) {
        console.error('Date formatting error:', error);
      }
      
      return (
        <div 
          key={index} 
          className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{log.unit}</p>
              <p className="text-sm text-gray-600">
                Submitted by: {log.submittedBy}
              </p>
              <p className="text-sm text-gray-600">
                Votes - Male: {log.maleVotes}, Female: {log.femaleVotes}, 
                Total: {log.totalVotes}
              </p>
            </div>
            <span className="text-sm text-gray-500">
              {formattedDate}
            </span>
          </div>
        </div>
      );
    })}
    {activityLogs.length === 0 && (
      <p className="text-gray-500 text-center py-4">No activity yet</p>
    )}
  </div>
</div>
      </main>
    </div>
  );
}