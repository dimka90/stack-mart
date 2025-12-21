interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export const LoadingSkeleton = ({ count = 1, className = '' }: LoadingSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`skeleton-card ${className}`}>
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <div className="skeleton" style={{ height: '2.5rem', width: '100px', borderRadius: '0.5rem' }}></div>
            <div className="skeleton" style={{ height: '2.5rem', width: '100px', borderRadius: '0.5rem' }}></div>
          </div>
        </div>
      ))}
    </>
  );
};

