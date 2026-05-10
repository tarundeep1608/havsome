import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { SEED_DATA } from '../scripts/seedMenu';

export default function SeedPage() {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);

  const handleSeed = async () => {
    setStatus('seeding');
    setTotal(SEED_DATA.length);
    let count = 0;

    try {
      for (const item of SEED_DATA) {
        await addDoc(collection(db, 'menu_items'), {
          ...item,
          isAvailable: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        count++;
        setProgress(count);
      }
      setStatus('done');
    } catch (err) {
      console.error('Seed error:', err);
      setStatus('error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--color-surface-950)' }}>
      <div className="glass-card p-8 text-center max-w-md w-full">
        <img src="/logo.png" alt="Havsome" className="w-16 h-16 rounded-xl mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Menu Seeder
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-surface-400)' }}>
          This will add {SEED_DATA.length} menu items from the Havsome menu to Firestore.
        </p>

        {status === 'idle' && (
          <button onClick={handleSeed} className="btn btn-primary btn-lg w-full">
            Seed Menu Data
          </button>
        )}

        {status === 'seeding' && (
          <div>
            <div className="w-full h-3 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(progress / total) * 100}%`,
                  background: 'linear-gradient(90deg, var(--color-primary-500), var(--color-primary-400))',
                }}
              />
            </div>
            <p className="text-sm" style={{ color: 'var(--color-surface-400)' }}>
              {progress} / {total} items added...
            </p>
          </div>
        )}

        {status === 'done' && (
          <div>
            <p className="text-lg font-bold mb-2" style={{ color: '#22c55e' }}>
              ✓ {progress} items seeded!
            </p>
            <a href="/menu/1" className="btn btn-cyan btn-lg w-full mt-3">
              View Customer Menu →
            </a>
          </div>
        )}

        {status.startsWith('error') && (
          <p className="text-sm" style={{ color: '#f87171' }}>{status}</p>
        )}
      </div>
    </div>
  );
}
