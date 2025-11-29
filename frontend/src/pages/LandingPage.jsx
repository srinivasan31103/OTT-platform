import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Check, Star, Tv, Film, Zap, Users, Shield, Download } from 'lucide-react';
import apiClient from '../api/apiClient';

const LandingPage = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [featuredContent, setFeaturedContent] = useState([]);

  useEffect(() => {
    fetchBanners();
    fetchFeaturedContent();
  }, []);

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const fetchBanners = async () => {
    try {
      const response = await apiClient.get('/banners/active?page=home');
      if (response.data.success) {
        setBanners(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const fetchFeaturedContent = async () => {
    try {
      const response = await apiClient.get('/movies?limit=6&featured=true');
      if (response.data.success) {
        setFeaturedContent(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const handleBannerClick = async (banner) => {
    try {
      await apiClient.post(`/banners/${banner._id}/click`);
      if (banner.ctaLink) {
        navigate(banner.ctaLink);
      }
    } catch (error) {
      console.error('Error tracking banner click:', error);
    }
  };

  const currentBanner = banners[currentBannerIndex];

  const plans = [
    {
      name: 'Basic',
      price: '₹199',
      period: '/month',
      features: [
        'Watch on 1 device',
        '480p Quality',
        'Unlimited movies & shows',
        'Cancel anytime'
      ],
      popular: false
    },
    {
      name: 'Standard',
      price: '₹499',
      period: '/month',
      features: [
        'Watch on 2 devices',
        '1080p Quality',
        'Unlimited movies & shows',
        'Download on 2 devices',
        'Cancel anytime'
      ],
      popular: true
    },
    {
      name: 'Premium',
      price: '₹799',
      period: '/month',
      features: [
        'Watch on 4 devices',
        '4K + HDR Quality',
        'Unlimited movies & shows',
        'Download on 4 devices',
        'Priority support',
        'Cancel anytime'
      ],
      popular: false
    }
  ];

  const features = [
    {
      icon: <Film className="w-8 h-8" />,
      title: 'Unlimited Entertainment',
      description: 'Stream thousands of movies, series, and exclusive content'
    },
    {
      icon: <Tv className="w-8 h-8" />,
      title: 'Watch Anywhere',
      description: 'Enjoy on your TV, laptop, phone, and tablet'
    },
    {
      icon: <Download className="w-8 h-8" />,
      title: 'Download & Go',
      description: 'Download your favorites and watch offline'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Create Profiles',
      description: 'Separate profiles for kids and adults with parental controls'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Live TV Channels',
      description: 'Watch live sports, news, and entertainment channels'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Safe & Secure',
      description: 'Protected payments and secure streaming'
    }
  ];

  return (
    <div className="min-h-screen gradient-dark text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-neon">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-neon-purple to-neon-pink rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
              style={{
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(236, 72, 153, 0.4)'
              }}
            >
              <span className="text-white font-black text-xl relative z-10">SV</span>
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-white to-neon-purple bg-clip-text text-transparent">StreamVerse</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-gray-300 hover:text-white transition-all duration-300"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn-neon"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Banner Section */}
      {currentBanner ? (
        <div className="relative h-screen particles-bg">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${currentBanner.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 overlay-neon" />
            <div className="absolute inset-0 overlay-glow" />
          </div>

          <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
            <div className="max-w-2xl">
              <h1 className="heading-hero mb-6 animate-slide-up">{currentBanner.title}</h1>
              {currentBanner.subtitle && (
                <p className="text-2xl mb-6 text-gray-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>{currentBanner.subtitle}</p>
              )}
              {currentBanner.description && (
                <p className="text-lg mb-8 text-gray-400 animate-slide-up" style={{ animationDelay: '0.2s' }}>{currentBanner.description}</p>
              )}
              <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <button
                  onClick={() => handleBannerClick(currentBanner)}
                  className="btn-neon flex items-center gap-3"
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  <span>{currentBanner.ctaText || 'Watch Now'}</span>
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="btn-hologram flex items-center gap-2"
                >
                  Sign Up Free
                </button>
              </div>
            </div>
          </div>

          {/* Banner Indicators with neon effect */}
          {banners.length > 1 && (
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBannerIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentBannerIndex
                      ? 'bg-neon-purple w-8'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  style={index === currentBannerIndex ? {
                    boxShadow: '0 0 10px rgba(168, 85, 247, 0.8)'
                  } : {}}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Default Hero if no banners
        <div className="relative h-screen particles-bg overflow-hidden">
          <div className="absolute inset-0 overlay-neon" />
          <div className="absolute inset-0 overlay-glow" />
          <div className="relative z-10 container mx-auto px-6 h-full flex items-center justify-center text-center">
            <div className="max-w-4xl">
              <h1 className="heading-hero mb-6 animate-slide-up">
                Unlimited movies, TV shows, and more
              </h1>
              <p className="text-2xl mb-8 text-gray-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                Watch anywhere. Cancel anytime.
              </p>
              <button
                onClick={() => navigate('/register')}
                className="btn-neon text-xl animate-slide-up"
                style={{ animationDelay: '0.4s' }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <section className="section-spacing gradient-dark">
        <div className="container mx-auto px-6">
          <h2 className="heading-section text-center mb-16">Why Choose StreamVerse?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-holographic card-spacing hover-float group cursor-pointer"
              >
                <div className="text-neon-purple mb-4 group-hover:text-neon-pink transition-all duration-300 group-hover:scale-110 inline-block">{feature.icon}</div>
                <h3 className="heading-card mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Content Preview */}
      {featuredContent.length > 0 && (
        <section className="section-spacing gradient-dark">
          <div className="container mx-auto px-6">
            <h2 className="heading-section mb-12">Trending Now</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {featuredContent.map((content) => (
                <div
                  key={content._id}
                  className="group cursor-pointer hover-float"
                  onClick={() => navigate('/register')}
                >
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden card-neon">
                    <img
                      src={content.poster || content.backdrop}
                      alt={content.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-streamverse-darker via-transparent to-transparent opacity-60" />
                    <div className="absolute inset-0 bg-neon-purple/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" fill="currentColor" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="font-bold truncate text-white">{content.title}</h3>
                    {content.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-neon-orange" fill="currentColor" />
                        <span className="text-gray-400">{content.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      <section className="section-spacing gradient-dark">
        <div className="container mx-auto px-6">
          <h2 className="heading-section text-center mb-4">Choose Your Plan</h2>
          <p className="text-xl text-gray-400 text-center mb-16">
            No contracts. No hidden fees. Cancel anytime.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative card-spacing transition-all duration-500 ${
                  plan.popular
                    ? 'card-cyber transform scale-105 hover:scale-110'
                    : 'card-holographic hover:scale-105'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="badge-neon">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="heading-card mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">{plan.price}</span>
                    <span className="text-gray-400 ml-2">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-neon-green mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate('/register')}
                  className={`w-full py-3 rounded-full font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'btn-neon'
                      : 'btn-hologram'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-spacing gradient-dark">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="heading-section text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'What is StreamVerse?',
                a: 'StreamVerse is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries, and more on thousands of internet-connected devices.'
              },
              {
                q: 'How much does StreamVerse cost?',
                a: 'Watch StreamVerse on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee. Plans range from ₹199 to ₹799 a month. No extra costs, no contracts.'
              },
              {
                q: 'Where can I watch?',
                a: 'Watch anywhere, anytime. Sign in with your StreamVerse account to watch instantly on the web or on any internet-connected device that offers the StreamVerse app.'
              },
              {
                q: 'How do I cancel?',
                a: 'StreamVerse is flexible. There are no contracts or commitments. You can easily cancel your account online in two clicks. There are no cancellation fees.'
              },
              {
                q: 'What can I watch on StreamVerse?',
                a: 'StreamVerse has an extensive library of feature films, documentaries, TV shows, anime, and more. Watch as much as you want, anytime you want.'
              }
            ].map((faq, index) => (
              <details
                key={index}
                className="glass-neon p-6 rounded-2xl hover:bg-neon-purple/5 transition-all duration-300 group"
              >
                <summary className="text-xl font-semibold cursor-pointer text-white group-hover:text-neon-purple transition-colors duration-300">
                  {faq.q}
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing particles-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/30 via-neon-pink/30 to-neon-cyan/30" />
        <div className="absolute inset-0 overlay-glow" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-neon-purple to-neon-cyan bg-clip-text text-transparent animate-slide-up">
            Ready to watch?
          </h2>
          <p className="text-2xl mb-8 text-gray-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Enter your email to create or restart your membership.
          </p>
          <div className="flex justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <button
              onClick={() => navigate('/register')}
              className="btn-neon text-xl px-16 py-5 hover:scale-110"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="gradient-dark py-12 border-t border-neon-purple/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 text-neon-purple">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-neon-purple transition-colors duration-300">About Us</a></li>
                <li><a href="#" className="hover:text-neon-purple transition-colors duration-300">Careers</a></li>
                <li><a href="#" className="hover:text-neon-purple transition-colors duration-300">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-neon-pink">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-neon-pink transition-colors duration-300">Help Center</a></li>
                <li><a href="#" className="hover:text-neon-pink transition-colors duration-300">Contact Us</a></li>
                <li><a href="#" className="hover:text-neon-pink transition-colors duration-300">Terms of Use</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-neon-cyan">Account</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-neon-cyan transition-colors duration-300">Manage Profile</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors duration-300">Watchlist</a></li>
                <li><a href="#" className="hover:text-neon-cyan transition-colors duration-300">Subscription</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-neon-green">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-neon-green transition-colors duration-300">Facebook</a></li>
                <li><a href="#" className="hover:text-neon-green transition-colors duration-300">Twitter</a></li>
                <li><a href="#" className="hover:text-neon-green transition-colors duration-300">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-gray-500 pt-8 border-t border-neon-purple/20">
            <p className="bg-gradient-to-r from-gray-500 to-gray-400 bg-clip-text text-transparent">&copy; 2025 StreamVerse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
