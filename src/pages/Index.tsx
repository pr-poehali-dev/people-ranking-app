import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { politicians, Politician, Law } from '@/data/politicians';

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
  const [commentText, setCommentText] = useState('');
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

  const getRating = (p: Politician) => {
    const live = liveRatings[String(p.id)];
    if (live && live.total > 0) return live.rating;
    return p.approvalRating;
  };

  const getVoteCount = (p: Politician) => {
    const live = liveRatings[String(p.id)];
    if (live && live.total > 0) return live.total;
    return p.totalVotes;
  };

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

        {/* === RATINGS === */}
        {activeTab === 'ratings' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-oswald text-3xl font-bold text-foreground">Рейтинг политиков</h2>
                <p className="text-muted-foreground mt-1">Актуально на апрель 2026</p>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="RefreshCw" size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Обновлено 2 апр</span>
              </div>
            </div>

            {/* Top 3 podium */}
            <div className="grid grid-cols-3 gap-3">
              {sortedByRating.slice(0, 3).map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => { setSelectedPolitician(p); setActiveTab('profiles'); }}
                  className={`relative card-glow rounded-2xl bg-card p-4 cursor-pointer ${i === 0 ? 'ring-1 ring-yellow-500/40' : ''}`}
                >
                  <div className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : 'rank-3'}`}>
                    {i + 1}
                  </div>
                  <img src={p.photo} alt={p.name} className="w-14 h-14 rounded-xl object-cover mb-3" />
                  <h3 className="font-oswald font-semibold text-sm leading-tight">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-3">{p.position}</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className={`text-lg font-oswald font-bold ${getRating(p) >= 60 ? 'neon-green-text' : getRating(p) >= 45 ? 'text-yellow-400' : 'neon-red-text'}`}>
                        {getRating(p)}%
                      </span>
                      <span className="text-xs flex items-center gap-1 text-muted-foreground">
                        <Icon name="Users" size={12} />
                        {getVoteCount(p).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full rating-bar-fill ${getRating(p) >= 60 ? 'bg-accent' : getRating(p) >= 45 ? 'bg-yellow-400' : 'bg-destructive'}`}
                        style={{ width: `${getRating(p)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Full list */}
            <div className="space-y-3">
              {sortedByRating.map((p, i) => (
                <div key={p.id} className="card-glow rounded-2xl bg-card p-4 flex items-center gap-4">
                  <span className={`w-8 text-center font-oswald font-bold text-lg ${i < 3 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                    {i + 1}
                  </span>
                  <img src={p.photo} alt={p.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm">{p.name}</h3>
                        <p className="text-xs text-muted-foreground">{p.position} · {p.region}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`font-oswald font-bold text-xl ${getRating(p) >= 60 ? 'neon-green-text' : getRating(p) >= 45 ? 'text-yellow-400' : 'neon-red-text'}`}>
                          {getRating(p)}%
                        </div>
                        <div className="text-xs flex items-center justify-end gap-0.5 text-muted-foreground">
                          <Icon name="Users" size={11} />
                          {getVoteCount(p).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getRating(p) >= 60 ? 'bg-accent' : getRating(p) >= 45 ? 'bg-yellow-400' : 'bg-destructive'}`}
                        style={{ width: `${getRating(p)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => handleRatingVote(p.id, 'up')}
                      disabled={votingLoading[p.id]}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${myVotes[p.id] === 'up' ? 'bg-accent/20 border border-accent text-accent' : 'border border-border hover:border-accent/50 text-muted-foreground hover:text-accent'} disabled:opacity-50`}
                    >
                      {votingLoading[p.id] ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="ThumbsUp" size={15} />}
                    </button>
                    <button
                      onClick={() => handleRatingVote(p.id, 'down')}
                      disabled={votingLoading[p.id]}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${myVotes[p.id] === 'down' ? 'bg-destructive/20 border border-destructive text-destructive' : 'border border-border hover:border-destructive/50 text-muted-foreground hover:text-destructive'} disabled:opacity-50`}
                    >
                      <Icon name="ThumbsDown" size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === LAWS === */}
        {activeTab === 'laws' && !selectedLaw && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-oswald text-3xl font-bold">Законы и предложения</h2>
              <p className="text-muted-foreground mt-1">Все инициативы с оценками граждан</p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {['Все', 'Экономика', 'Образование', 'ЖКХ', 'Инфраструктура', 'Наука'].map(cat => (
                <button key={cat} className="px-3 py-1.5 rounded-full text-xs border border-border hover:border-primary/50 hover:text-primary transition-colors">
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {allLaws.map((law) => {
                const local = localVotes[law.id] || { up: 0, down: 0 };
                const totalUp = law.votes.up + local.up;
                const totalDown = law.votes.down + local.down;
                const total = totalUp + totalDown;
                const pct = total > 0 ? Math.round((totalUp / total) * 100) : 50;
                return (
                  <div
                    key={`${law.politician.id}-${law.id}`}
                    className="card-glow rounded-2xl bg-card p-5 cursor-pointer"
                    onClick={() => setSelectedLaw({ ...law })}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            law.impact === 'positive' ? 'bg-accent/15 text-accent' :
                            law.impact === 'negative' ? 'bg-destructive/15 text-destructive' :
                            'bg-secondary text-muted-foreground'
                          }`}>
                            {law.impact === 'positive' ? '✓ Положительный' : law.impact === 'negative' ? '✗ Отрицательный' : '~ Нейтральный'}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{law.category}</span>
                        </div>
                        <h3 className="font-oswald font-semibold text-base">{law.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{law.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <img src={law.politician.photo} alt={law.politician.name} className="w-7 h-7 rounded-lg object-cover" />
                      <span className="text-sm text-muted-foreground">{law.politician.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{law.date}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="neon-green-text font-medium">За: {totalUp.toLocaleString()}</span>
                        <span className="font-semibold">{pct}%</span>
                        <span className="neon-red-text font-medium">Против: {totalDown.toLocaleString()}</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden flex">
                        <div className="bg-accent rounded-l-full transition-all duration-700" style={{ width: `${pct}%` }} />
                        <div className="bg-destructive rounded-r-full flex-1" />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                      <button
                        onClick={e => { e.stopPropagation(); handleVote(law.id, 'up'); }}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${localVotes[law.id]?.voted === 'up' ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}
                      >
                        <Icon name="ThumbsUp" size={14} />
                        Поддержать
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleVote(law.id, 'down'); }}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${localVotes[law.id]?.voted === 'down' ? 'text-destructive' : 'text-muted-foreground hover:text-destructive'}`}
                      >
                        <Icon name="ThumbsDown" size={14} />
                        Против
                      </button>
                      <span className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Icon name="MessageCircle" size={14} />
                        {law.comments.length} комм.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Law detail */}
        {activeTab === 'laws' && selectedLaw && (
          <div className="space-y-5 animate-fade-in">
            <button onClick={() => setSelectedLaw(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="ArrowLeft" size={16} />
              Назад к законам
            </button>

            <div className="card-glow rounded-2xl bg-card p-6">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  selectedLaw.impact === 'positive' ? 'bg-accent/15 text-accent' :
                  selectedLaw.impact === 'negative' ? 'bg-destructive/15 text-destructive' :
                  'bg-secondary text-muted-foreground'
                }`}>
                  {selectedLaw.impact === 'positive' ? '✓ Положительный' : selectedLaw.impact === 'negative' ? '✗ Отрицательный' : '~ Нейтральный'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{selectedLaw.category}</span>
                <span className="text-xs text-muted-foreground ml-auto">{selectedLaw.date}</span>
              </div>
              <h2 className="font-oswald text-2xl font-bold mb-3">{selectedLaw.title}</h2>
              <p className="text-muted-foreground">{selectedLaw.description}</p>

              <div className="mt-5 space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="neon-green-text">За: {(selectedLaw.votes.up + (localVotes[selectedLaw.id]?.up || 0)).toLocaleString()}</span>
                  <span className="neon-red-text">Против: {(selectedLaw.votes.down + (localVotes[selectedLaw.id]?.down || 0)).toLocaleString()}</span>
                </div>
                <div className="h-3 rounded-full bg-secondary overflow-hidden flex">
                  {(() => {
                    const up = selectedLaw.votes.up + (localVotes[selectedLaw.id]?.up || 0);
                    const down = selectedLaw.votes.down + (localVotes[selectedLaw.id]?.down || 0);
                    const pct = Math.round((up / (up + down)) * 100);
                    return <><div className="bg-accent rounded-l-full transition-all duration-700" style={{ width: `${pct}%` }} /><div className="bg-destructive rounded-r-full flex-1" /></>;
                  })()}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleVote(selectedLaw.id, 'up')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    localVotes[selectedLaw.id]?.voted === 'up'
                      ? 'bg-accent/20 border-accent text-accent'
                      : 'border-border hover:border-accent/50 text-muted-foreground hover:text-accent'
                  }`}
                >
                  <Icon name="ThumbsUp" size={16} /> Поддержать
                </button>
                <button
                  onClick={() => handleVote(selectedLaw.id, 'down')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    localVotes[selectedLaw.id]?.voted === 'down'
                      ? 'bg-destructive/20 border-destructive text-destructive'
                      : 'border-border hover:border-destructive/50 text-muted-foreground hover:text-destructive'
                  }`}
                >
                  <Icon name="ThumbsDown" size={16} /> Против
                </button>
              </div>
            </div>

            {/* Comments */}
            <div>
              <h3 className="font-oswald text-xl font-bold mb-4">Обсуждение ({selectedLaw.comments.length})</h3>
              <div className="space-y-3 mb-4">
                {selectedLaw.comments.map(c => (
                  <div key={c.id} className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-base">{c.avatar}</div>
                      <div>
                        <span className="text-sm font-medium">{c.author}</span>
                        <span className="text-xs text-muted-foreground ml-2">{c.date}</span>
                      </div>
                      <button className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors">
                        <Icon name="Heart" size={12} /> {c.likes}
                      </button>
                    </div>
                    <p className="text-sm text-foreground/90">{c.text}</p>
                  </div>
                ))}
              </div>

              <div className="glass rounded-xl p-4">
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Напишите ваше мнение об этом законе..."
                  className="w-full bg-transparent text-sm resize-none outline-none text-foreground placeholder:text-muted-foreground min-h-[80px]"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setCommentText('')}
                    disabled={!commentText.trim()}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 transition-opacity hover:opacity-90"
                  >
                    Отправить
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === PROFILES === */}
        {activeTab === 'profiles' && !selectedPolitician && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-oswald text-3xl font-bold">Профили политиков</h2>
              <p className="text-muted-foreground mt-1">Подробная информация и деятельность</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {politicians.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPolitician(p)}
                  className="card-glow rounded-2xl bg-card overflow-hidden cursor-pointer"
                >
                  <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/5 relative">
                    <img src={p.photo} alt={p.name} className="absolute bottom-0 left-4 w-20 h-20 rounded-xl object-cover border-2 border-card" />
                    <div className="absolute top-3 right-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRating(p) >= 60 ? 'bg-accent/20 text-accent' : getRating(p) >= 45 ? 'bg-yellow-400/20 text-yellow-400' : 'bg-destructive/20 text-destructive'}`}>
                        {getRating(p)}%
                      </span>
                    </div>
                  </div>
                  <div className="p-4 pt-5">
                    <h3 className="font-oswald font-bold text-lg">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">{p.position}</p>
                    <p className="text-xs text-primary mt-0.5">{p.party}</p>
                    <div className="flex gap-1 flex-wrap mt-3">
                      {p.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
                      <div className="text-center">
                        <div className="font-oswald font-bold text-lg text-primary">{p.lawsCount}</div>
                        <div className="text-xs text-muted-foreground">Законов</div>
                      </div>
                      <div className="text-center">
                        <div className="font-oswald font-bold text-lg text-accent">{p.achievementsCount}</div>
                        <div className="text-xs text-muted-foreground">Достиж.</div>
                      </div>
                      <div className="text-center">
                        <div className="font-oswald font-bold text-lg text-foreground">{p.stats.attendance}%</div>
                        <div className="text-xs text-muted-foreground">Явка</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile detail */}
        {activeTab === 'profiles' && selectedPolitician && (
          <div className="space-y-5 animate-fade-in">
            <button onClick={() => setSelectedPolitician(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Icon name="ArrowLeft" size={16} />
              Назад к профилям
            </button>

            {/* Profile header */}
            <div className="card-glow rounded-2xl bg-card overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-primary/15 via-accent/5 to-transparent relative">
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                <img src={selectedPolitician.photo} alt={selectedPolitician.name} className="absolute bottom-0 left-6 w-24 h-24 rounded-2xl object-cover border-2 border-card" />
              </div>
              <div className="p-6 pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-oswald text-2xl font-bold">{selectedPolitician.name}</h2>
                    <p className="text-muted-foreground">{selectedPolitician.position}</p>
                    <p className="text-primary text-sm">{selectedPolitician.party} · {selectedPolitician.region}</p>
                  </div>
                  <div className="text-right">
                    <div className={`font-oswald text-3xl font-bold ${getRating(selectedPolitician) >= 60 ? 'neon-green-text' : getRating(selectedPolitician) >= 45 ? 'text-yellow-400' : 'neon-red-text'}`}>
                      {getRating(selectedPolitician)}%
                    </div>
                    <div className="text-xs text-muted-foreground">{getVoteCount(selectedPolitician).toLocaleString()} голосов</div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{selectedPolitician.bio}</p>
                <div className="flex gap-1 flex-wrap mt-3">
                  {selectedPolitician.tags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Законов предложено', value: selectedPolitician.stats.lawsProposed, icon: 'FileText', color: 'text-primary' },
                { label: 'Принято', value: selectedPolitician.stats.lawsPassed, icon: 'CheckCircle', color: 'neon-green-text' },
                { label: 'Явка', value: `${selectedPolitician.stats.attendance}%`, icon: 'UserCheck', color: 'text-accent' },
                { label: 'Лет в должности', value: selectedPolitician.stats.yearsInOffice, icon: 'Calendar', color: 'text-muted-foreground' },
              ].map(s => (
                <div key={s.label} className="glass rounded-xl p-4 text-center">
                  <Icon name={s.icon} size={20} className={`mx-auto mb-2 ${s.color}`} />
                  <div className={`font-oswald font-bold text-2xl ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Laws of politician */}
            <div>
              <h3 className="font-oswald text-xl font-bold mb-4">Законодательная деятельность</h3>
              <div className="space-y-3">
                {selectedPolitician.laws.map(law => {
                  const local = localVotes[law.id] || { up: 0, down: 0 };
                  const totalUp = law.votes.up + local.up;
                  const totalDown = law.votes.down + local.down;
                  const pct = Math.round((totalUp / (totalUp + totalDown)) * 100);
                  return (
                    <div
                      key={law.id}
                      className="card-glow rounded-xl bg-card p-4 cursor-pointer"
                      onClick={() => { setSelectedLaw(law); setActiveTab('laws'); }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              law.impact === 'positive' ? 'bg-accent/15 text-accent' :
                              law.impact === 'negative' ? 'bg-destructive/15 text-destructive' :
                              'bg-secondary text-muted-foreground'
                            }`}>
                              {law.impact === 'positive' ? '✓' : law.impact === 'negative' ? '✗' : '~'} {law.category}
                            </span>
                            <span className="text-xs text-muted-foreground">{law.date}</span>
                          </div>
                          <h4 className="font-semibold text-sm">{law.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{law.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className={`font-oswald font-bold text-lg ${pct >= 60 ? 'neon-green-text' : pct >= 40 ? 'text-yellow-400' : 'neon-red-text'}`}>{pct}%</div>
                          <div className="text-xs text-muted-foreground">{law.comments.length} комм.</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* === ANALYTICS === */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-oswald text-3xl font-bold">Статистика и аналитика</h2>
              <p className="text-muted-foreground mt-1">Обзор политической активности</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Всего политиков', value: politicians.length, sub: 'в базе', icon: 'Users', color: 'text-primary' },
                { label: 'Законов в базе', value: allLaws.length, sub: 'за 2023–2024', icon: 'ScrollText', color: 'text-accent' },
                { label: 'Голосов подано', value: Object.values(liveRatings).reduce((s, r) => s + r.total, 0) > 0 ? Object.values(liveRatings).reduce((s, r) => s + r.total, 0).toLocaleString() : '0', sub: 'гражданами', icon: 'Vote', color: 'text-yellow-400' },
                { label: 'Средний рейтинг', value: `${Math.round(politicians.reduce((s, p) => s + getRating(p), 0) / politicians.length)}%`, sub: 'одобрения', icon: 'Star', color: 'neon-green-text' },
              ].map(s => (
                <div key={s.label} className="card-glow rounded-2xl bg-card p-5">
                  <Icon name={s.icon} size={22} className={s.color} />
                  <div className={`font-oswald font-bold text-3xl mt-3 ${s.color}`}>{s.value}</div>
                  <div className="text-sm font-medium mt-1">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Rating comparison */}
            <div className="card-glow rounded-2xl bg-card p-6">
              <h3 className="font-oswald text-xl font-bold mb-5">Сравнение рейтингов</h3>
              <div className="space-y-4">
                {sortedByRating.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="w-5 text-xs text-muted-foreground text-right">{i + 1}</span>
                    <img src={p.photo} alt={p.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium truncate">{p.name}</span>
                        <span className={`text-sm font-oswald font-bold ml-2 ${getRating(p) >= 60 ? 'neon-green-text' : getRating(p) >= 45 ? 'text-yellow-400' : 'neon-red-text'}`}>
                          {getRating(p)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${getRating(p) >= 60 ? 'bg-accent' : getRating(p) >= 45 ? 'bg-yellow-400' : 'bg-destructive'}`}
                          style={{ width: `${getRating(p)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Laws by impact */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Положительных', count: allLaws.filter(l => l.impact === 'positive').length, color: 'bg-accent', textColor: 'text-accent', icon: 'TrendingUp' },
                { label: 'Нейтральных', count: allLaws.filter(l => l.impact === 'neutral').length, color: 'bg-yellow-400', textColor: 'text-yellow-400', icon: 'Minus' },
                { label: 'Отрицательных', count: allLaws.filter(l => l.impact === 'negative').length, color: 'bg-destructive', textColor: 'text-destructive', icon: 'TrendingDown' },
              ].map(s => (
                <div key={s.label} className="card-glow rounded-2xl bg-card p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${s.color}/15 flex items-center justify-center`}>
                      <Icon name={s.icon} size={18} className={s.textColor} />
                    </div>
                    <span className="text-sm text-muted-foreground">{s.label} законов</span>
                  </div>
                  <div className={`font-oswald font-bold text-4xl ${s.textColor}`}>{s.count}</div>
                  <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${(s.count / allLaws.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Top discussed laws */}
            <div className="card-glow rounded-2xl bg-card p-6">
              <h3 className="font-oswald text-xl font-bold mb-5">Самые обсуждаемые законы</h3>
              <div className="space-y-3">
                {[...allLaws].sort((a, b) => b.comments.length - a.comments.length).slice(0, 4).map((law, i) => (
                  <div
                    key={`top-${law.politician.id}-${law.id}`}
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => { setSelectedLaw(law); setActiveTab('laws'); }}
                  >
                    <span className="w-6 text-center font-oswald font-bold text-muted-foreground">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{law.title}</div>
                      <div className="text-xs text-muted-foreground">{law.politician.name}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Icon name="MessageCircle" size={12} />
                      {law.comments.length}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}