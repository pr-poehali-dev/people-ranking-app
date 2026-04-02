import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { politicians, Politician, Law } from '@/data/politicians';
import RatingsTab from '@/components/RatingsTab';
import LawsTab from '@/components/LawsTab';
import ProfilesTab from '@/components/ProfilesTab';
import AnalyticsTab from '@/components/AnalyticsTab';

const VOTE_URL = 'https://functions.poehali.dev/9250ac35-2a1f-44b6-9e78-68fd1f622283';

interface LiveRating {
  up: number;
  down: number;
  total: number;
  rating: number;
}

type Tab = 'ratings' | 'laws' | 'profiles' | 'analytics';

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>('ratings');
  const [selectedPolitician, setSelectedPolitician] = useState<Politician | null>(null);
  const [selectedLaw, setSelectedLaw] = useState<Law | null>(null);
  const [localVotes, setLocalVotes] = useState<Record<number, { up: number; down: number; voted?: 'up' | 'down' }>>({});
  const [liveRatings, setLiveRatings] = useState<Record<string, LiveRating>>({});
  const [myVotes, setMyVotes] = useState<Record<number, 'up' | 'down' | null>>({});
  const [votingLoading, setVotingLoading] = useState<Record<number, boolean>>({});

  const fetchRatings = useCallback(async () => {
    try {
      const res = await fetch(VOTE_URL);
      const data = await res.json();
      setLiveRatings(data);
    } catch (e) {
      console.error('Failed to fetch ratings', e);
    }
  }, []);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const getRating = useCallback((p: Politician) => {
    const live = liveRatings[String(p.id)];
    if (live && live.total > 0) return live.rating;
    return p.approvalRating;
  }, [liveRatings]);

  const getVoteCount = useCallback((p: Politician) => {
    const live = liveRatings[String(p.id)];
    if (live && live.total > 0) return live.total;
    return p.totalVotes;
  }, [liveRatings]);

  const handleVote = (lawId: number, type: 'up' | 'down') => {
    setLocalVotes(prev => {
      const current = prev[lawId] || { up: 0, down: 0 };
      if (current.voted === type) return prev;
      return {
        ...prev,
        [lawId]: {
          up: type === 'up' ? current.up + 1 : current.voted === 'up' ? current.up - 1 : current.up,
          down: type === 'down' ? current.down + 1 : current.voted === 'down' ? current.down - 1 : current.down,
          voted: type,
        }
      };
    });
  };

  const handleRatingVote = async (politicianId: number, type: 'up' | 'down') => {
    if (votingLoading[politicianId]) return;
    setVotingLoading(prev => ({ ...prev, [politicianId]: true }));
    try {
      const res = await fetch(VOTE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ politician_id: politicianId, vote_type: type }),
      });
      const data = await res.json();
      setMyVotes(prev => ({ ...prev, [politicianId]: data.my_vote }));
      setLiveRatings(prev => ({
        ...prev,
        [String(politicianId)]: {
          up: data.up,
          down: data.down,
          total: data.total,
          rating: data.rating,
        },
      }));
    } catch (e) {
      console.error('Vote failed', e);
    } finally {
      setVotingLoading(prev => ({ ...prev, [politicianId]: false }));
    }
  };

  const sortedByRating = [...politicians].sort((a, b) => getRating(b) - getRating(a));
  const allLaws = politicians.flatMap(p => p.laws.map(l => ({ ...l, politician: p })));

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'ratings', label: 'Рейтинги', icon: 'TrendingUp' },
    { id: 'laws', label: 'Законы', icon: 'ScrollText' },
    { id: 'profiles', label: 'Профили', icon: 'Users' },
    { id: 'analytics', label: 'Аналитика', icon: 'BarChart3' },
  ];

  const handleSelectLawFromProfile = (law: Law) => {
    setSelectedLaw(law);
    setActiveTab('laws');
  };

  const handleSelectLawFromAnalytics = (law: Law) => {
    setSelectedLaw(law);
    setActiveTab('laws');
  };

  const handleSelectPoliticianFromRating = (p: Politician) => {
    setSelectedPolitician(p);
    setActiveTab('profiles');
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh noise-overlay">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center pulse-neon">
              <Icon name="Landmark" size={18} className="text-primary" />
            </div>
            <div>
              <h1 className="font-oswald text-xl font-bold tracking-wide neon-text">ПОЛИТРЕЙТИНГ</h1>
              <p className="text-xs text-muted-foreground">Независимая оценка власти</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs text-accent font-medium">
                {Object.values(liveRatings).reduce((s, r) => s + r.total, 0) > 0
                  ? `${Object.values(liveRatings).reduce((s, r) => s + r.total, 0).toLocaleString()} голосов`
                  : 'Голосование открыто'}
              </span>
            </div>
            <button className="w-9 h-9 rounded-lg border border-border hover:border-primary/50 flex items-center justify-center transition-colors">
              <Icon name="Bell" size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="max-w-7xl mx-auto px-4 pb-0 flex gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedPolitician(null); setSelectedLaw(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={tab.icon} size={15} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'ratings' && (
          <RatingsTab
            sortedByRating={sortedByRating}
            getRating={getRating}
            getVoteCount={getVoteCount}
            myVotes={myVotes}
            votingLoading={votingLoading}
            handleRatingVote={handleRatingVote}
            onSelectPolitician={handleSelectPoliticianFromRating}
          />
        )}

        {activeTab === 'laws' && (
          <LawsTab
            allLaws={allLaws}
            localVotes={localVotes}
            handleVote={handleVote}
            selectedLaw={selectedLaw}
            setSelectedLaw={setSelectedLaw}
          />
        )}

        {activeTab === 'profiles' && (
          <ProfilesTab
            selectedPolitician={selectedPolitician}
            setSelectedPolitician={setSelectedPolitician}
            getRating={getRating}
            getVoteCount={getVoteCount}
            localVotes={localVotes}
            onSelectLaw={handleSelectLawFromProfile}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            sortedByRating={sortedByRating}
            allLaws={allLaws}
            liveRatings={liveRatings}
            getRating={getRating}
            onSelectLaw={handleSelectLawFromAnalytics}
          />
        )}
      </main>
    </div>
  );
}
