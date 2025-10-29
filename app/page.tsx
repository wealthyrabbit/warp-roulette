'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

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
  const [canSpin, setCanSpin] = useState(true);
  const [timeUntilNextSpin, setTimeUntilNextSpin] = useState<string>('');

  // Check if user can spin
  useEffect(() => {
    checkSpinAvailability();
    const interval = setInterval(checkSpinAvailability, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkSpinAvailability = () => {
    const lastSpinTime = localStorage.getItem('lastSpinTime');
    if (!lastSpinTime) {
      setCanSpin(true);
      setTimeUntilNextSpin('');
      return;
    }

    const lastSpin = new Date(parseInt(lastSpinTime));
    const now = new Date();
    const nextSpinTime = new Date(lastSpin.getTime() + 15 * 1000); // 15 seconds

    if (now >= nextSpinTime) {
      setCanSpin(true);
      setTimeUntilNextSpin('');
    } else {
      setCanSpin(false);
      const diff = nextSpinTime.getTime() - now.getTime();
      const seconds = Math.ceil(diff / 1000);
      setTimeUntilNextSpin(`${seconds}s`);
    }
  };

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
    if (!canSpin) return;

    setLoading(true);
    setIsSpinning(true);
    
    // Hide current user immediately when spinning
    if (currentUser) {
      setCurrentUser(null);
    }
    
    playSound('spin');

    // Save spin time
    localStorage.setItem('lastSpinTime', Date.now().toString());
    setCanSpin(false);

    try {
      const randomFid = Math.floor(Math.random() * 500000) + 1;
      const response = await fetch(`/api/random-user?fid=${randomFid}`);
      
      if (!response.ok) {
        return getRandomUser();
      }

      const data = await response.json();
      
      // Apparition instantanée - pas de délai
      setCurrentUser(data);
      setIsSpinning(false);
      playSound('reveal');
      
    } catch (error) {
      console.error('Error fetching random user:', error);
      getRandomUser();
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
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          top: '-250px',
          left: '-250px',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          bottom: '-200px',
          right: '-200px',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '650px', width: '100%', position: 'relative', zIndex: 1 }}>
          
          {/* Header */}
          {!currentUser && (
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <div style={{ 
                fontSize: '100px', 
                marginBottom: '20px',
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
              }}>
                🎰
              </div>
              <h1 style={{
                fontSize: '72px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '15px',
                margin: '0 0 15px 0',
                letterSpacing: '-2px',
                textShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}>
                WARP ROULETTE
              </h1>
              <p style={{
                fontSize: '22px',
                color: 'rgba(255,255,255,0.95)',
                fontWeight: '600',
                margin: 0,
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
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
                disabled={loading || !canSpin}
                className={loading || !canSpin ? '' : 'pulse'}
                style={{
                  width: '100%',
                  padding: '30px',
                  background: (loading || !canSpin)
                    ? 'linear-gradient(135deg, #a0a0a0 0%, #808080 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                  color: (loading || !canSpin) ? '#fff' : '#667eea',
                  fontWeight: '900',
                  fontSize: '32px',
                  borderRadius: '25px',
                  border: 'none',
                  cursor: (loading || !canSpin) ? 'not-allowed' : 'pointer',
                  boxShadow: (loading || !canSpin)
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
                  {loading ? 'SPINNING...' : !canSpin ? `NEXT SPIN IN ${timeUntilNextSpin}` : 'SPIN THE WHEEL'}
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
                borderRadius: '30px',
                padding: '40px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.8)',
                border: '2px solid rgba(255,255,255,0.5)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >

              {/* Profile Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '25px', marginBottom: '30px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '5px solid transparent',
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
                        width={110}
                        height={110}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontSize: '36px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '8px',
                    margin: '0 0 8px 0',
                    letterSpacing: '-1px',
                    filter: 'none'
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
                    fontSize: '20px',
                    fontWeight: '700',
                    marginBottom: '6px',
                    margin: '0 0 6px 0'
                  }}>
                    @{currentUser.username}
                  </p>
                  <div style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
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
                borderRadius: '18px',
                padding: '22px',
                marginBottom: '30px',
                border: '2px solid rgba(102, 126, 234, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <p style={{
                  color: '#374151',
                  fontSize: '15px',
                  lineHeight: '1.7',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  {currentUser.bio || 'No bio available'}
                </p>
              </div>

              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '18px',
                marginBottom: '30px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '18px',
                  padding: '25px',
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
                    fontSize: '38px',
                    fontWeight: '900',
                    color: 'white',
                    marginBottom: '6px',
                    margin: '0 0 6px 0',
                    position: 'relative'
                  }}>
                    {currentUser.followerCount.toLocaleString()}
                  </p>
                  <p style={{
                    color: 'rgba(255,255,255,0.95)',
                    fontSize: '15px',
                    fontWeight: '700',
                    margin: 0,
                    position: 'relative',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Followers
                  </p>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  borderRadius: '18px',
                  padding: '25px',
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
                    fontSize: '38px',
                    fontWeight: '900',
                    color: 'white',
                    marginBottom: '6px',
                    margin: '0 0 6px 0',
                    position: 'relative'
                  }}>
                    {currentUser.followingCount.toLocaleString()}
                  </p>
                  <p style={{
                    color: 'rgba(255,255,255,0.95)',
                    fontSize: '15px',
                    fontWeight: '700',
                    margin: 0,
                    position: 'relative',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Following
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <a
                  href={`https://warpcast.com/${currentUser.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    padding: '18px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    fontWeight: '800',
                    fontSize: '16px',
                    textAlign: 'center',
                    borderRadius: '15px',
                    textDecoration: 'none',
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
                    transition: 'none',
                    border: '2px solid rgba(255,255,255,0.2)',
                    letterSpacing: '0.5px'
                  }}
                >
                  VIEW PROFILE
                </a>
                
                <button
                  onClick={getRandomUser}
                  disabled={loading || !canSpin}
                  style={{
                    padding: '18px',
                    background: (loading || !canSpin)
                      ? 'linear-gradient(135deg, #a0a0a0 0%, #808080 100%)'
                      : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    fontWeight: '800',
                    fontSize: '16px',
                    borderRadius: '15px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    cursor: (loading || !canSpin) ? 'not-allowed' : 'pointer',
                    boxShadow: (loading || !canSpin)
                      ? '0 8px 20px rgba(0,0,0,0.2)'
                      : '0 8px 20px rgba(245, 158, 11, 0.4)',
                    transition: 'none',
                    opacity: (loading || !canSpin) ? 0.6 : 1,
                    letterSpacing: '0.5px'
                  }}
                >
                  {loading ? 'SPINNING...' : !canSpin ? `NEXT SPIN IN ${timeUntilNextSpin}` : 'NEXT USER'}
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '15px',
            marginTop: '40px'
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