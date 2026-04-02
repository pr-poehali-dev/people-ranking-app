import Icon from '@/components/ui/icon';
import { politicians, Politician, Law } from '@/data/politicians';

interface ProfilesTabProps {
  selectedPolitician: Politician | null;
  setSelectedPolitician: (p: Politician | null) => void;
  getRating: (p: Politician) => number;
  getVoteCount: (p: Politician) => number;
  localVotes: Record<number, { up: number; down: number; voted?: 'up' | 'down' }>;
  onSelectLaw: (law: Law) => void;
}

export default function ProfilesTab({
  selectedPolitician,
  setSelectedPolitician,
  getRating,
  getVoteCount,
  localVotes,
  onSelectLaw,
}: ProfilesTabProps) {
  if (selectedPolitician) {
    return (
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
                  onClick={() => onSelectLaw(law)}
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
    );
  }

  return (
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
  );
}
