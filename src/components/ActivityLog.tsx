'use client';

interface ActivityLogProps {
  logs: {
    unit: string;
    submittedBy: string;
    maleVotes: number;
    femaleVotes: number;
    totalVotes: number;
    timestamp: string;
    date: string;
  }[];
}

export default function ActivityLog({ logs }: ActivityLogProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Activity Log</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {logs.map((log, index) => {
          const timestamp = new Date(log.timestamp);
          const istTime = new Date(timestamp.getTime() + (5.5 * 60 * 60 * 1000));
          
          return (
            <div 
              key={index} 
              className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{log.unit}</p>
                  <p className="text-sm text-gray-600">
                    Submitted by: {log.submittedBy} | Date: {log.date}
                  </p>
                  <p className="text-sm text-gray-600">
                    Votes - Male: {log.maleVotes}, Female: {log.femaleVotes}, 
                    Total: {log.totalVotes}
                  </p>
                </div>
                <span className="text-sm text-gray-500">
                  {istTime.toLocaleString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
            </div>
          );
        })}
        {logs.length === 0 && (
          <p className="text-gray-500 text-center py-4">No activity yet</p>
        )}
      </div>
    </div>
  );
}