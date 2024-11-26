'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { ref, set } from 'firebase/database';

interface VoteSubmissionProps {
  unit: string;
  userRole: string;
}

export default function VoteSubmission({ unit, userRole }: VoteSubmissionProps) {
  const [maleVotes, setMaleVotes] = useState<number>(0);
  const [femaleVotes, setFemaleVotes] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const currentDate = new Date().toISOString().split('T')[0];
      const voteRef = ref(db, `votes/${unit}/${currentDate}`);
      
      await set(voteRef, {
        maleVotes: Number(maleVotes),
        femaleVotes: Number(femaleVotes),
        totalVotes: Number(maleVotes) + Number(femaleVotes),
        timestamp: new Date().toISOString(),
        submittedBy: userRole
      });

      setMessage('Votes submitted successfully!');
      setMaleVotes(0);
      setFemaleVotes(0);
    } catch (error) {
      setMessage('Error submitting votes. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Submit Votes - {unit}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Male Votes
          </label>
          <input
            type="number"
            min="0"
            value={maleVotes}
            onChange={(e) => setMaleVotes(parseInt(e.target.value) || 0)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Female Votes
          </label>
          <input
            type="number"
            min="0"
            value={femaleVotes}
            onChange={(e) => setFemaleVotes(parseInt(e.target.value) || 0)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Total Votes: {Number(maleVotes) + Number(femaleVotes)}
            </span>
          </div>
        </div>

        {message && (
          <div className={`text-sm ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Votes'}
        </button>
      </form>
    </div>
  );
}