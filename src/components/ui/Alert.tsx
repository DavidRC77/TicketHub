export const Alert: React.FC<
  React.HTMLAttributes<HTMLDivElement> & {
    type?: 'success' | 'error' | 'warning' | 'info';
  }
> = ({ type = 'info', className = '', children, ...props }) => {
  const typeStyles = {
    success: 'bg-green-50 text-green-900 border-green-200',
    error: 'bg-red-50 text-red-900 border-red-200',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    info: 'bg-blue-50 text-blue-900 border-blue-200',
  };

  return (
    <div
      className={`border rounded-lg px-4 py-3 ${typeStyles[type]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
