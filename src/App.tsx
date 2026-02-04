import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const PUZZLES = [
  {
    id: 1,
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
    title: 'Anagramm der Tafel',
    story:
      'Die Buchstaben sind verrutscht, als haetten Wind und Wetter sie neu sortiert.',
    prompt: 'Ordne die Buchstaben neu: TSNEI',
    answers: ['stein'],
    hint: 'Es ist das Material der Waechter.',
  },
  {
    id: 3,
    title: 'Zahlenschrift',
    story: 'Die Runen sehen aus wie Zahlen. Du erinnerst dich an A1Z26.',
    prompt: 'Loese 6-5-12-19 (A=1, B=2, ...).',
    answers: ['fels'],
    hint: 'Ein Synonym zu Stein, aber kuerzer.',
  },
  {
    id: 4,
    title: 'Steinkammer',
    story:
      'Eine Truhe verlangt nach einer Zahl, die direkt vor dir steht.',
    prompt: 'Wie viele Buchstaben hat das Wort BRUCH?',
    answers: ['5', 'fuenf'],
    hint: 'Zaehle die Buchstaben.',
  },
  {
    id: 5,
    title: 'Pfadfinder',
    story:
      'Der letzte Verschluss oeffnet sich nur fuer ein Wort, das jeden Wanderer begleitet.',
    prompt: 'Ich bin kurz, beginne mit W und fuehre dich durch die Steine.',
    answers: ['weg'],
    hint: 'Ein kurzer Begriff fuer einen Pfad.',
  },
  {
    id: 6,
    title: 'Finales Schloss',
    story:
      'Der Mechanismus summt. Ein einziges Wort fehlt, dann gibt das Tor nach.',
    prompt: 'Ich oeffne alles, beginne mit T und ende mit R.',
    answers: ['tor'],
    hint: 'Was oeffnet sich am Ende eines Escape Games?',
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
  const [stepIndex, setStepIndex] = useState(0)
  const [input, setInput] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [solved, setSolved] = useState<string[]>([])
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)

  const puzzle = PUZZLES[stepIndex]
  const isComplete = stepIndex >= PUZZLES.length
  const progress = Math.min(stepIndex, PUZZLES.length)
  const chapterLabel = isComplete
    ? `Kapitel ${PUZZLES.length} von ${PUZZLES.length}`
    : `Kapitel ${progress + 1} von ${PUZZLES.length}`

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
      setSolved((current) => [...current, puzzle.answers[0]])
      setFeedback('Richtig! Das Tor gibt nach.')
      setInput('')
      setAttempts(0)
      setShowHint(false)
      setStepIndex((current) => current + 1)
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
  }

  return (
    <div className="page">
      <header className="hero">
        <div className="hero__glow" />
        <div className="hero__content">
          <p className="hero__eyebrow">Online Escape Game</p>
          <h1>Bruchhauser Steine: Das Fluesternde Tor</h1>
          <p className="hero__lead">
            Loese 6 Raetsel, oeffne die steinernen Tore und entkomme dem Nebel.
            Alles laeuft direkt im Browser.
          </p>
          <div className="hero__meta">
            <span>6 Raetsel</span>
            <span>8-12 Minuten</span>
            <span>Nur dein Kopf</span>
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="card card--game">
          <div className="card__header">
            <div>
              <p className="card__eyebrow">{chapterLabel}</p>
              <h2>{puzzle?.title ?? 'Das Tor ist offen'}</h2>
            </div>
            <div className="badge">Versuche: {attempts}</div>
          </div>

          <div className="progress">
            <div
              className="progress__bar"
              style={{ width: `${(progress / PUZZLES.length) * 100}%` }}
            />
          </div>

          {isComplete ? (
            <div className="finish">
              <p className="finish__eyebrow">Geschafft</p>
              <h3>Das Tor oeffnet sich. Du bist frei!</h3>
              <p>
                Grossartig! Du hast alle Raetsel geloest und die Bruchhauser
                Steine geben ihren Ausgang frei.
              </p>
              <button className="btn btn--primary" type="button" onClick={handleReset}>
                Nochmal spielen
              </button>
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
              {solved.map((entry, index) => (
                <li key={`${entry}-${index}`}>
                  <span className="notes__index">{index + 1}</span>
                  <span className="notes__entry">{entry}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="divider" />
          <p className="card__eyebrow">Inventar</p>
          <div className="inventory">
            <div>
              <span className="inventory__label">Steinfragmente</span>
              <span className="inventory__value">{progress} / {PUZZLES.length}</span>
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
