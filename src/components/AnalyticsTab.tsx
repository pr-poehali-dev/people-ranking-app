import Icon from '@/components/ui/icon';
import { politicians, Politician, Law } from '@/data/politicians';

interface LawWithPolitician extends Law {
  politician: Politician;
}

interface AnalyticsTabProps {
  sortedByRating: Politician[];
  allLaws: LawWithPolitician[];
  liveRatings: Record<string, { up: number; down: number; total: number; rating: number }>;
  getRating: (p: Politician) => number;
  onSelectLaw: (law: Law) => void;
}

export default function AnalyticsTab({
  sortedByRating,
  allLaws,
  liveRatings,
  getRating,
  onSelectLaw,
}: AnalyticsTabProps) {
  return (
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
              onClick={() => onSelectLaw(law)}
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
  );
}
