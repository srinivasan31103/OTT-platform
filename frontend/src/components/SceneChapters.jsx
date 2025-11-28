import { useState } from 'react';

const SceneChapters = ({ chapters = [], currentTime = 0, onChapterClick }) => {
  const [showChapters, setShowChapters] = useState(false);

  if (!chapters || chapters.length === 0) {
    return null;
  }

  const currentChapter = chapters.find(
    (ch, idx) =>
      currentTime >= ch.startTime &&
      currentTime < (chapters[idx + 1]?.startTime || Infinity)
  );

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="py-6 border-t border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg">Chapters</h3>
        <button
          onClick={() => setShowChapters(!showChapters)}
          className="text-primary hover:text-pink-700 transition-colors text-sm"
        >
          {showChapters ? 'Hide' : 'Show'}
        </button>
      </div>

      {showChapters && (
        <div className="space-y-2">
          {chapters.map((chapter, idx) => {
            const isActive = currentChapter?._id === chapter._id;
            return (
              <button
                key={idx}
                onClick={() => onChapterClick?.(chapter.startTime)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{chapter.title}</p>
                    {chapter.description && (
                      <p className="text-xs opacity-75 mt-1">
                        {chapter.description}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold ml-2 whitespace-nowrap">
                    {formatTime(chapter.startTime)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Current Chapter Info */}
      {currentChapter && (
        <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-700">
          <p className="text-gray-400 text-sm">Current Chapter</p>
          <p className="text-white font-bold">{currentChapter.title}</p>
        </div>
      )}
    </div>
  );
};

export default SceneChapters;
