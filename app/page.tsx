'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { sdk } from '@farcaster/frame-sdk';

interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  bio: string;
  followerCount: number;
  followingCount: number;
}

export default function WarpRoulette() {
  const [currentUser, setCurrentUser] = useState<FarcasterUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  // Initialize Farcaster Frame SDK
  useEffect(() => {
    const initFrame = async () => {
      try {
        const context = await sdk.context;
        console.log('Frame context:', context);
        sdk.actions.ready();
      } catch (error) {
        console.error('Frame SDK initialization error:', error);
      }
    };

    initFrame();
  }, []);

  // Sound effects
  const playSound = (type: 'spin' | 'reveal') => {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'spin') {
      // Spin sound: ascending tone
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else {
      // Reveal sound: pleasant notification
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    }
  };

  const getRandomUser = async () => {
    setLoading(true);
    setIsSpinning(true);
    
    // Hide current user immediately when spinning
    if (currentUser) {
      setCurrentUser(null);
    }
    
    playSound('spin');

    try {
      const randomFid = Math.floor(Math.random() * 500000) + 1;
      const response = await fetch(`/api/random-user?fid=${randomFid}`);
      
      if (!response.ok) {
        // Limite à 3 tentatives pour éviter la boucle infinie
        const retryCount = parseInt(sessionStorage.getItem('retryCount') || '0');
        if (retryCount < 3) {
          sessionStorage.setItem('retryCount', (retryCount + 1).toString());
          return getRandomUser();
        } else {
          sessionStorage.setItem('retryCount', '0');
          throw new Error('Max retries reached');
        }
      }

      const data = await response.json();
      sessionStorage.setItem('retryCount', '0');
      
      // Apparition instantanée - pas de délai
      setCurrentUser(data);
      setIsSpinning(false);
      playSound('reveal');
      
    } catch (error) {
      console.error('Error fetching random user:', error);
      setIsSpinning(false);
      alert('Unable to fetch user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .animated-bg {
          background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe);
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }

        .pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes fadeOut {
          to {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
        }

        .fade-out {
          animation: fadeOut 0.4s ease-out forwards;
        }
      `}</style>

      <div className="animated-bg" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          top: '-100px',
          left: '-100px',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          bottom: '-100px',
          right: '-100px',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '400px', width: '100%', position: 'relative', zIndex: 1 }}>
          
          {/* Header */}
          {!currentUser && (
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ 
                fontSize: 'clamp(60px, 15vw, 80px)', 
                marginBottom: '16px',
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
              }}>
                🎰
              </div>
              <h1 style={{
                fontSize: 'clamp(36px, 10vw, 56px)',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '12px',
                margin: '0 0 12px 0',
                letterSpacing: '-1px',
                textShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}>
                WARP ROULETTE
              </h1>
              <p style={{
                fontSize: 'clamp(14px, 4vw, 18px)',
                color: 'rgba(255,255,255,0.95)',
                fontWeight: '600',
                margin: 0,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                padding: '0 16px'
              }}>
                Discover random Farcaster profiles
              </p>
            </div>
          )}

          {/* Spin Button */}
          {!currentUser && (
            <div>
              <button
                onClick={getRandomUser}
                disabled={loading}
                className={loading ? '' : 'pulse'}
                style={{
                  width: '100%',
                  padding: 'clamp(20px, 5vw, 30px)',
                  background: loading
                    ? 'linear-gradient(135deg, #a0a0a0 0%, #808080 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                  color: loading ? '#fff' : '#667eea',
                  fontWeight: '900',
                  fontSize: 'clamp(20px, 5vw, 28px)',
                  borderRadius: '20px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading
                    ? '0 10px 30px rgba(0,0,0,0.3)'
                    : '0 20px 50px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.8)',
                  transition: 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {loading && (
                  <div className="shimmer" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                  }} />
                )}
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {loading ? 'SPINNING...' : 'SPIN THE WHEEL'}
                </span>
              </button>
            </div>
          )}

          {/* User Card */}
          {currentUser && (
            <div 
              className={isSpinning ? 'fade-out' : ''}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: 'clamp(20px, 5vw, 32px)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)',
                border: '2px solid rgba(255,255,255,0.5)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >

              {/* Profile Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(16px, 4vw, 25px)', marginBottom: 'clamp(20px, 4vw, 30px)', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 'clamp(80px, 20vw, 100px)',
                    height: 'clamp(80px, 20vw, 100px)',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '4px solid transparent',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    padding: '3px',
                    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: 'white'
                    }}>
                      <Image
                        src={currentUser.pfpUrl || '/default-avatar.png'}
                        alt={currentUser.displayName}
                        width={100}
                        height={100}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{
                    fontSize: 'clamp(24px, 6vw, 32px)',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '6px',
                    margin: '0 0 6px 0',
                    letterSpacing: '-0.5px',
                    filter: 'none',
                    wordBreak: 'break-word'
                  }}>
                    <span style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {currentUser.displayName}
                    </span>
                  </h2>
                  <p style={{
                    color: '#667eea',
                    fontSize: 'clamp(14px, 4vw, 18px)',
                    fontWeight: '700',
                    marginBottom: '6px',
                    margin: '0 0 6px 0',
                    wordBreak: 'break-all'
                  }}>
                    @{currentUser.username}
                  </p>
                  <div style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: 'clamp(11px, 3vw, 13px)',
                    fontWeight: '700',
                    boxShadow: '0 2px 8px rgba(240, 147, 251, 0.3)'
                  }}>
                    FID: {currentUser.fid}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                borderRadius: '16px',
                padding: 'clamp(16px, 4vw, 20px)',
                marginBottom: 'clamp(20px, 4vw, 26px)',
                border: '2px solid rgba(102, 126, 234, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <p style={{
                  color: '#374151',
                  fontSize: 'clamp(13px, 3.5vw, 15px)',
                  lineHeight: '1.6',
                  margin: 0,
                  fontWeight: '500',
                  wordBreak: 'break-word'
                }}>
                  {currentUser.bio || 'No bio available'}
                </p>
              </div>

              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'clamp(12px, 3vw, 16px)',
                marginBottom: 'clamp(20px, 4vw, 26px)'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '16px',
                  padding: 'clamp(16px, 4vw, 22px)',
                  textAlign: 'center',
                  boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-50%',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)'
                  }} />
                  <p style={{
                    fontSize: 'clamp(28px, 8vw, 34px)',
                    fontWeight: '900',
                    color: 'white',
                    marginBottom: '4px',
                    margin: '0 0 4px 0',
                    position: 'relative'
                  }}>
                    {currentUser.followerCount.toLocaleString()}
                  </p>
                  <p style={{
                    color: 'rgba(255,255,255,0.95)',
                    fontSize: 'clamp(12px, 3vw, 14px)',
                    fontWeight: '700',
                    margin: 0,
                    position: 'relative',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Followers
                  </p>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  borderRadius: '16px',
                  padding: 'clamp(16px, 4vw, 22px)',
                  textAlign: 'center',
                  boxShadow: '0 8px 20px rgba(240, 147, 251, 0.3)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)'
                  }} />
                  <p style={{
                    fontSize: 'clamp(28px, 8vw, 34px)',
                    fontWeight: '900',
                    color: 'white',
                    marginBottom: '4px',
                    margin: '0 0 4px 0',
                    position: 'relative'
                  }}>
                    {currentUser.followingCount.toLocaleString()}
                  </p>
                  <p style={{
                    color: 'rgba(255,255,255,0.95)',
                    fontSize: 'clamp(12px, 3vw, 14px)',
                    fontWeight: '700',
                    margin: 0,
                    position: 'relative',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Following
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 3vw, 14px)' }}>
                <a
                  href={`https://warpcast.com/${currentUser.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    padding: 'clamp(14px, 4vw, 18px)',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    fontWeight: '800',
                    fontSize: 'clamp(14px, 4vw, 16px)',
                    textAlign: 'center',
                    borderRadius: '14px',
                    textDecoration: 'none',
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
                    transition: 'none',
                    border: '2px solid rgba(255,255,255,0.2)',
                    letterSpacing: '0.3px'
                  }}
                >
                  VIEW PROFILE
                </a>
                
                <button
                  onClick={getRandomUser}
                  disabled={loading}
                  style={{
                    padding: 'clamp(14px, 4vw, 18px)',
                    background: loading
                      ? 'linear-gradient(135deg, #a0a0a0 0%, #808080 100%)'
                      : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    fontWeight: '800',
                    fontSize: 'clamp(14px, 4vw, 16px)',
                    borderRadius: '14px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading
                      ? '0 8px 20px rgba(0,0,0,0.2)'
                      : '0 8px 20px rgba(245, 158, 11, 0.4)',
                    transition: 'none',
                    opacity: loading ? 0.6 : 1,
                    letterSpacing: '0.3px'
                  }}
                >
                  {loading ? 'SPINNING...' : 'NEXT USER'}
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.9)',
            fontSize: 'clamp(12px, 3vw, 14px)',
            marginTop: 'clamp(24px, 5vw, 32px)',
            padding: '0 16px'
          }}>
            <p style={{ 
              fontWeight: '600', 
              margin: 0,
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
              Warp Roulette • Farcaster
            </p>
          </div>
        </div>
      </div>
    </>
  );
}