'use client';
import { useEffect } from 'react';

// Optional bridge page for Instagram bio links
export default function GoRedirect() {
  useEffect(() => {
    // Immediate redirect for Instagram webview
    window.location.replace('https://lumocreators.com/pl');
  }, []);
  
  const target = 'https://lumocreators.com/pl';
  
  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      padding: '2rem', 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#8D2D26' }}>
        Redirecting to Lumo Creators...
      </h1>
      <p style={{ color: '#666' }}>
        If you are not redirected automatically,{' '}
        <a href={target} style={{ color: '#8D2D26', textDecoration: 'underline' }}>
          click here
        </a>
        .
      </p>
    </div>
  );
}

