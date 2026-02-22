import React, { useMemo } from 'react';

export const StarBackground: React.FC = () => {
  const stars = useMemo(() => {
    const arr: { x: number; y: number; s: number; o: number }[] = [];
    for (let i = 0; i < 180; i++) {
      arr.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 1 + Math.random() * 2,
        o: 0.25 + Math.random() * 0.75,
      });
    }
    return arr;
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 30%, #081018 0%, #000 60%)',
        }}
      />
      {stars.map((st, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: st.s,
            height: st.s,
            borderRadius: 999,
            background: 'white',
            opacity: st.o,
          }}
        />
      ))}
    </div>
  );
};