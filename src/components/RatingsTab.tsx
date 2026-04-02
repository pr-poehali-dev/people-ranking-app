import Icon from '@/components/ui/icon';
import { Politician } from '@/data/politicians';

interface RatingsTabProps {
  sortedByRating: Politician[];
  getRating: (p: Politician) => number;
  getVoteCount: (p: Politician) => number;
  myVotes: Record<number, 'up' | 'down' | null>;
  votingLoading: Record<number, boolean>;
  handleRatingVote: (politicianId: number, type: 'up' | 'down') => void;
  onSelectPolitician: (p: Politician) => void;
}

export default function RatingsTab({
  sortedByRating,
  getRating,
  getVoteCount,
  myVotes,
  votingLoading,
  handleRatingVote,
  onSelectPolitician,
}: RatingsTabProps) {
  return (
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
            onClick={() => onSelectPolitician(p)}
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
  );
}
