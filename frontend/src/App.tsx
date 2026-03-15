import { useEffect } from 'react';

function App() {
  // Native URL params - NO ROUTER NEEDED
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  const handleLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}`;
  };

  useEffect(() => {
    if (code) {
      console.log("Code received:", code);
      exchangeCode(code);
    }
  }, [code]);

  const exchangeCode = async (code: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/github/callback', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),  // ✅ FIXED: Object!
      });

      if (!response.ok) {
        throw new Error(`HTTPerro`);
      }

      const data = await response.json();
      const { access_token, user } = data;
      
      console.log('✅ Token:', access_token?.slice(-10));
      console.log('✅ User:', user?.login);
      
      localStorage.setItem('github_token', access_token);
      
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
      
    } catch (error) {
      console.error('❌ Auth failed:', error);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      {!code ? (
        <button 
          onClick={handleLogin}
          style={{
            padding: '12px 24px',
            fontSize: 16,
            background: '#238636',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          Login with GitHub
        </button>
      ) : (
        <div style={{ color: 'green', fontSize: 18 }}>
          ✅ Authorized! Token stored.
        </div>
      )}
    </div>
  );
}

export default App;
