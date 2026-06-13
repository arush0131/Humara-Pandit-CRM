import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Video, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight, 
  Star, 
  CalendarDays,
  Flame,
  Globe,
  Wind,
  Droplet
} from 'lucide-react';

// Helper to determine zodiac sign & element
const getZodiacDetails = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const month = d.getMonth() + 1;
  const day = d.getDate();

  let sign = 'Aries';
  let element = 'Fire';
  let symbol = '♈';
  let traits = 'Energetic, passionate, bold, and pioneering.';

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    sign = 'Aries'; element = 'Fire'; symbol = '♈'; traits = 'Energetic, passionate, bold, and pioneering.';
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    sign = 'Taurus'; element = 'Earth'; symbol = '♉'; traits = 'Reliable, patient, practical, and devoted.';
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    sign = 'Gemini'; element = 'Air'; symbol = '♊'; traits = 'Adaptable, outgoing, intellectual, and witty.';
  } else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    sign = 'Cancer'; element = 'Water'; symbol = '♋'; traits = 'Compassionate, intuitive, protective, and sentimental.';
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    sign = 'Leo'; element = 'Fire'; symbol = '♌'; traits = 'Generous, charismatic, warmhearted, and proud.';
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    sign = 'Virgo'; element = 'Earth'; symbol = '♍'; traits = 'Loyal, analytical, kind, and hardworking.';
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    sign = 'Libra'; element = 'Air'; symbol = '♎'; traits = 'Diplomatic, artistic, social, and harmonious.';
  } else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    sign = 'Scorpio'; element = 'Water'; symbol = '♏'; traits = 'Brave, resourceful, passionate, and focused.';
  } else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    sign = 'Sagittarius'; element = 'Fire'; symbol = '♐'; traits = 'Optimistic, freedom-loving, funny, and generous.';
  } else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    sign = 'Capricorn'; element = 'Earth'; symbol = '♑'; traits = 'Disciplined, responsible, patient, and ambitious.';
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    sign = 'Aquarius'; element = 'Air'; symbol = '♒'; traits = 'Original, independent, humanitarian, and intellectual.';
  } else {
    sign = 'Pisces'; element = 'Water'; symbol = '♓'; traits = 'Compassionate, artistic, intuitive, and wise.';
  }

  return { sign, element, symbol, traits };
};

const Landing = () => {
  const [dob, setDob] = useState('');
  const [zodiacResult, setZodiacResult] = useState(null);
  const navigate = useNavigate();

  const handleZodiacCheck = (e) => {
    e.preventDefault();
    if (!dob) return;
    const result = getZodiacDetails(dob);
    setZodiacResult(result);
  };

  const featuredAstrologers = [
    {
      name: 'Pandit Ramesh Sharma',
      exp: '15+ Years',
      rate: '₹500/hr',
      specialty: 'Vedic Astrology, Kundali Matching',
      rating: '4.9'
    },
    {
      name: 'Acharya Ananya Sen',
      exp: '10 Years',
      rate: '₹600/hr',
      specialty: 'Palmistry, Gemstone Advice, Vastu',
      rating: '4.8'
    },
    {
      name: 'Pandit V. K. Shastri',
      exp: '20+ Years',
      rate: '₹800/hr',
      specialty: 'Kp Astrology, Planetary Remedies',
      rating: '5.0'
    }
  ];

  const getElementIcon = (elem) => {
    switch (elem) {
      case 'Fire': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'Earth': return <Globe className="w-4 h-4 text-emerald-400" />;
      case 'Air': return <Wind className="w-4 h-4 text-sky-400" />;
      case 'Water': return <Droplet className="w-4 h-4 text-blue-400" />;
      default: return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-cosmic-bg text-gray-100 font-sans selection:bg-[#6366f1] selection:text-white flex flex-col relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full bg-slate-950/60 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white animate-float" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">
              Humara Pandit
            </h1>
            <span className="text-[9px] text-indigo-400 font-semibold tracking-widest uppercase block mt-0.5">
              Celestial Portal
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-400">
          <a href="#services" className="hover:text-indigo-300 transition-colors">Services</a>
          <a href="#zodiac" className="hover:text-indigo-300 transition-colors">Zodiac Calculator</a>
          <a href="#featured" className="hover:text-indigo-300 transition-colors">Astrologers</a>
        </nav>

        <button 
          onClick={() => navigate('/login')}
          className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-xs hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/15 cursor-pointer transition-all hover:scale-[1.02]"
        >
          Portal Sign In
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col gap-24 px-6 md:px-12 lg:px-24 py-16 relative z-10">
        
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[60vh]">
          <div className="flex-1 flex flex-col gap-6 text-center lg:text-left">
            <span className="inline-flex self-center lg:self-start items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-300 rounded-full tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Unlock Your Cosmic Blueprint
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-indigo-100 via-indigo-200 to-purple-200">
              Reveal What the Stars Have Aligned for You
            </h2>
            <p className="text-sm md:text-base text-gray-400 max-w-xl leading-relaxed">
              Connect directly with certified Vedic Pandits, view personalized remedies, and query Gemini-powered natal analyses to balance your health, career, and relationships path.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-2">
              <button 
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-xs hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
              >
                <span>Find Your Astrologer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a 
                href="#zodiac"
                className="px-6 py-3 bg-slate-800/60 border border-white/5 hover:border-indigo-500/30 text-gray-300 hover:text-white rounded-xl font-bold text-xs cursor-pointer transition-all"
              >
                Free Zodiac Check
              </a>
            </div>
          </div>

          <div className="flex-1 flex justify-center relative">
            <div className="w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-tr from-indigo-600/15 to-purple-600/10 flex items-center justify-center border border-white/5 relative shadow-inner animate-glow-pulse">
              <div className="w-56 h-56 md:w-80 md:h-80 rounded-full border border-indigo-500/10 flex items-center justify-center absolute">
                {/* Simulated Constellation Rings */}
                <div className="w-full h-full border-t border-indigo-500/30 rounded-full absolute animate-spin" style={{ animationDuration: '40s' }} />
                <div className="w-full h-full border-l border-purple-500/20 rounded-full absolute animate-spin" style={{ animationDuration: '65s' }} />
              </div>
              <div className="w-24 h-24 md:w-36 md:h-36 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-center shadow-2xl relative z-10">
                <span className="text-4xl md:text-5xl animate-float">🔮</span>
              </div>
            </div>
          </div>
        </section>

        {/* Services Showcase */}
        <section id="services" className="flex flex-col gap-10">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-100">Consultation Offerings</h3>
            <p className="text-xs text-gray-400">Services built to bridge standard Vedic traditions with modern intelligence</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel border border-white/5 rounded-3xl p-6 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Video className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-200 text-sm">1-on-1 consultations</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Connect with our certified Pandits via interactive video, voice or chat formats to discuss alignment charts.
              </p>
            </div>

            <div className="glass-panel border border-white/5 rounded-3xl p-6 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <h4 className="font-bold text-gray-200 text-sm">AI Chart Insights</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Unlock instant digital analyses of your planetary transits and natal parameters powered by Gemini models.
              </p>
            </div>

            <div className="glass-panel border border-white/5 rounded-3xl p-6 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-200 text-sm">Remedies & Advice</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Receive suggested gemstones, custom mantras, and actionable advice to balance celestial nodes.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Zodiac Checker */}
        <section id="zodiac" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-5">
            <span className="inline-flex self-start items-center gap-1 px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-bold text-indigo-300 uppercase">
              Quick Calculation
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-100">Find Your Astrological Sign & Element</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every birth chart is shaped by one of the four key elements (Fire, Earth, Air, and Water). Select your date of birth to reveal your zodiac sign, elemental category, and core personality traits instantly.
            </p>
            
            <form onSubmit={handleZodiacCheck} className="flex gap-3 mt-2">
              <div className="relative flex-1">
                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full form-input-cosmic pl-12 text-xs"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md shadow-indigo-600/10 transition-colors"
              >
                Reveal Sign
              </button>
            </form>
          </div>

          <div className="glass-panel border border-white/5 rounded-3xl p-6 min-h-[160px] flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            
            {zodiacResult ? (
              <div className="w-full flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-indigo-950/50 border border-indigo-500/20 flex items-center justify-center text-3xl font-extrabold select-none shrink-0 text-indigo-300">
                  {zodiacResult.symbol}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-gray-100 text-lg">{zodiacResult.sign}</h4>
                    <span className="px-2 py-0.5 bg-slate-800 border border-white/5 rounded-full text-[9px] font-bold text-gray-300 flex items-center gap-1">
                      {getElementIcon(zodiacResult.element)}
                      <span>{zodiacResult.element} Element</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed font-medium">
                    {zodiacResult.traits}
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold tracking-wide text-left mt-1 flex items-center gap-1"
                  >
                    <span>Request AI Chart Guidance</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-500 flex flex-col gap-2 items-center">
                <HelpCircle className="w-8 h-8 text-gray-600" />
                <span>Enter your birth date on the left to reveal celestial configurations.</span>
              </div>
            )}
          </div>
        </section>

        {/* Featured Astrologers Section */}
        <section id="featured" className="flex flex-col gap-10">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-100">Featured Pandits</h3>
            <p className="text-xs text-gray-400">Highly experienced guides and specialists available on the portal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredAstrologers.map((astro, idx) => (
              <div key={idx} className="glass-panel border border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:border-white/10 transition-colors">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-center text-lg">
                      🔮
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" /> {astro.rating}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-200 text-sm">{astro.name}</h4>
                    <span className="text-[9px] text-indigo-400 font-medium block mt-0.5">{astro.specialty}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed font-medium">
                    Specialized Vedic counselor with {astro.exp} experience, facilitating readings and suggestions.
                  </p>
                </div>

                <div className="h-px bg-white/5 w-full my-4" />

                <div className="flex justify-between items-center">
                  <div className="text-xs">
                    <span className="text-gray-500 font-medium block text-[9px] uppercase tracking-wider">Hourly Rate</span>
                    <span className="text-gray-300 font-bold">{astro.rate}</span>
                  </div>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white rounded-lg font-bold text-[10px] border border-white/5 hover:border-indigo-500/20 cursor-pointer transition-all"
                  >
                    Select Guide
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/5 py-8 px-6 md:px-12 text-center flex flex-col gap-3">
        <p className="text-[11px] text-gray-500 font-medium italic">
          "Astrology is a language. If you understand this language, the sky speaks to you."
        </p>
        <div className="h-px bg-white/5 w-24 mx-auto my-2" />
        <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-widest">
          © {new Date().getFullYear()} Humara Pandit Celestial CRM. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
