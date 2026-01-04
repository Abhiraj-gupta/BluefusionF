export const BlueFusionLogo = ({ size = 64 }: { size?: number }) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: 'linear-gradient(135deg, #00ccff 0%, #0099cc 100%)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: '0 8px 16px rgba(0, 204, 255, 0.4)',
        animation: 'float 3s ease-in-out infinite',
        overflow: 'hidden'
      }}
    >
      {/* Wave Pattern Inside Logo */}
      <div
        style={{
          position: 'absolute',
          top: '60%',
          left: '-20px',
          right: '-20px',
          height: '40px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          animation: 'wave1 4s ease-in-out infinite',
          transform: 'rotate(-10deg)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '70%',
          left: '-20px',
          right: '-20px',
          height: '30px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          animation: 'wave2 3s ease-in-out infinite',
          transform: 'rotate(-10deg)'
        }}
      />
      
      {/* Ocean Wave Emoji */}
      <span 
        style={{ 
          fontSize: `${size * 0.4}px`, 
          animation: 'wave1 4s ease-in-out infinite',
          position: 'relative',
          zIndex: 2
        }}
      >
        🌊
      </span>
    </div>
  );
};