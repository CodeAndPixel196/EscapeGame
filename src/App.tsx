import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const PUZZLES = [
  {
    id: 1,
    theme: 'Bruchhausen',
    title: 'Tor der Vier',
    story:
      'Nebel zieht durch die Schluchten. Eine Steintafel fordert dich auf, den Ort zu benennen, der dich umgibt.',
    prompt: 'Vier Felsen, ein Name. Wie heisst dieser Ort?',
    answers: [
      'bruchhauser steine',
      'bruchhaeuser steine',
      'bruchhausersteine',
      'bruchhaeusersteine',
    ],
    hint: 'Die beruehmten Felsen bei Olsberg tragen denselben Namen.',
  },
  {
    id: 2,
    theme: 'Bruchhausen',
    title: 'Anagramm der Tafel',
    story:
      'Die Buchstaben sind verrutscht, als haetten Wind und Wetter sie neu sortiert.',
    prompt: 'Ordne die Buchstaben neu: TSNEI',
    answers: ['stein'],
    hint: 'Es ist das Material der Waechter.',
  },
  {
    id: 3,
    theme: 'Bruchhausen',
    title: 'Zahlenschrift',
    story: 'Die Runen sehen aus wie Zahlen. Du erinnerst dich an A1Z26.',
    prompt: 'Loese 6-5-12-19 (A=1, B=2, ...).',
    answers: ['fels'],
    hint: 'Ein Synonym zu Stein, aber kuerzer.',
  },
  {
    id: 4,
    theme: 'Bruchhausen',
    title: 'Steinkammer',
    story:
      'Eine Truhe verlangt nach einer Zahl, die direkt vor dir steht.',
    prompt: 'Wie viele Buchstaben hat das Wort BRUCH?',
    answers: ['5', 'fuenf'],
    hint: 'Zaehle die Buchstaben.',
  },
  {
    id: 5,
    theme: 'Bruchhausen',
    title: 'Pfadfinder',
    story:
      'Der letzte Verschluss oeffnet sich nur fuer ein Wort, das jeden Wanderer begleitet.',
    prompt: 'Ich bin kurz, beginne mit W und fuehre dich durch die Steine.',
    answers: ['weg'],
    hint: 'Ein kurzer Begriff fuer einen Pfad.',
  },
  {
    id: 6,
    theme: 'Bruchhausen',
    title: 'Finales Schloss',
    story:
      'Der Mechanismus summt. Ein einziges Wort fehlt, dann gibt das Tor nach.',
    prompt: 'Ich oeffne alles, beginne mit T und ende mit R.',
    answers: ['tor'],
    hint: 'Was oeffnet sich am Ende eines Escape Games?',
  },
  {
    id: 7,
    theme: 'Elleringhausen',
    title: 'Dorf der Glocke',
    story:
      'Die Glocke schwingt, doch niemand laeuft. Der Hinweis versteckt sich im Klang.',
    prompt: 'Wie viele Silben hat Elleringhausen?',
    answers: ['5', 'fuenf'],
    hint: 'El-le-ring-haus-en.',
  },
  {
    id: 8,
    theme: 'Elleringhausen',
    title: 'Wegweiser',
    story:
      'Ein Wegweiser zeigt nach Westen. Die Buchstaben scheinen vertauscht.',
    prompt: 'Entschluessel das Anagramm: SNAHEN',
    answers: ['hasen'],
    hint: 'Ein Tier mit langen Ohren.',
  },
  {
    id: 9,
    theme: 'Bigge',
    title: 'Stille am Wasser',
    story:
      'Das Wasser ruht. Eine Tafel spricht vom grossen Becken und seiner Farbe.',
    prompt: 'Wie nennt man einen grossen kuenstlichen See?',
    answers: ['stausee', 'stau see'],
    hint: 'Das Wort beginnt mit Stau.',
  },
  {
    id: 10,
    theme: 'Bigge',
    title: 'Schleusenwort',
    story:
      'Die Schleuse laesst nur ein kurzes Wort durch, das fuer Verbindung steht.',
    prompt: 'Ich bin kurz und verbinde zwei Ufer. Was bin ich?',
    answers: ['bruecke', 'brueck'],
    hint: 'Das Wort beginnt mit Brue.',
  },
]

function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\u00df/g, 'ss')
    .replace(/\u00e4/g, 'ae')
    .replace(/\u00f6/g, 'oe')
    .replace(/\u00fc/g, 'ue')
    .replace(/[^a-z0-9]/g, '')
}

function App() {
  const [view, setView] = useState<'themes' | 'overview' | 'puzzle'>('themes')
  const [stepIndex, setStepIndex] = useState(0)
  const [input, setInput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [solved, setSolved] = useState<Array<{ id: number; answer: string }>>([])
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [activeTheme, setActiveTheme] = useState('Elleringhausen')

  const themes = useMemo(
    () => ['Elleringhausen', 'Olsberg', 'Bigge', 'Bruchhausen'],
    []
  )
  const themedPuzzles = useMemo(
    () => PUZZLES.filter((entry) => entry.theme === activeTheme),
    [activeTheme]
  )
  const puzzle = themedPuzzles[stepIndex]
  const solvedIds = useMemo(
    () => new Set(solved.map((entry) => entry.id)),
    [solved]
  )
  const chapterIndex = puzzle
    ? Math.max(
        themedPuzzles.findIndex((entry) => entry.id === puzzle.id),
        0
      )
    : 0
  const solvedCount = themedPuzzles.filter((entry) => solvedIds.has(entry.id)).length
  const isComplete = solvedCount >= themedPuzzles.length && themedPuzzles.length > 0
  const progress = Math.min(solvedCount, themedPuzzles.length)
  const chapterLabel = themedPuzzles.length
    ? `Kapitel ${chapterIndex + 1} von ${themedPuzzles.length}`
    : 'Kapitel 0 von 0'
  const unlockedIndex = Math.min(solvedCount, themedPuzzles.length - 1)

  const normalizedAnswers = useMemo(() => {
    if (!puzzle) {
      return [] as string[]
    }
    return puzzle.answers.map(normalizeAnswer)
  }, [puzzle])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!puzzle) {
      return
    }

    const guess = normalizeAnswer(input)
    const match = normalizedAnswers.includes(guess)

    if (match) {
      setSolved((current) => {
        if (current.some((entry) => entry.id === puzzle.id)) {
          return current
        }
        return [...current, { id: puzzle.id, answer: puzzle.answers[0] }]
      })
      setFeedback('Richtig! Das Tor gibt nach.')
      setInput('')
      setAttempts(0)
      setShowHint(false)
      setStepIndex((current) =>
        Math.min(current + 1, Math.max(themedPuzzles.length - 1, 0))
      )
    } else {
      setAttempts((current) => current + 1)
      setFeedback('Noch nicht. Hoerst du den Wind? Versuch es erneut.')
    }
  }

  function handleReset() {
    setStepIndex(0)
    setInput('')
    setAttempts(0)
    setSolved([])
    setFeedback(null)
    setShowHint(false)
    setView('themes')
  }

  function handleSelectPuzzle(index: number) {
    setStepIndex(index)
    setInput('')
    setAttempts(0)
    setFeedback(null)
    setShowHint(false)
    setView('puzzle')
  }

  function handleSelectTheme(theme: string) {
    setActiveTheme(theme)
    setStepIndex(0)
    setInput('')
    setAttempts(0)
    setFeedback(null)
    setShowHint(false)
    setView('overview')
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__glow" />
        <div className="hero__content">
          <p className="hero__eyebrow">Online Escape Game</p>
          <h1>Online Escape Game</h1>
          <p className="hero__lead">
            Loese 6 Raetsel, oeffne die steinernen Tore und entkomme dem Nebel.
            Alles laeuft direkt im Browser.
          </p>
          <div className="hero__meta">
            <span>{themes.length} Orte</span>
            <span>{themedPuzzles.length} Raetsel</span>
            <span>Nur dein Kopf</span>
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="card card--game">
          <div className="card__header">
            <div>
              <p className="card__eyebrow">
                {view === 'themes'
                  ? 'Orte'
                  : view === 'overview'
                    ? `${activeTheme} · Uebersicht`
                    : chapterLabel}
              </p>
              <h2>
                {view === 'themes'
                  ? 'Waehle deinen Schauplatz'
                  : view === 'overview'
                  ? 'Waehle dein naechstes Raetsel'
                  : puzzle?.title ?? 'Das Tor ist offen'}
              </h2>
            </div>
            {view === 'puzzle' && <div className="badge">Versuche: {attempts}</div>}
          </div>

          <div className="progress">
            <div
              className="progress__bar"
              style={{
                width: themedPuzzles.length
                  ? `${(progress / themedPuzzles.length) * 100}%`
                  : '0%',
              }}
            />
          </div>

          {view === 'themes' ? (
            <div className="themes">
              <p className="overview__lead">
                Jeder Ort enthaelt eigene Raetsel. Waehle einen Schauplatz und
                starte dein Abenteuer.
              </p>
              <div className="overview__grid">
                {themes.map((theme) => {
                  const total = PUZZLES.filter((entry) => entry.theme === theme).length
                  const solvedForTheme = PUZZLES.filter(
                    (entry) => entry.theme === theme && solvedIds.has(entry.id)
                  ).length

                  return (
                    <button
                      key={theme}
                      className="overview__card"
                      type="button"
                      onClick={() => handleSelectTheme(theme)}
                    >
                      <div className="overview__top">
                        <span className="overview__chapter">{theme}</span>
                        <span className="overview__status overview__status--offen">
                          {solvedForTheme} / {total} geloest
                        </span>
                      </div>
                      <h3>Raetsel erkunden</h3>
                      <p>Entdecke die Hinweise und oeffne die Tore dieses Ortes.</p>
                      <span className="overview__cta">Ort waehlen</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : view === 'overview' ? (
            <div className="overview">
              <p className="overview__lead">
                Du kannst alle bereits freigeschalteten Kapitel erneut spielen
                oder mit dem naechsten Tor fortfahren.
              </p>
              <div className="overview__grid">
                {themedPuzzles.map((entry, index) => {
                  const isSolved = solvedIds.has(entry.id)
                  const isUnlocked = index <= unlockedIndex
                  const status = isSolved ? 'Geloest' : isUnlocked ? 'Offen' : 'Verriegelt'

                  return (
                    <button
                      key={entry.id}
                      className={`overview__card${isUnlocked ? '' : ' overview__card--locked'}`}
                      type="button"
                      onClick={() => handleSelectPuzzle(index)}
                      disabled={!isUnlocked}
                    >
                      <div className="overview__top">
                        <span className="overview__chapter">
                          Kapitel {entry.id}
                        </span>
                        <span className={`overview__status overview__status--${status.toLowerCase()}`}>
                          {status}
                        </span>
                      </div>
                      <h3>{entry.title}</h3>
                      <p>{entry.story}</p>
                      <span className="overview__cta">
                        {isSolved ? 'Erneut spielen' : 'Raetsel starten'}
                      </span>
                    </button>
                  )
                })}
              </div>
              <button
                className="btn btn--ghost overview__back"
                type="button"
                onClick={() => setView('themes')}
              >
                Zur Ortsauswahl
              </button>
            </div>
          ) : isComplete ? (
            <div className="finish">
              <p className="finish__eyebrow">Geschafft</p>
              <h3>Das Tor oeffnet sich. Du bist frei!</h3>
              <p>
                Grossartig! Du hast alle Raetsel geloest und die Bruchhauser
                Steine geben ihren Ausgang frei.
              </p>
              <div className="finish__actions">
                <button className="btn btn--primary" type="button" onClick={handleReset}>
                  Nochmal spielen
                </button>
                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={() => setView('overview')}
                >
                  Zur Uebersicht
                </button>
              </div>
            </div>
          ) : (
            <div className="puzzle">
              <p className="puzzle__story">{puzzle.story}</p>
              <p className="puzzle__prompt">{puzzle.prompt}</p>

              <form className="puzzle__form" onSubmit={handleSubmit}>
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Deine Antwort"
                  autoComplete="off"
                />
                <div className="puzzle__actions">
                  <button className="btn btn--primary" type="submit">
                    Antwort pruefen
                  </button>
                  <button
                    className="btn btn--ghost"
                    type="button"
                    onClick={() => setShowHint((current) => !current)}
                  >
                    {showHint ? 'Hinweis verstecken' : 'Hinweis zeigen'}
                  </button>
                </div>
              </form>

              {showHint && <div className="hint">Hinweis: {puzzle.hint}</div>}
              {feedback && <div className="feedback">{feedback}</div>}
              <button
                className="btn btn--ghost puzzle__overview"
                type="button"
                onClick={() => setView('overview')}
              >
                Zur Uebersicht
              </button>
            </div>
          )}
        </section>

        <aside className="card card--notes">
          <p className="card__eyebrow">Notizbuch</p>
          <h3>Gefundene Schluessel</h3>
          {solved.length === 0 ? (
            <p className="notes__empty">
              Noch keine Loesungen. Fang beim ersten Tor an.
            </p>
          ) : (
            <ul className="notes__list">
              {solved
                .filter((entry) =>
                  themedPuzzles.some((puzzleEntry) => puzzleEntry.id === entry.id)
                )
                .map((entry, index) => (
                <li key={`${entry.id}-${index}`}>
                  <span className="notes__index">{index + 1}</span>
                  <span className="notes__entry">{entry.answer}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="divider" />
          <p className="card__eyebrow">Inventar</p>
          <div className="inventory">
            <div>
              <span className="inventory__label">Steinfragmente</span>
              <span className="inventory__value">{progress} / {themedPuzzles.length}</span>
            </div>
            <div>
              <span className="inventory__label">Torstatus</span>
              <span className="inventory__value">{isComplete ? 'Offen' : 'Verriegelt'}</span>
            </div>
          </div>

          <button className="btn btn--ghost" type="button" onClick={handleReset}>
            Spiel zuruecksetzen
          </button>
        </aside>
      </main>

      <footer className="footer">
        <p>
          Tipp: Du kannst Umlaute einfach als ae/oe/ue schreiben. Die Loesung
          wird trotzdem erkannt.
        </p>
      </footer>
    </div>
  )
}

export default App
