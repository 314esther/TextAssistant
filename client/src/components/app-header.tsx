interface AppHeaderProps {
  onHelpClick: () => void;
}

export default function AppHeader({ onHelpClick }: AppHeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="material-icons text-primary-600">description_search</span>
          <h1 className="text-xl font-bold text-gray-900">DocuQuery</h1>
        </div>
        <div className="flex items-center">
          <button 
            onClick={onHelpClick}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Help"
          >
            <span className="material-icons">help_outline</span>
          </button>
        </div>
      </div>
    </header>
  );
}
