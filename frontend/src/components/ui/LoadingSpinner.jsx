export default function LoadingSpinner({ size = 'medium', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    small: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    medium: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-2',
    large: 'w-12 h-12 border-2',
  };
  const sizeClass = sizes[size] || sizes.medium;
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClass} rounded-full border-blue-200 border-t-blue-600 animate-spin`}
      />
    </div>
  );
}
