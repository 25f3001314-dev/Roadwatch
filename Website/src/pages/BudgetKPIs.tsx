import React from 'react';

interface BudgetKPIsProps {
  totalBudget: number;
  totalSpent: number;
  activeVendors: number;
  pendingQueries: number;
}

export default function BudgetKPIs({
  totalBudget,
  totalSpent,
  activeVendors,
  pendingQueries,
}: BudgetKPIsProps) {
  const spentPercentage = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : '0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 tracking-wide uppercase">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900">₹{totalBudget} Cr</p>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">Allotted Funds</span>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 tracking-wide uppercase">Total Spent</p>
          <p className="text-2xl font-bold text-green-600">₹{totalSpent} Cr</p>
          <span className="text-xs text-green-600 font-medium">{spentPercentage}% Utilized</span>
        </div>
        <div className="p-3 bg-green-50 rounded-lg text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 tracking-wide uppercase">Active Vendors</p>
          <p className="text-2xl font-bold text-gray-900">{activeVendors}</p>
          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-medium">On-going Tenders</span>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500 tracking-wide uppercase">Public Queries</p>
          <p className={`text-2xl font-bold ${pendingQueries > 0 ? 'text-red-500' : 'text-gray-900'}`}>{pendingQueries}</p>
          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${pendingQueries > 0 ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
            {pendingQueries > 0 ? 'Requires Action' : 'All Clear'}
          </span>
        </div>
        <div className={`p-3 rounded-lg ${pendingQueries > 0 ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
