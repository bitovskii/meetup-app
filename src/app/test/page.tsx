'use client';

import { useState } from 'react';

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
}

export default function TelegramTestPage() {
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [currentEncodedToken, setCurrentEncodedToken] = useState<string | null>(null);
  const [sessionResult, setSessionResult] = useState<string>('');
  const [statusResult, setStatusResult] = useState<string>('');
  const [showBotMessage, setShowBotMessage] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    id: 123456789,
    first_name: 'Test',
    last_name: 'User',
    username: 'testuser'
  });

  const createSession = async () => {
    try {
      const response = await fetch('/api/auth/session', { method: 'POST' });
      const data = await response.json();
      
      if (data.token) {
        setCurrentToken(data.token);
        const encoded = btoa(data.token);
        setCurrentEncodedToken(encoded);
        
        setSessionResult(`✅ Session created! Token: ${data.token.substring(0, 20)}... Status: ${data.status}`);
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      setSessionResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const simulateStart = () => {
    setShowBotMessage(true);
    setStatusResult('🔄 Waiting for user action in Telegram...');
  };

  const authorize = async () => {
    try {
      const response = await fetch('/api/test/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'authorize',
          token: currentToken,
          userData: userData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setStatusResult('✅ Authorization successful! Check status below.');
        setTimeout(checkStatus, 1000);
      } else {
        throw new Error(result.message || 'Authorization failed');
      }
    } catch (error) {
      setStatusResult(`❌ Authorization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const cancel = async () => {
    try {
      await fetch('/api/test/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          token: currentToken
        })
      });
      
      setStatusResult('❌ Authorization cancelled');
      setTimeout(checkStatus, 1000);
    } catch (error) {
      setStatusResult(`❌ Cancel error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const checkStatus = async () => {
    if (!currentToken) {
      setStatusResult('❌ No session token available');
      return;
    }

    try {
      const response = await fetch(`/api/auth/session?token=${currentToken}`);
      const data = await response.json();
      
      let statusMessage = `Status: ${data.status}`;
      
      if (data.status === 'authorized' && data.userData) {
        statusMessage += `
🎉 Authorization successful!
User: ${data.userData.first_name} ${data.userData.last_name || ''}
Username: @${data.userData.username || 'N/A'}
ID: ${data.userData.id}

Now go to the auth page to see the login work!`;
      } else if (data.status === 'cancelled') {
        statusMessage += ' ❌ Authorization was cancelled';
      } else if (data.status === 'pending') {
        statusMessage += ' ⏳ Still waiting for authorization...';
      }
      
      setStatusResult(statusMessage);
    } catch (error) {
      setStatusResult(`❌ Status check error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 Telegram Bot Authentication Test</h1>
          <p className="text-gray-600 mb-8">This tool simulates the complete Telegram bot authentication flow locally.</p>
          
          {/* Step 1 */}
          <div className="border-l-4 border-blue-500 pl-4 mb-8">
            <h3 className="text-xl font-semibold mb-4">Step 1: Create Auth Session</h3>
            <button 
              onClick={createSession}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Create New Auth Session
            </button>
            {sessionResult && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <pre className="text-sm text-blue-800">{sessionResult}</pre>
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div className="border-l-4 border-green-500 pl-4 mb-8">
            <h3 className="text-xl font-semibold mb-4">Step 2: Simulate Telegram Deep Link</h3>
            <p className="text-gray-600 mb-4">
              This would normally open: 
              <code className="bg-gray-100 px-2 py-1 rounded text-sm ml-2">
                {currentEncodedToken ? `https://t.me/meetup_auth_bot?start=${currentEncodedToken}` : 'Create session first'}
              </code>
            </p>
            <button 
              onClick={simulateStart}
              disabled={!currentToken}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg"
            >
              Simulate /start Command
            </button>
          </div>

          {/* Step 3 */}
          {showBotMessage && (
            <div className="border-l-4 border-yellow-500 pl-4 mb-8">
              <h3 className="text-xl font-semibold mb-4">Step 3: Telegram Bot Message Simulation</h3>
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
                <p className="font-semibold text-blue-900 mb-2">Telegram Bot says:</p>
                <p className="text-blue-800 mb-4">
                  Вы входите на сайт Meetup под учетной записью &quot;{userData.first_name} {userData.last_name}&quot;.
                  <br />
                  Чтобы продолжить авторизацию на сайте, нажмите на кнопку &quot;Авторизоваться&quot;.
                  <br />
                  Если вы не совершали никаких действий на сайте, или попали сюда в результате действий третьих лиц, нажмите на кнопку &quot;Отмена&quot;.
                </p>
                <div className="space-x-4">
                  <button 
                    onClick={authorize}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
                  >
                    ✅ Авторизоваться
                  </button>
                  <button 
                    onClick={cancel}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
                  >
                    ❌ Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 */}
          <div className="border-l-4 border-purple-500 pl-4 mb-8">
            <h3 className="text-xl font-semibold mb-4">Step 4: Check Authorization Status</h3>
            <button 
              onClick={checkStatus}
              disabled={!currentToken}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg"
            >
              Check Status
            </button>
            {statusResult && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <pre className="text-sm text-purple-800 whitespace-pre-wrap">{statusResult}</pre>
              </div>
            )}
          </div>

          {/* User Data */}
          <div className="border-l-4 border-gray-500 pl-4 mb-8">
            <h3 className="text-xl font-semibold mb-4">Test User Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={userData.first_name}
                onChange={(e) => setUserData(prev => ({ ...prev, first_name: e.target.value }))}
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={userData.last_name}
                onChange={(e) => setUserData(prev => ({ ...prev, last_name: e.target.value }))}
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
              <input
                type="text"
                placeholder="Username"
                value={userData.username}
                onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value }))}
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>

          {/* Links */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Test Links</h3>
            <div className="space-y-2">
              <p>
                <strong>Auth Page:</strong> 
                <a href="/auth" target="_blank" className="text-blue-600 hover:underline ml-2">
                  http://localhost:3000/auth
                </a>
              </p>
              <p>
                <strong>Home Page:</strong> 
                <a href="/" target="_blank" className="text-blue-600 hover:underline ml-2">
                  http://localhost:3000/
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}