import { useState } from 'react';
import { FiLock, FiEdit2, FiTrash2 } from 'react-icons/fi';

const ProfileCard = ({
  profile,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  editable = false,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div
      className={`relative cursor-pointer group transition-all duration-300 hover:scale-105 ${
        isSelected ? 'ring-2 ring-neon-purple' : ''
      }`}
      onClick={onSelect}
    >
      {/* Profile Avatar */}
      <div
        className={`w-24 h-24 md:w-32 md:h-32 rounded-xl flex items-center justify-center text-white font-black text-2xl md:text-3xl transition-all duration-300 ${
          profile.color || 'bg-gradient-to-br from-neon-purple to-neon-pink'
        }`}
        style={{
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.4), 0 4px 15px rgba(236, 72, 153, 0.3)'
        }}
      >
        {profile.name?.[0]?.toUpperCase() || 'P'}
      </div>

      {/* Profile Name */}
      <p className="text-white text-center mt-3 font-bold group-hover:text-neon-cyan transition-colors">
        {profile.name}
      </p>

      {/* Age Rating */}
      {profile.ageRating && (
        <p className="text-gray-500 text-center text-sm">
          Age {profile.ageRating}+
        </p>
      )}

      {/* PIN Badge */}
      {profile.hasPin && (
        <div className="flex items-center justify-center gap-1 text-neon-orange text-sm mt-1">
          <FiLock size={14} />
          <span>Protected</span>
        </div>
      )}

      {/* Edit/Delete Options */}
      {editable && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOptions(!showOptions);
            }}
            className="glass-neon text-gray-300 p-1.5 rounded-lg hover:text-neon-cyan transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showOptions && (
            <div className="absolute top-full right-0 mt-2 glass-neon rounded-lg shadow-lg z-10 w-32"
              style={{
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)'
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                  setShowOptions(false);
                }}
                className="w-full text-left px-4 py-2 text-gray-300 hover:text-neon-cyan hover:bg-neon-purple/10 flex items-center gap-2 text-sm rounded-t-lg transition-colors"
              >
                <FiEdit2 size={14} />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                  setShowOptions(false);
                }}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 flex items-center gap-2 text-sm rounded-b-lg transition-colors"
              >
                <FiTrash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute bottom-2 right-2 badge-neon px-2 py-1 text-xs">
          Active
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
