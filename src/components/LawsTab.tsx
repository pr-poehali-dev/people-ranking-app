import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Politician, Law } from '@/data/politicians';

interface LawWithPolitician extends Law {
  politician: Politician;
}

interface LawsTabProps {
  allLaws: LawWithPolitician[];
  localVotes: Record<number, { up: number; down: number; voted?: 'up' | 'down' }>;
  handleVote: (lawId: number, type: 'up' | 'down') => void;
  selectedLaw: Law | null;
  setSelectedLaw: (law: Law | null) => void;
}

export default function LawsTab({
  allLaws,
  localVotes,
  handleVote,
  selectedLaw,
  setSelectedLaw,
}: LawsTabProps) {
  const [commentText, setCommentText] = useState('');

  if (selectedLaw) {
    return (
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
    );
  }

  return (
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
  );
}
