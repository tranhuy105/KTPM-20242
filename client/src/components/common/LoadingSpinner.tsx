interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "amber" | "gray" | "white";
}

const LoadingSpinner = ({
  size = "md",
  color = "amber",
}: LoadingSpinnerProps) => {
  // Determine size class
  const sizeClass = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  }[size];

  // Determine color class
  const colorClass = {
    amber: "text-amber-800",
    gray: "text-gray-600",
    white: "text-white",
  }[color];

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClass} ${colorClass} animate-spin`}
        style={{
          borderRadius: "50%",
          borderTop: "2px solid currentColor",
          borderRight: "2px solid transparent",
        }}
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;
