import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCopy, FiUsers, FiArrowLeft } from 'react-icons/fi';
import { watchPartyApi } from '../api/apiClient';
import HLSPlayer from '../components/HLSPlayer';

const WatchParty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [party, setParty] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    const fetchParty = async () => {
      try {
        setIsLoading(true);
        const response = await watchPartyApi.getParty(id);
        setParty(response.data);
        setParticipants(response.data.participants || []);
        setInviteLink(`${window.location.origin}/join-party/${id}`);
      } catch (error) {
        console.error('Failed to fetch watch party:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchParty();
  }, [id, navigate]);

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center particles-bg relative overflow-hidden">
        <div className="absolute inset-0 overlay-glow" />
        <div className="relative z-10 text-center">
          <div className="animate-spin mb-4 inline-block">
            <div className="w-12 h-12 border-4 border-transparent border-t-neon-purple rounded-full"
              style={{
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)'
              }}
            />
          </div>
          <p className="text-gray-400">Loading watch party...</p>
        </div>
      </div>
    );
  }

  if (!party) {
    return (
      <div className="min-h-screen gradient-dark flex flex-col items-center justify-center gap-4 particles-bg relative overflow-hidden">
        <div className="absolute inset-0 overlay-glow" />
        <div className="relative z-10 text-center">
          <p className="text-gray-400 mb-4">Watch party not found</p>
          <button
            onClick={() => navigate('/')}
            className="btn-neon"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-dark particles-bg relative overflow-hidden">
      <div className="absolute inset-0 overlay-glow" />

      <div className="px-4 lg:px-8 py-4 relative z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 glass-neon px-4 py-2 rounded-xl text-gray-300 hover:text-neon-cyan transition-all duration-300"
          style={{
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)'
          }}
        >
          <FiArrowLeft size={20} />
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 lg:px-8 pb-12 relative z-10">
        {/* Player Section */}
        <div className="lg:col-span-2 animate-slide-up">
          <div className="rounded-2xl overflow-hidden border-2 border-neon-purple/30"
            style={{
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)'
            }}
          >
            <HLSPlayer
              url={party.content?.streamUrl || party.content?.url}
              videoId={party.contentId}
              title={party.content?.title || party.content?.name}
            />
          </div>
        </div>

        {/* Participants Section */}
        <div className="space-y-4">
          {/* Party Info */}
          <div className="glass-neon rounded-2xl p-6 animate-slide-in"
            style={{
              boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
            }}
          >
            <h3 className="heading-card mb-4">
              Watch Party
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-neon-cyan text-sm mb-2 font-semibold">Party Code</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={id}
                    readOnly
                    className="flex-1 glass-neon text-white px-3 py-2 rounded-xl text-sm font-mono border-2 border-neon-purple/30"
                    style={{
                      boxShadow: '0 0 10px rgba(168, 85, 247, 0.2)'
                    }}
                  />
                  <button
                    onClick={copyInviteLink}
                    className="btn-cyber px-4 py-2 rounded-xl"
                  >
                    <FiCopy size={16} />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-neon-cyan text-sm mb-2 font-semibold">Watching</p>
                <p className="text-white font-bold">
                  {party.content?.title || party.content?.name}
                </p>
              </div>

              <div>
                <p className="text-neon-cyan text-sm mb-2 font-semibold">Started By</p>
                <p className="text-white font-bold">
                  {party.createdBy?.name || 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Participants List */}
          <div className="glass-neon rounded-2xl p-6 animate-slide-in" style={{
            animationDelay: '0.1s',
            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
          }}>
            <div className="flex items-center gap-2 mb-4">
              <FiUsers className="text-neon-pink" size={20} />
              <h4 className="text-white font-bold">
                Watching ({participants.length})
              </h4>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
              {participants.map((participant) => (
                <div
                  key={participant._id}
                  className="flex items-center gap-3 p-3 glass-neon rounded-xl border-2 border-neon-purple/20 hover:border-neon-purple transition-all duration-300"
                  style={{
                    boxShadow: '0 0 10px rgba(168, 85, 247, 0.2)'
                  }}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-pink rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{
                      boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
                    }}
                  >
                    {participant.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">
                      {participant.name}
                    </p>
                    {participant.isHost && (
                      <p className="text-neon-orange text-xs font-semibold">Host</p>
                    )}
                  </div>
                  {participant.isOnline && (
                    <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"
                      style={{
                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="glass-neon rounded-2xl p-6 text-sm text-gray-400 animate-slide-in" style={{
            animationDelay: '0.2s',
            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
          }}>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
              Started <span className="text-neon-cyan font-semibold">{new Date(party.createdAt).toLocaleString()}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchParty;
