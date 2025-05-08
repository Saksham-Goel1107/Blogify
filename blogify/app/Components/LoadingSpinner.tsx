
import { useTheme } from '../actions/DarkMode';

export default function LoadingSpinner() {
  const { darkMode } = useTheme();
  
  return (
    <div className="flex justify-center items-center">
      <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
        darkMode ? 'border-gray-200' : 'border-blue-600'
      }`} />
    </div>
  );
}
