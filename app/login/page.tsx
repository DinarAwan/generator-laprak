'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="w-5 h-5 border border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden"
      style={{ fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif" }}
    >
      {/* Subtle ambient light top-left */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-120px',
          left: '-80px',
          width: '480px',
          height: '480px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      {/* Subtle ambient light bottom-right */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-100px',
          right: '-60px',
          width: '360px',
          height: '360px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* Fine grid texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 w-full max-w-[400px] mx-5">

        {/* Logo & Brand */}
        <div className="flex flex-col items-center mb-10">
          {/* Logo image — ganti src dengan path logo Anda */}
          <div
            className="mb-5 relative"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '18px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              src="/uad.png"
              alt="Auto-Laprak Logo"
              width={72}
              height={72}
              style={{ objectFit: 'cover' }}
            />
          </div>

          <h1
            style={{
              fontSize: '22px',
              fontWeight: '600',
              color: 'rgba(255,255,255,0.92)',
              letterSpacing: '-0.3px',
              marginBottom: '4px',
            }}
          >
            Auto-Laprak
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.32)',
              letterSpacing: '0.2px',
            }}
          >
            Universitas Ahmad Dahlan
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            padding: '28px',
          }}
        >
          {/* Feature list */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '24px',
            }}
          >
            <FeatureRow
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              }
              text="Otomatisasi laporan praktikum sesuai format resmi kampus"
            />
            <FeatureRow
              icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              }
              text="Live preview, export PDF instan, tanpa formatting manual"
            />
          </div>

          {/* Divider */}
          <div
            style={{
              height: '1px',
              background: 'rgba(255,255,255,0.06)',
              marginBottom: '20px',
            }}
          />

          {/* Google Sign In Button */}
          <button
            onClick={signInWithGoogle}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: 'rgba(255,255,255,0.95)',
              color: '#111',
              fontWeight: '500',
              fontSize: '14px',
              letterSpacing: '-0.1px',
              padding: '11px 20px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.15s ease, transform 0.1s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.95)')}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.985)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <GoogleIcon />
            Masuk dengan Google
          </button>

          <p
            style={{
              textAlign: 'center',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.2)',
              marginTop: '14px',
              letterSpacing: '0.1px',
            }}
          >
            Hanya untuk email @webmail.uad.ac.id
          </p>
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.14)',
            marginTop: '24px',
          }}
        >
          © {new Date().getFullYear()} Study Blog UAD
        </p>
      </div>
    </div>
  );
}

function FeatureRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <span
        style={{
          color: 'rgba(255,255,255,0.35)',
          marginTop: '1px',
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <p
        style={{
          fontSize: '12.5px',
          color: 'rgba(255,255,255,0.5)',
          lineHeight: '1.55',
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}