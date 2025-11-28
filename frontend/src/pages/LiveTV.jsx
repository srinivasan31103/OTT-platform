import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import HLSPlayer from '../components/HLSPlayer';
import ChatBox from '../components/ChatBox';
import { contentApi } from '../api/apiClient';

const LiveTV = () => {
  const { id } = useParams();
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setIsLoading(true);
        const response = await contentApi.getLiveTV();
        const channelList = response.data?.data || response.data || [];
        setChannels(channelList);

        // Select channel from URL or first available
        if (id) {
          const channel = channelList.find((c) => c._id === id);
          if (channel) {
            setSelectedChannel(channel);
          } else {
            setSelectedChannel(channelList[0]);
          }
        } else {
          setSelectedChannel(channelList[0]);
        }
      } catch (error) {
        console.error('Failed to fetch channels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, [id]);

  const filteredChannels = channels.filter(
    (ch) =>
      ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <p className="text-gray-400">Loading channels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-dark particles-bg relative overflow-hidden">
      <div className="absolute inset-0 overlay-glow" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 lg:p-8 max-h-screen lg:h-screen lg:overflow-hidden relative z-10">
        {/* Channel List */}
        <div className="lg:col-span-1 glass-neon rounded-2xl p-4 h-96 lg:h-full flex flex-col animate-slide-in"
          style={{
            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
          }}
        >
          <div className="mb-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-neon-cyan" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search channels..."
                className="w-full pl-10 pr-4 py-3 glass-neon text-white border-2 border-neon-purple/30 rounded-xl focus:border-neon-purple focus:outline-none transition-all text-sm"
                style={{
                  boxShadow: '0 0 15px rgba(168, 85, 247, 0.2)'
                }}
              />
            </div>
          </div>

          {/* Channel Items */}
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            {filteredChannels.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">
                No channels found
              </p>
            ) : (
              filteredChannels.map((channel) => (
                <button
                  key={channel._id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                    selectedChannel?._id === channel._id
                      ? 'bg-gradient-to-r from-neon-purple to-neon-pink text-white border-2 border-neon-purple'
                      : 'glass-neon border-2 border-neon-purple/20 text-gray-300 hover:border-neon-purple'
                  }`}
                  style={selectedChannel?._id === channel._id ? {
                    boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)'
                  } : {}}
                >
                  <div className="flex items-start gap-3">
                    {channel.logo && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-neon-purple/30 flex-shrink-0">
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">
                        {channel.name}
                      </p>
                      {channel.currentProgram && (
                        <p className="text-xs text-gray-400 truncate">
                          {channel.currentProgram}
                        </p>
                      )}
                    </div>
                    {channel.isLive && (
                      <div className="flex items-center gap-1.5 text-xs font-bold whitespace-nowrap badge-neon px-2 py-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        LIVE
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        {selectedChannel ? (
          <div className="lg:col-span-3 flex flex-col gap-4 h-96 lg:h-full animate-slide-up">
            {/* Player */}
            <div className="flex-1 rounded-2xl overflow-hidden border-2 border-neon-purple/30"
              style={{
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)'
              }}
            >
              <HLSPlayer
                url={selectedChannel.streamUrl || selectedChannel.url}
                videoId={selectedChannel._id}
                title={selectedChannel.name}
              />
            </div>

            {/* Channel Info & Chat */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-48 lg:h-auto">
              {/* Channel Details */}
              <div className="glass-neon rounded-2xl p-4"
                style={{
                  boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
                }}
              >
                <h3 className="text-white font-bold text-lg mb-2 bg-gradient-to-r from-white to-neon-purple bg-clip-text text-transparent">
                  {selectedChannel.name}
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  {selectedChannel.description}
                </p>
                {selectedChannel.currentProgram && (
                  <div className="mt-4 p-3 rounded-xl bg-neon-purple/10 border border-neon-purple/30">
                    <p className="text-neon-cyan text-xs mb-1 font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
                      Now Playing
                    </p>
                    <p className="text-white font-bold text-sm">
                      {selectedChannel.currentProgram}
                    </p>
                  </div>
                )}
              </div>

              {/* Live Chat */}
              <div className="md:col-span-2">
                <ChatBox channelId={selectedChannel._id} />
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-3 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full glass-neon flex items-center justify-center mb-6 mx-auto"
                style={{
                  boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)'
                }}
              >
                <FiSearch className="text-neon-cyan text-4xl" />
              </div>
              <p className="text-gray-400 text-lg">Select a channel to watch</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTV;
