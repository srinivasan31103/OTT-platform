import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBarChart2, FiUsers, FiFilm, FiTrendingUp, FiTrash2, FiEdit, FiEye, FiDollarSign, FiPlus } from 'react-icons/fi';
import { adminApi } from '../api/apiClient';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

const AdminDashboard = () => {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [content, setContent] = useState([]);
  const [ads, setAds] = useState([]);
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [showAdModal, setShowAdModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('AdminDashboard - Fetching data with token:', token);

        // Fetch stats
        const statsRes = await axios.get('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Stats response:', statsRes.data);
        setStats(statsRes.data.data || statsRes.data);

        // Fetch users
        const usersRes = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Users response:', usersRes.data);
        setUsers(usersRes.data.data || usersRes.data || []);

        // Fetch content (movies + series)
        const moviesRes = await axios.get('http://localhost:5000/api/movies', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const seriesRes = await axios.get('http://localhost:5000/api/series', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Movies response:', moviesRes.data);
        console.log('Series response:', seriesRes.data);
        const allContent = [
          ...(moviesRes.data.data || moviesRes.data || []),
          ...(seriesRes.data.data || seriesRes.data || [])
        ];
        setContent(allContent);

        // Fetch ads
        const adsRes = await axios.get('http://localhost:5000/api/admin/ads', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Ads response:', adsRes.data);
        setAds(adsRes.data.data || adsRes.data || []);

        // Fetch banners
        const bannersRes = await axios.get('http://localhost:5000/api/admin/banners', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Banners response:', bannersRes.data);
        setBanners(bannersRes.data.data || bannersRes.data || []);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        console.error('Error details:', error.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await adminApi.deleteUser(userId);
      setUsers(users.filter((u) => u._id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;

    try {
      await adminApi.deleteContent(contentId);
      setContent(content.filter((c) => c._id !== contentId));
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  };

  const handleDeleteAd = async (adId) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/ads/${adId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAds(ads.filter((ad) => ad._id !== adId));
    } catch (error) {
      console.error('Failed to delete ad:', error);
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/banners/${bannerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBanners(banners.filter((b) => b._id !== bannerId));
    } catch (error) {
      console.error('Failed to delete banner:', error);
    }
  };

  const handleToggleAdStatus = async (adId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await axios.put(`http://localhost:5000/api/admin/ads/${adId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAds(ads.map(ad => ad._id === adId ? { ...ad, status: newStatus } : ad));
    } catch (error) {
      console.error('Failed to toggle ad status:', error);
    }
  };

  const handleToggleBannerStatus = async (bannerId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await axios.put(`http://localhost:5000/api/admin/banners/${bannerId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBanners(banners.map(b => b._id === bannerId ? { ...b, status: newStatus } : b));
    } catch (error) {
      console.error('Failed to toggle banner status:', error);
    }
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
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-dark pb-12 particles-bg relative overflow-hidden">
      <div className="absolute inset-0 overlay-glow" />

      {/* Header */}
      <div className="px-4 lg:px-8 py-8 border-b border-neon-purple/30 glass-neon relative z-10 animate-slide-down"
        style={{
          boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
        }}
      >
        <h1 className="heading-section mb-4">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-4 overflow-x-auto custom-scrollbar">
          {['stats', 'users', 'content', 'ads', 'banners'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-neon-purple to-neon-pink text-white'
                  : 'text-gray-400 hover:text-neon-cyan glass-neon'
              }`}
              style={activeTab === tab ? {
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)'
              } : {}}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 lg:px-8 py-8 relative z-10 max-w-7xl mx-auto">
        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6 pb-12">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total Users',
                  value: stats.totalUsers,
                  icon: FiUsers,
                  colorClass: 'text-neon-cyan'
                },
                {
                  label: 'Total Content',
                  value: stats.totalContent,
                  icon: FiFilm,
                  colorClass: 'text-neon-purple'
                },
                {
                  label: 'Total Revenue',
                  value: `$${stats.totalRevenue}`,
                  icon: FiTrendingUp,
                  colorClass: 'text-neon-green'
                },
                {
                  label: 'Active Subscriptions',
                  value: stats.activeSubscriptions,
                  icon: FiBarChart2,
                  colorClass: 'text-neon-pink'
                },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={idx}
                    className="glass-neon rounded-2xl p-6 hover:scale-105 transition-all duration-300 animate-slide-up"
                    style={{
                      animationDelay: `${idx * 0.1}s`,
                      boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                        <p className={`text-3xl font-bold ${stat.colorClass} mt-1`}>
                          {stat.value}
                        </p>
                      </div>
                      <Icon className={`${stat.colorClass} text-2xl`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upload Section */}
            <div className="mt-8 glass-neon rounded-2xl p-6">
              <h2 className="heading-card mb-4">
                Content Management
              </h2>
              <Link
                to="/admin/upload"
                className="inline-block btn-neon"
              >
                Upload New Content
              </Link>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="pb-12">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="heading-card mb-2">User Management</h2>
                <p className="text-gray-400">Manage platform users and their subscriptions</p>
              </div>
              <button
                onClick={() => navigate('/register')}
                className="flex items-center space-x-2 btn-neon"
              >
                <FiPlus size={20} />
                <span>Add User</span>
              </button>
            </div>
            <div className="glass-neon rounded-2xl overflow-hidden"
              style={{
                boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
              }}
            >
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neon-purple/30">
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">
                        Subscription
                      </th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                          <p>No users found</p>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr
                          key={user._id}
                          className="border-b border-neon-purple/10 hover:bg-neon-purple/5 transition-colors"
                        >
                        <td className="px-6 py-4 text-white font-semibold">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-gray-300">{user.email}</td>
                        <td className="px-6 py-4 text-gray-300">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              user.subscription?.status === 'active'
                                ? 'badge-neon'
                                : 'bg-gray-500 bg-opacity-20 text-gray-400'
                            }`}
                          >
                            {user.subscription?.planName || 'Free'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => navigate(`/admin/user/${user._id}`)}
                              className="text-neon-cyan hover:text-neon-purple transition-colors"
                              title="View User"
                            >
                              <FiEye size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete User"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="pb-12">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="heading-card mb-2">Content Library</h2>
                <p className="text-gray-400">Manage movies, series, and episodes</p>
              </div>
              <button
                onClick={() => navigate('/admin/upload')}
                className="flex items-center space-x-2 btn-neon"
              >
                <FiPlus size={20} />
                <span>Upload Content</span>
              </button>
            </div>
            <div className="glass-neon rounded-2xl overflow-hidden"
              style={{
                boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
              }}
            >
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neon-purple/30">
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">
                        Added
                      </th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">
                        Views
                      </th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                          <p>No content found</p>
                        </td>
                      </tr>
                    ) : (
                      content.map((item) => (
                        <tr
                          key={item._id}
                          className="border-b border-neon-purple/10 hover:bg-neon-purple/5 transition-colors"
                        >
                          <td className="px-6 py-4 text-white font-semibold">
                            {item.title || item.name}
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            <span className="badge-cyber">
                              {item.seasons ? 'Series' : 'Movie'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {item.views || 0}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => navigate(item.seasons ? `/series/${item._id}` : `/movie/${item._id}`)}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="View Content"
                              >
                                <FiEye size={18} />
                              </button>
                              <button
                                onClick={() => navigate(`/admin/edit/${item._id}`)}
                                className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                title="Edit Content"
                              >
                                <FiEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteContent(item._id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Delete Content"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Ads Tab */}
        {activeTab === 'ads' && (
          <div className="pb-12">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="heading-card mb-2">Advertisement Management</h2>
                <p className="text-gray-400">Manage sponsor advertisements and track performance</p>
              </div>
              <button
                onClick={() => {
                  setEditingAd(null);
                  setShowAdModal(true);
                }}
                className="flex items-center space-x-2 btn-neon"
              >
                <FiPlus size={20} />
                <span>Create Ad</span>
              </button>
            </div>

            <div className="glass-neon rounded-2xl overflow-hidden"
              style={{
                boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
              }}
            >
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neon-purple/30">
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">Title</th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">Sponsor</th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">Placement</th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">Impressions</th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">Clicks</th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">CTR</th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ads.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-12 text-center text-gray-400">
                          No advertisements found. Create your first ad to start monetizing!
                        </td>
                      </tr>
                    ) : (
                      ads.map((ad) => (
                        <tr key={ad._id} className="border-b border-neon-purple/10 hover:bg-neon-purple/5 transition-colors">
                          <td className="px-6 py-4 text-white font-semibold">{ad.title}</td>
                          <td className="px-6 py-4 text-gray-300">{ad.sponsor?.name || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className="badge-cyber">
                              {ad.placement}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleAdStatus(ad._id, ad.status)}
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                ad.status === 'active'
                                  ? 'bg-green-500 bg-opacity-20 text-green-400 hover:bg-opacity-30'
                                  : 'bg-gray-500 bg-opacity-20 text-gray-400 hover:bg-opacity-30'
                              } transition-colors`}
                            >
                              {ad.status}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            <div className="flex items-center space-x-1">
                              <FiEye className="text-blue-400" />
                              <span>{ad.analytics?.impressions || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-300">{ad.analytics?.clicks || 0}</td>
                          <td className="px-6 py-4 text-gray-300">
                            {ad.analytics?.ctr ? ad.analytics.ctr.toFixed(2) : '0.00'}%
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => window.open(ad.clickUrl, '_blank')}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="Preview Ad"
                              >
                                <FiEye size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingAd(ad);
                                  setShowAdModal(true);
                                }}
                                className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                title="Edit Ad"
                              >
                                <FiEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteAd(ad._id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Delete Ad"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {ads.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-neon rounded-lg p-6 border border-neon-purple/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Impressions</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {ads.reduce((sum, ad) => sum + (ad.analytics?.impressions || 0), 0).toLocaleString()}
                      </p>
                    </div>
                    <FiEye className="text-blue-400 text-3xl opacity-50" />
                  </div>
                </div>
                <div className="glass-neon rounded-lg p-6 border border-neon-purple/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Clicks</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {ads.reduce((sum, ad) => sum + (ad.analytics?.clicks || 0), 0).toLocaleString()}
                      </p>
                    </div>
                    <FiTrendingUp className="text-green-400 text-3xl opacity-50" />
                  </div>
                </div>
                <div className="glass-neon rounded-lg p-6 border border-neon-purple/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Ad Revenue</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        ${ads.reduce((sum, ad) => sum + (ad.analytics?.revenue || 0), 0).toLocaleString()}
                      </p>
                    </div>
                    <FiDollarSign className="text-yellow-400 text-3xl opacity-50" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Banners Tab */}
        {activeTab === 'banners' && (
          <div className="pb-12">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="heading-card mb-2">Banner Management</h2>
                <p className="text-gray-400">Manage hero banners and promotional content</p>
              </div>
              <button
                onClick={() => {
                  setEditingBanner(null);
                  setShowBannerModal(true);
                }}
                className="flex items-center space-x-2 btn-neon"
              >
                <FiPlus size={20} />
                <span>Create Banner</span>
              </button>
            </div>

            <div className="glass-neon rounded-2xl overflow-hidden"
              style={{
                boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
              }}
            >
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neon-purple/30">
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">Preview</th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">Title</th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">Position</th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">Views</th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">Clicks</th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                          No banners found. Create your first banner for the homepage!
                        </td>
                      </tr>
                    ) : (
                      banners.map((banner) => (
                        <tr key={banner._id} className="border-b border-neon-purple/20 hover:bg-neon-purple/5 transition-colors">
                          <td className="px-6 py-4">
                            <img
                              src={banner.imageUrl}
                              alt={banner.title}
                              className="w-20 h-12 object-cover rounded"
                            />
                          </td>
                          <td className="px-6 py-4 text-white font-semibold">{banner.title}</td>
                          <td className="px-6 py-4">
                            <span className="bg-neon-purple/10 px-2 py-1 rounded text-xs text-gray-300">
                              {banner.position}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleBannerStatus(banner._id, banner.status)}
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                banner.status === 'active'
                                  ? 'bg-green-500 bg-opacity-20 text-green-400 hover:bg-opacity-30'
                                  : 'bg-gray-500 bg-opacity-20 text-gray-400 hover:bg-opacity-30'
                              } transition-colors`}
                            >
                              {banner.status}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            <div className="flex items-center space-x-1">
                              <FiEye className="text-blue-400" />
                              <span>{banner.analytics?.views || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-300">{banner.analytics?.clicks || 0}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => window.open(banner.ctaLink, '_blank')}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="Preview Banner"
                              >
                                <FiEye size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingBanner(banner);
                                  setShowBannerModal(true);
                                }}
                                className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                title="Edit Banner"
                              >
                                <FiEdit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteBanner(banner._id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Delete Banner"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {banners.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-neon rounded-lg p-6 border border-neon-purple/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Banner Views</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {banners.reduce((sum, b) => sum + (b.analytics?.views || 0), 0).toLocaleString()}
                      </p>
                    </div>
                    <FiEye className="text-blue-400 text-3xl opacity-50" />
                  </div>
                </div>
                <div className="glass-neon rounded-lg p-6 border border-neon-purple/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Banner Clicks</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {banners.reduce((sum, b) => sum + (b.analytics?.clicks || 0), 0).toLocaleString()}
                      </p>
                    </div>
                    <FiTrendingUp className="text-green-400 text-3xl opacity-50" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
