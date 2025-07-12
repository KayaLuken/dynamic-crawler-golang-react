export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export function LoadingTableSkeleton() {
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-64 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4">
          <div className="grid grid-cols-10 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-t border-gray-200 p-4">
            <div className="grid grid-cols-10 gap-4">
              {Array.from({ length: 10 }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
