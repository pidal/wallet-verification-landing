import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import SignMessage from './components/SignMessage';
import VerifySignature from './components/VerifySignature';

function App() {
  const [currentPage, setCurrentPage] = useState<'sign' | 'verify'>('sign');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Wallet Verification System</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentPage('sign')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'sign'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Sign Message
              </button>
              <button
                onClick={() => setCurrentPage('verify')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 'verify'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Verify Signature
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {currentPage === 'sign' ? <SignMessage /> : <VerifySignature />}
      </div>
    </div>
  );
}

export default App;