'use client'
// ─── SESSION SAVE / RESTORE ────────────────────────────────────────────────
import { useState, useRef, useEffect } from 'react'

const SESSION_KEY = 'osl_pulse_survey_session'
const STEP_KEY    = 'osl_pulse_survey_step'

function saveSession(s: unknown, step: number) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); localStorage.setItem(STEP_KEY, String(step)) } catch {}
}

function loadSession(): { data: Record<string,unknown>; step: number } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    const step = localStorage.getItem(STEP_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data?.fullName?.trim()) return null
    return { data, step: step ? parseInt(step, 10) : 0 }
  } catch { return null }
}

function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); localStorage.removeItem(STEP_KEY) } catch {}
}

interface S {
  fullName: string; email: string; unit: string; dutyStation: string; countryOffice: string
  typicalWeek: string; dataTracked: string; toolsUsed: string[]; otherTools: string
  biggestChallenge: string; dataFrequency: string
  kpisSelected: string[]; customKpis: string
  top3Rank1: string; top3Rank1Why: string
  top3Rank2: string; top3Rank2Why: string
  top3Rank3: string; top3Rank3Why: string
  inputMethods: string[]; devicesUsed: string[]; updateFrequency: string; inputConstraints: string
  firstView: string; vizTypes: string[]; dedicatedSection: string; keyVariables: string; viewers: string[]
  reportFormats: string[]; reportDetailLevel: string; publicationData: string
  reportingDeadlines: string; importanceRating: number | null
  specialRequests: string; integrationsNeeded: string; indispensable: string
  openWishlist: string
}

const INIT: S = {
  fullName:'',email:'',unit:'',dutyStation:'',countryOffice:'',
  typicalWeek:'',dataTracked:'',toolsUsed:[],otherTools:'',biggestChallenge:'',dataFrequency:'',
  kpisSelected:[],customKpis:'',
  top3Rank1:'',top3Rank1Why:'',top3Rank2:'',top3Rank2Why:'',top3Rank3:'',top3Rank3Why:'',
  inputMethods:[],devicesUsed:[],updateFrequency:'',inputConstraints:'',
  firstView:'',vizTypes:[],dedicatedSection:'',keyVariables:'',viewers:[],
  reportFormats:[],reportDetailLevel:'',publicationData:'',reportingDeadlines:'',importanceRating:null,
  specialRequests:'',integrationsNeeded:'',indispensable:'',openWishlist:'',
}

const ALL_KPIS: Record<string, string[]> = {
  'Procurement': [
    'Number of open purchase orders','Average PO-to-delivery lead time',
    '% orders on-time vs target','Number of active vendors / suppliers',
    'Quotation response rate','Budget committed vs remaining',
    'Items currently pending quotation','Emergency procurement cycle time',
    'Vendor performance score (avg)','Sole-source justification count',
    'Value of active contracts (USD)','POs overdue > 30 days',
  ],
  'Operations': [
    'Active emergency operations (count)','Countries currently at High risk',
    'Pending EMT deployments','HR gaps flagged by country',
    'Overdue actions (this week)','Days since last country status update',
    'Countries without assigned focal point','Partner coordination meetings held',
    'CFE allocated vs used','Avg deployment response time',
    'Government approvals pending','IMST activations (rolling 30 days)',
  ],
  'Supply Chain / SCM': [
    'Active shipments in pipeline','% shipments on-time',
    'Shipments stuck in customs','Items delivered vs pending (this week)',
    'OR → SR conversion time (avg days)','SR → shipment time (avg days)',
    'Shipment → delivery time (avg days)','Beneficiaries covered by deliveries',
    'Countries with active supply gaps','Total value of goods in transit (USD)',
    'Items near expiry in warehouse','Delivery confirmation rate',
  ],
  'Health Technology & Logistics': [
    'Facilities currently monitored','% facilities with confirmed water access',
    'Facilities with poor / no sanitation','Total bed capacity tracked (all countries)',
    'Waste management compliance rate','Cold chain integrity rate (%)',
    'Equipment maintenance actions overdue','Key gaps flagged this week',
    'WASH gap closure rate','Facilities newly assessed this week',
    'IPC compliance score (avg)','Water quality test pass rate',
  ],
}

const TOOLS_ALL = [
  'WHO BMS / ORACLE','Coupa (eProcurement)','Excel / Google Sheets (manual)',
  'SharePoint','Email threads as record','IMST platform',
  'PowerBI / IM dashboards','KoBoToolbox / ODK','DHIS2',
  'AfroTrack','Maersk / freight portals','Paper / manual records',
]

const BLUE = '#005A9C', BLUE_MID = '#009ADE', BLUE_PALE = '#E5F5FD'
const WHITE = '#FFFFFF', TEXT = '#0D1B2A', MUTED = '#4A6785', BORDER = '#B8D4E8'

const card: React.CSSProperties = {
  background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6,
  boxShadow: '0 2px 14px rgba(0,90,156,0.09)', overflow: 'hidden',
}

function NavBar({ hasSaved = false }: { hasSaved?: boolean }) {
  return (
    <nav style={{ background: BLUE, borderBottom: `3px solid ${BLUE_MID}` }}>
      <div style={{ maxWidth: 840, margin: '0 auto', padding: '0 20px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/who-afro-logo.png" alt="WHO AFRO" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 }} />
          <div>
            <div style={{ color: WHITE, fontWeight: 700, fontSize: 13 }}>WHO AFRO · Emergencies Programme</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, letterSpacing: 1, fontFamily: 'monospace' }}>OSL/OPS — System Mapping Survey</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {hasSaved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} />
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontFamily: 'monospace', letterSpacing: 0.8 }}>AUTO-SAVED</span>
            </div>
          )}
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'monospace', letterSpacing: 1 }}>FORM-OSL-SYS-001 · 2026</span>
        </div>
      </div>
    </nav>
  )
}

function ProgressBar({ step }: { step: number }) {
  const labels = ['Identity','Your Work','KPIs','Data Input','Dashboard','Reporting','Final']
  const total = labels.length
  return (
    <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, zIndex: 30, boxShadow: '0 2px 8px rgba(0,90,156,0.07)' }}>
      <div style={{ maxWidth: 840, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 50, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 14, right: 14, height: 2, background: BORDER, transform: 'translateY(-50%)', zIndex: 0 }} />
          {labels.map((lbl, i) => {
            const done = i < step, active = i === step
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, fontFamily: 'monospace', transition: 'all 0.2s',
                  background: active ? BLUE_MID : done ? BLUE : WHITE,
                  border: `2px solid ${active ? BLUE_MID : done ? BLUE : BORDER}`,
                  color: active || done ? WHITE : MUTED,
                  boxShadow: active ? '0 0 0 4px rgba(0,154,222,0.18)' : 'none',
                }}>
                  {done ? '✓' : String(i + 1)}
                </div>
                <span style={{ fontSize: 8, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2, color: active ? BLUE_MID : done ? BLUE : MUTED, fontWeight: active || done ? 700 : 400 }}>{lbl}</span>
              </div>
            )
          })}
        </div>
        <div style={{ height: 3, background: BORDER, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(step / (total - 1)) * 100}%`, background: BLUE_MID, transition: 'width 0.4s ease', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  )
}

function SecBadge({ letter, title, sub }: { letter: string; title: string; sub: string }) {
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ background: BLUE, color: WHITE, fontWeight: 700, fontSize: 22, width: 48, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>{letter}</div>
      <div style={{ background: BLUE_PALE, borderBottom: `1px solid ${BORDER}`, padding: '10px 18px', flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: BLUE }}>{title}</div>
        <div style={{ fontSize: 12, color: MUTED, fontStyle: 'italic', marginTop: 1 }}>{sub}</div>
      </div>
    </div>
  )
}

function Q({ n, text, sub, children }: { n: number; text: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ marginBottom: sub ? 4 : 10, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <span style={{ fontWeight: 700, color: BLUE_MID, fontSize: 13, fontFamily: 'monospace', flexShrink: 0, paddingTop: 1 }}>Q{n}.</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: TEXT, lineHeight: 1.4 }}>{text}</span>
      </div>
      {sub && <div style={{ fontSize: 12, color: MUTED, fontStyle: 'italic', marginBottom: 10, marginLeft: 28 }}>{sub}</div>}
      <div style={{ marginLeft: 28 }}>{children}</div>
    </div>
  )
}

function Checks({ items, sel, tog, cols = 2 }: { items: string[]; sel: string[]; tog: (v: string) => void; cols?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 7 }}>
      {items.map(item => {
        const on = sel.includes(item)
        return (
          <button key={item} type="button" onClick={() => tog(item)} style={{
            display: 'flex', alignItems: 'flex-start', gap: 9, padding: '9px 11px',
            border: `2px solid ${on ? BLUE_MID : BORDER}`, borderRadius: 3,
            background: on ? BLUE_PALE : WHITE, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
          }}>
            <div style={{
              width: 15, height: 15, border: `2px solid ${on ? BLUE_MID : BORDER}`, borderRadius: 2,
              background: on ? BLUE_MID : WHITE, flexShrink: 0, marginTop: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: WHITE, fontSize: 8, fontWeight: 700, transition: 'all 0.15s',
            }}>{on && '✓'}</div>
            <span style={{ fontSize: 12, color: TEXT, lineHeight: 1.4 }}>{item}</span>
          </button>
        )
      })}
    </div>
  )
}

function Radio({ items, sel, set, cols = 2 }: { items: string[]; sel: string; set: (v: string) => void; cols?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 7 }}>
      {items.map(item => {
        const on = sel === item
        return (
          <button key={item} type="button" onClick={() => set(item)} style={{
            display: 'flex', alignItems: 'flex-start', gap: 9, padding: '9px 11px',
            border: `2px solid ${on ? BLUE : BORDER}`, borderRadius: 3,
            background: on ? BLUE_PALE : WHITE, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
          }}>
            <div style={{
              width: 15, height: 15, border: `2px solid ${on ? BLUE : BORDER}`, borderRadius: '50%',
              background: on ? BLUE : WHITE, flexShrink: 0, marginTop: 1, transition: 'all 0.15s',
              boxShadow: on ? 'inset 0 0 0 3px white' : 'none',
            }} />
            <span style={{ fontSize: 12, color: TEXT, lineHeight: 1.4 }}>{item}</span>
          </button>
        )
      })}
    </div>
  )
}

function ScaleRow({ val, set }: { val: number | null; set: (n: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 11, color: MUTED }}>Not critical</span>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => set(n)} style={{
          width: 42, height: 42, border: `2px solid ${val === n ? BLUE_MID : BORDER}`,
          borderRadius: 3, background: val === n ? BLUE_MID : WHITE,
          color: val === n ? WHITE : MUTED, fontWeight: 700, fontSize: 15, fontFamily: 'monospace',
          cursor: 'pointer', transition: 'all 0.15s',
          boxShadow: val === n ? '0 2px 10px rgba(0,154,222,0.3)' : 'none',
        }}>{n}</button>
      ))}
      <span style={{ fontSize: 11, color: MUTED }}>Mission critical</span>
    </div>
  )
}

function Rank3({ s, upd }: { s: S; upd: (k: keyof S, v: string) => void }) {
  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', background: BLUE }}>
        {['#','KPI / Priority Area','Why this matters to your work'].map(h => (
          <div key={h} style={{ padding: '8px 12px', color: WHITE, fontSize: 11, fontWeight: 700, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</div>
        ))}
      </div>
      {([1,2,3] as const).map(n => (
        <div key={n} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', background: n % 2 === 0 ? BLUE_PALE : WHITE, borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: BLUE_MID, fontSize: 15, fontFamily: 'monospace' }}>{n}</div>
          <div style={{ padding: '6px 8px', borderLeft: `1px solid ${BORDER}` }}>
            <input value={s[`top3Rank${n}` as keyof S] as string} onChange={e => upd(`top3Rank${n}` as keyof S, e.target.value)} placeholder={`Priority #${n}...`} style={{ border: 'none', background: 'transparent', padding: '4px 2px', fontSize: 12, width: '100%', outline: 'none', boxShadow: 'none' }} />
          </div>
          <div style={{ padding: '6px 8px', borderLeft: `1px solid ${BORDER}` }}>
            <input value={s[`top3Rank${n}Why` as keyof S] as string} onChange={e => upd(`top3Rank${n}Why` as keyof S, e.target.value)} placeholder="Because..." style={{ border: 'none', background: 'transparent', padding: '4px 2px', fontSize: 12, width: '100%', outline: 'none', boxShadow: 'none' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 14px', fontSize: 10, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: MUTED }}>
      {label}<div style={{ flex: 1, height: 1, background: BORDER }} />
    </div>
  )
}

function BtnRow({ onBack, onNext, nextLabel, hideBack, disabled }: { onBack?: () => void; onNext: () => void; nextLabel?: string; hideBack?: boolean; disabled?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 18, borderTop: `1px solid ${BORDER}` }}>
      {!hideBack && onBack
        ? <button onClick={onBack} style={{ padding: '10px 24px', border: `2px solid ${BORDER}`, background: WHITE, borderRadius: 3, fontFamily: 'monospace', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: MUTED, cursor: 'pointer' }}>← Back</button>
        : <div />}
      <button onClick={onNext} disabled={disabled} style={{
        padding: '11px 30px', background: disabled ? MUTED : BLUE_MID, color: WHITE, border: 'none', borderRadius: 3,
        fontFamily: 'monospace', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
        cursor: disabled ? 'not-allowed' : 'pointer', boxShadow: disabled ? 'none' : '0 4px 16px rgba(0,154,222,0.32)', transition: 'all 0.2s',
      }}>
        {nextLabel || 'Next →'}
      </button>
    </div>
  )
}

function Summary({ s }: { s: S }) {
  const rows: [string, string][] = [
    ['Name', s.fullName], ['Email', s.email], ['Unit', s.unit],
    ['Duty Station', s.dutyStation === 'Country Office (specify below)' ? s.countryOffice : s.dutyStation],
    ['Typical Week', s.typicalWeek], ['Data Tracked', s.dataTracked],
    ['Tools Used', s.toolsUsed.join(', ') || '—'], ['Other Tools', s.otherTools || '—'],
    ['Biggest Challenge', s.biggestChallenge], ['Data Frequency', s.dataFrequency || '—'],
    ['KPIs Selected', s.kpisSelected.join(' · ') || '—'], ['Custom KPIs', s.customKpis || '—'],
    ['Top KPI #1', `${s.top3Rank1}${s.top3Rank1Why ? ' — ' + s.top3Rank1Why : ''}`],
    ['Top KPI #2', `${s.top3Rank2}${s.top3Rank2Why ? ' — ' + s.top3Rank2Why : ''}`],
    ['Top KPI #3', `${s.top3Rank3}${s.top3Rank3Why ? ' — ' + s.top3Rank3Why : ''}`],
    ['Input Methods', s.inputMethods.join(', ') || '—'],
    ['Devices', s.devicesUsed.join(', ') || '—'],
    ['Update Frequency', s.updateFrequency || '—'],
    ['Constraints', s.inputConstraints || '—'],
    ['First View', s.firstView],
    ['Viz Types', s.vizTypes.join(', ') || '—'],
    ['Dedicated Section', s.dedicatedSection || '—'],
    ['Key Variables', s.keyVariables || '—'],
    ['Viewers', s.viewers.join(', ') || '—'],
    ['Report Formats', s.reportFormats.join(', ') || '—'],
    ['Detail Level', s.reportDetailLevel || '—'],
    ['Publication Use', s.publicationData || '—'],
    ['Deadlines', s.reportingDeadlines || '—'],
    ['Importance', s.importanceRating ? `${s.importanceRating} / 5` : '—'],
    ['Special Requests', s.specialRequests || '—'],
    ['Integrations', s.integrationsNeeded || '—'],
    ['Indispensable', s.indispensable || '—'],
    ['Open Wishlist', s.openWishlist || '—'],
  ]
  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 3, overflow: 'hidden' }}>
      {rows.map(([k, v], i) => (
        <div key={k} style={{ display: 'flex', gap: 14, padding: '9px 14px', background: i % 2 === 0 ? WHITE : BLUE_PALE, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 9, fontFamily: 'monospace', fontWeight: 700, color: BLUE_MID, textTransform: 'uppercase', letterSpacing: 0.8, minWidth: 130, paddingTop: 2, flexShrink: 0 }}>{k}</div>
          <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.5 }}>{v || '—'}</div>
        </div>
      ))}
    </div>
  )
}

function ThankYou({ name, unit }: { name: string; unit: string }) {
  return (
    <div style={{ minHeight: '100vh', background: '#EEF6FC', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ ...card, maxWidth: 540, width: '100%', padding: 48, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: BLUE_MID, color: WHITE, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 0 10px rgba(0,154,222,0.12)' }}>✓</div>
          <h2 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 26, color: BLUE, marginBottom: 10 }}>Submission Received</h2>
          <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.75, marginBottom: 20 }}>
            Thank you, <strong style={{ color: TEXT }}>{name}</strong>. Your system mapping input for <strong style={{ color: BLUE }}>{unit}</strong> has been saved directly to the OSL PULSE database. Adama and the OSL DEV team will review it and incorporate your requirements into the build.
          </p>
          <div style={{ background: BLUE_PALE, border: `1px solid ${BORDER}`, borderRadius: 4, padding: 16, marginBottom: 24 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>What happens next</div>
            <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.65 }}>The OSL team will collate all submissions, map the system architecture, and notify you when your unit's section is ready for review. Expected within one week of the Wednesday meeting.</p>
          </div>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 24px', border: `2px solid ${BORDER}`, background: WHITE, borderRadius: 3, fontFamily: 'monospace', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: MUTED, cursor: 'pointer' }}>Submit Another Response</button>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function SurveyClient() {
  const [step, setStep] = useState(0)
  const [s, setS] = useState<S>(INIT)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [err, setErr] = useState('')
  const [savedSession, setSavedSession] = useState<{ data: Record<string,unknown>; step: number } | null>(null)
  const [showRestore, setShowRestore] = useState(false)
  const topRef = useRef<HTMLDivElement>(null)

  // Check for saved session on mount
  useEffect(() => {
    const session = loadSession()
    if (session) { setSavedSession(session); setShowRestore(true) }
  }, [])

  // Auto-save every change — silently, always
  useEffect(() => {
    if (submitted) { clearSession(); return }
    if (s.fullName.trim()) saveSession(s, step)
  }, [s, step, submitted])

  const restoreSession = () => {
    if (!savedSession) return
    setS({ ...INIT, ...(savedSession.data as Partial<S>) })
    setStep(savedSession.step)
    setShowRestore(false)
  }
  const dismissRestore = () => { clearSession(); setShowRestore(false) }

  const upd = (k: keyof S, v: unknown) => setS(p => ({ ...p, [k]: v }))
  const tog = (k: keyof S, v: string) => setS(p => {
    const a = (p[k] as string[]) || []
    return { ...p, [k]: a.includes(v) ? a.filter((x: string) => x !== v) : [...a, v] }
  })
  const scroll = () => setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)

  const validate = () => {
    if (step === 0) {
      if (!s.fullName.trim()) { alert('Please enter your full name'); return false }
      if (!s.email.trim()) { alert('Please enter your email'); return false }
      if (!s.unit) { alert('Please select your unit'); return false }
      if (!s.dutyStation) { alert('Please select your duty station'); return false }
    }
    if (step === 1) {
      if (!s.typicalWeek.trim()) { alert('Please describe your typical week'); return false }
      if (!s.biggestChallenge.trim()) { alert('Please describe your biggest challenge'); return false }
      if (!s.dataFrequency) { alert('Please select how often you need data'); return false }
    }
    if (step === 2 && s.kpisSelected.length === 0) { alert('Please select at least one KPI'); return false }
    if (step === 3 && s.inputMethods.length === 0) { alert('Please select at least one input method'); return false }
    if (step === 4 && !s.firstView.trim()) { alert('Please describe your ideal first view'); return false }
    return true
  }

  const next = () => { if (!validate()) return; setStep(x => x + 1); scroll() }
  const back = () => { setStep(x => x - 1); scroll() }

  const submit = async () => {
    setSubmitting(true); setErr('')
    try {
      const r = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      })
      if (!r.ok) throw new Error('Failed')
      clearSession(); setSubmitted(true); scroll()
    } catch { setErr('Submission failed — please try again or email akanimo@who.int') }
    finally { setSubmitting(false) }
  }

  if (submitted) return <ThankYou name={s.fullName} unit={s.unit} />

  const kpiList = s.unit && ALL_KPIS[s.unit]
    ? ALL_KPIS[s.unit]
    : Object.values(ALL_KPIS).flat()

  return (
    <div style={{ minHeight: '100vh', background: '#EEF6FC' }}>
      <div ref={topRef} />

      {/* ── SESSION RESTORE BANNER ─────────────────────────────── */}
      {showRestore && savedSession && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 999, maxWidth: 560, width: 'calc(100% - 32px)',
          background: '#1A2B3C', borderRadius: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          border: '2px solid #009ADE', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' as const,
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ color: '#009ADE', fontSize: 11, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              💾 Unsaved session found
            </div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.5 }}>
              You were on <strong style={{ color: 'white' }}>Step {savedSession.step + 1}</strong> as <strong style={{ color: 'white' }}>{String(savedSession.data.fullName || 'Unknown')}</strong>. Pick up where you left off?
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={dismissRestore} style={{
              padding: '8px 16px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent',
              color: 'rgba(255,255,255,0.55)', borderRadius: 3, fontFamily: 'monospace', fontSize: 10,
              fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, cursor: 'pointer',
            }}>Discard</button>
            <button onClick={restoreSession} style={{
              padding: '8px 20px', background: '#009ADE', color: 'white', border: 'none',
              borderRadius: 3, fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 0.8, cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,154,222,0.4)',
            }}>↩ Resume</button>
          </div>
        </div>
      )}

      <NavBar />

      {/* ── HERO (step 0 only) ─────────────────────────────────── */}
      {step === 0 && (
        <div style={{ background: `linear-gradient(135deg, ${BLUE} 0%, #0072BB 100%)`, padding: '36px 20px 44px' }}>
          <div style={{ maxWidth: 840, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 24, padding: '6px 16px 6px 6px', marginBottom: 16 }}>
              <img src="/who-afro-logo.png" alt="WHO AFRO" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', flexShrink: 0 }} />
                <span style={{ color: WHITE, fontSize: 10, fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1 }}>OSL PULSE · BUILD PHASE · ACTIVE</span>
              </div>
            </div>
            <h1 style={{ fontFamily: "'Source Serif 4', serif", fontSize: 'clamp(24px,4vw,36px)', color: WHITE, lineHeight: 1.15, marginBottom: 16 }}>
              OSL PULSE<br />
              <em style={{ color: '#B3DCEF', fontStyle: 'italic' }}>System Mapping Survey</em>
            </h1>
            <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4, padding: '18px 20px', maxWidth: 700, marginBottom: 20 }}>
              <p style={{ color: 'rgba(255,255,255,0.93)', fontSize: 13, lineHeight: 1.8, marginBottom: 12 }}>
                The OSL PULSE dashboard is designed to give us — OSL — Procurement, Operations, Supply Chain, and Health Technology & Logistics — real-time visibility into our area of responsibility, and to give AFRO OSL one unified <strong style={{ color: WHITE }}>Common Operational Picture (COP)</strong> on our strategic positioning across the region.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.93)', fontSize: 13, lineHeight: 1.8, marginBottom: 12 }}>
                Before we build, I want to hear from each of you directly. This survey is the blueprint — mapping our work dynamics and reporting outputs. Every answer matters. Every detail counts. <strong style={{ color: WHITE }}>Think operations, not academics.</strong> Break it down in phases, keep it simple and clear.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.93)', fontSize: 13, lineHeight: 1.8 }}>
                Please complete this in full. <strong style={{ color: WHITE }}>Adama will be reviewing every submission personally — and so will I.</strong>
              </p>
              <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ color: '#B3DCEF', fontSize: 13, fontWeight: 700 }}>— AFRO OSL DEV</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>On behalf of Adama Thiam | Chief, OSL | WHO AFRO Emergencies Programme</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[['⏱','10–15 min'],['📅','Wed 3PM NBI'],['🔒','OSL Team only']].map(([icon,text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ProgressBar step={step} />

      <div style={{ maxWidth: 840, margin: '0 auto', padding: '28px 20px 80px' }}>

        {/* ── STEP 0: IDENTITY ──────────────────────────────────── */}
        {step === 0 && (
          <div className="fade-up" style={card}>
            <SecBadge letter="A" title="Your Identity & Role" sub="So we know exactly whose lens we are building for" />
            <div style={{ padding: '24px 28px' }}>
              <Q n={1} text="What is your full name and official title?">
                <input value={s.fullName} onChange={e => upd('fullName', e.target.value)} placeholder="e.g. Fatima Tafida — Regional Supply Chain Coordinator" />
              </Q>
              <Q n={2} text="What is your email address?" sub="We'll notify you here when your section is ready for review">
                <input type="email" value={s.email} onChange={e => upd('email', e.target.value)} placeholder="yourname@who.int" />
              </Q>
              <Q n={3} text="Which unit is your primary area of responsibility?" sub="Tick one — this determines which KPIs and workflow questions follow">
                <Radio items={['Procurement','Operations','Supply Chain / SCM','Health Technology & Logistics','Cross-cutting / OSL Coordination']} sel={s.unit} set={v => upd('unit', v)} cols={2} />
              </Q>
              <Q n={4} text="What is your current duty station?" sub="Select one — or specify your country office below">
                <Radio items={['Nairobi','Dakar','Country Office (specify below)']} sel={s.dutyStation} set={v => upd('dutyStation', v)} cols={3} />
                {s.dutyStation === 'Country Office (specify below)' && (
                  <div style={{ marginTop: 10 }}>
                    <input value={s.countryOffice} onChange={e => upd('countryOffice', e.target.value)} placeholder="e.g. Mozambique CO, Tanzania CO..." />
                  </div>
                )}
              </Q>
              <BtnRow hideBack onNext={next} />
            </div>
          </div>
        )}

        {/* ── STEP 1: YOUR WORK ─────────────────────────────────── */}
        {step === 1 && (
          <div className="fade-up" style={card}>
            <SecBadge letter="B" title="How You Work Today" sub="Your current workflow, tools, and the gaps we need to fix" />
            <div style={{ padding: '24px 28px' }}>
              <Q n={5} text="Walk us through what you do in a typical week." sub="Be specific — what tasks, what outputs, what decisions do you make or support? Think step by step, not a job description.">
                <textarea value={s.typicalWeek} onChange={e => upd('typicalWeek', e.target.value)} placeholder="e.g. Monday: pull shipment status from BMS, update tracking tool... Wednesday: prep country updates for Adama..." rows={5} />
              </Q>
              <Q n={6} text="What data do you currently collect or track in your work?" sub="Include everything — even informal tracking in personal spreadsheets or notes. Nothing is too small.">
                <textarea value={s.dataTracked} onChange={e => upd('dataTracked', e.target.value)} placeholder="e.g. OR numbers, shipment ETAs, country risk levels, vendor quotes, facility WASH status..." rows={4} />
              </Q>
              <Q n={7} text="What tools or systems do you currently use to track or report your work?" sub="Tick all that apply">
                <Checks items={TOOLS_ALL} sel={s.toolsUsed} tog={v => tog('toolsUsed', v)} />
                <div style={{ marginTop: 10 }}>
                  <input value={s.otherTools} onChange={e => upd('otherTools', e.target.value)} placeholder="Other tools not listed above..." />
                </div>
              </Q>
              <Q n={8} text="What is the single biggest data or reporting challenge in your current workflow?" sub="What takes too long? What data is missing, wrong, or arrives too late to be useful to you?">
                <textarea value={s.biggestChallenge} onChange={e => upd('biggestChallenge', e.target.value)} placeholder="Be direct — what is the one thing that breaks down every week?" rows={4} />
              </Q>
              <Q n={9} text="How often do you need up-to-date data to do your job effectively?" sub="Tick one">
                <Radio items={['Real-time / continuous','Several times per day','Daily','Twice a week','Once a week','Monthly']} sel={s.dataFrequency} set={v => upd('dataFrequency', v)} />
              </Q>
              <BtnRow onBack={back} onNext={next} />
            </div>
          </div>
        )}

        {/* ── STEP 2: KPIs ──────────────────────────────────────── */}
        {step === 2 && (
          <div className="fade-up" style={card}>
            <SecBadge letter="C" title="Your KPIs & Key Metrics" sub="The numbers that — when visible at a glance — tell you exactly where things stand" />
            <div style={{ padding: '24px 28px' }}>
              <Q n={10} text="From the list below, tick every KPI that should be visible in your unit's section of the dashboard." sub={`Pre-loaded for ${s.unit || 'all units'} — add anything missing in Q11`}>
                {(!s.unit || s.unit === 'Cross-cutting / OSL Coordination')
                  ? Object.entries(ALL_KPIS).map(([grp, items]) => (
                    <div key={grp}>
                      <Divider label={grp} />
                      <Checks items={items} sel={s.kpisSelected} tog={v => tog('kpisSelected', v)} />
                    </div>
                  ))
                  : <Checks items={kpiList} sel={s.kpisSelected} tog={v => tog('kpisSelected', v)} />
                }
              </Q>
              <Q n={11} text="Any KPIs critical to your unit that are NOT in the list above?" sub="Give us the metric name, how it is calculated, and where the data comes from">
                <textarea value={s.customKpis} onChange={e => upd('customKpis', e.target.value)} placeholder="e.g. 'Days since last field assessment' — calculated from KoBoToolbox submission date, tracked per country..." rows={3} />
              </Q>
              <Q n={12} text="From all the KPIs relevant to your unit — what are your TOP 3 most critical?" sub="Rank them. Tell us what decision each one informs. That is how we know where to put them on screen.">
                <Rank3 s={s} upd={upd} />
              </Q>
              <BtnRow onBack={back} onNext={next} />
            </div>
          </div>
        )}

        {/* ── STEP 3: DATA INPUT ────────────────────────────────── */}
        {step === 3 && (
          <div className="fade-up" style={card}>
            <SecBadge letter="D" title="How You Will Input Data" sub="The data entry design depends entirely on your team's reality — field, hub, or HQ" />
            <div style={{ padding: '24px 28px' }}>
              <Q n={13} text="How would you prefer to update your section of OSL PULSE?" sub="Tick everything that is realistic — not ideal, realistic — for your team">
                <Checks items={['Online form (web / mobile — fill per update)','Excel / CSV upload (periodic batch)','Direct table edit on the dashboard','Email update (system parses the data)','WhatsApp / SMS (for field teams)','Automated pull from BMS / ORACLE','Automated pull from SharePoint','API integration with existing system']} sel={s.inputMethods} tog={v => tog('inputMethods', v)} />
              </Q>
              <Q n={14} text="What devices does your team mainly use when submitting or reviewing data?" sub="Tick all that apply">
                <Checks items={['Desktop / laptop (WHO network)','Personal laptop','Smartphone (iOS)','Smartphone (Android)','Tablet','Low-bandwidth / field device']} sel={s.devicesUsed} tog={v => tog('devicesUsed', v)} />
              </Q>
              <Q n={15} text="How often would your team realistically update their section?" sub="Be honest — we design around what actually happens, not what should happen">
                <Radio items={['Every day','2–3 times per week','Once per week (e.g. before Monday meeting)','As events happen (event-driven)','Monthly only']} sel={s.updateFrequency} set={v => upd('updateFrequency', v)} />
              </Q>
              <Q n={16} text="Are there any real-world constraints on how data can be entered from your team?" sub="e.g. field staff with no WHO laptop, no reliable internet, BMS not accessible from certain COs, language barriers">
                <textarea value={s.inputConstraints} onChange={e => upd('inputConstraints', e.target.value)} placeholder="Be specific — this directly affects what we build..." rows={3} />
              </Q>
              <BtnRow onBack={back} onNext={next} />
            </div>
          </div>
        )}

        {/* ── STEP 4: DASHBOARD ─────────────────────────────────── */}
        {step === 4 && (
          <div className="fade-up" style={card}>
            <SecBadge letter="E" title="Your Dashboard Vision" sub="Tell us exactly what you want to see — we build it that way" />
            <div style={{ padding: '24px 28px' }}>
              <Q n={17} text="When you open OSL PULSE, what is the first thing you want on your screen?" sub="Be as specific as you can. Describe the layout, the data, the format. Pretend you are describing a screenshot to someone building it from scratch.">
                <textarea value={s.firstView} onChange={e => upd('firstView', e.target.value)} placeholder="e.g. A map showing all active emergencies color-coded by risk level, with a panel on the right showing 3 KPI cards: total shipments in transit, countries at high risk, and overdue actions..." rows={5} />
              </Q>
              <Q n={18} text="Which visualization types would be most useful for your unit?" sub="Tick all that apply">
                <Checks items={['Map — country pins / heat zones','KPI summary cards (large numbers, color-coded)','Shipment pipeline / Gantt-style timeline','Bar chart / column chart','Pie / donut chart (breakdown by category)','Traffic light table (RAG: Red / Amber / Green)','Timeline / event activity log','Budget burn-down / spend chart','Trend line over time','Comparison table (planned vs actual)','Drill-down country detail view','Auto-generated weekly report']} sel={s.vizTypes} tog={v => tog('vizTypes', v)} />
              </Q>
              <Q n={19} text="Would you like a dedicated section for your unit with its own key metrics panel?" sub="A unit section is private to you and Adama — plus a summary tile visible to the full team">
                <Radio items={['Yes — I want a full dedicated unit section','Yes — a summary panel shared to the team is enough','No — the cross-cutting view covers my needs','Not sure — want to discuss with Adama first']} sel={s.dedicatedSection} set={v => upd('dedicatedSection', v)} />
              </Q>
              <Q n={20} text="If you have a dedicated unit section, what are the key variables that MUST be tracked there?" sub="Not just KPIs — list every data field your unit owns and is responsible for maintaining">
                <textarea value={s.keyVariables} onChange={e => upd('keyVariables', e.target.value)} placeholder="e.g. country name, OR number, SR number, item category, quantity, shipment status, ETA, delivered Y/N, beneficiary covered..." rows={5} />
              </Q>
              <Q n={21} text="Who needs to see your unit's section of OSL PULSE?" sub="Tick all audiences who should have view access">
                <Checks items={['Adama Thiam (always)','Full OSL Team','WHO AFRO Regional Director','Country Office Focal Points','Procurement Team','WHE / Emergencies leadership','Partner organizations (UNICEF, WFP, UNHCR)','Donor / funding bodies','HQ (Geneva)']} sel={s.viewers} tog={v => tog('viewers', v)} />
              </Q>
              <BtnRow onBack={back} onNext={next} />
            </div>
          </div>
        )}

        {/* ── STEP 5: REPORTING ─────────────────────────────────── */}
        {step === 5 && (
          <div className="fade-up" style={card}>
            <SecBadge letter="F" title="Reporting, Outputs & Publications" sub="How this system generates and delivers information — and beyond the weekly report" />
            <div style={{ padding: '24px 28px' }}>
              <Q n={22} text="What formats do you need for the weekly auto-generated OSL report?" sub="Tick all required formats">
                <Checks items={['Word (.docx) — for editing and sign-off','PDF — for distribution and archiving','Excel (.xlsx) — for data review and pivot tables','HTML email summary — for weekly broadcast','PowerPoint (.pptx) — for leadership briefings']} sel={s.reportFormats} tog={v => tog('reportFormats', v)} />
              </Q>
              <Q n={23} text="What level of detail should the weekly report contain for your unit?" sub="Tick one">
                <Radio items={['Full detail — all KPIs, all country updates, all actions','Executive summary — top-line numbers and critical flags only','Two-tier — summary page upfront + detailed annex','Exception-only — flag what is off-track or at risk']} sel={s.reportDetailLevel} set={v => upd('reportDetailLevel', v)} />
              </Q>
              <Q n={24} text="Can OSL PULSE data and reports also feed into publications?" sub="Think quarterly briefings, donor reports, programme reviews, and formal WHO publications. What data from your unit would be useful in an official OSL publication?">
                <textarea value={s.publicationData} onChange={e => upd('publicationData', e.target.value)} placeholder="e.g. cumulative shipment values per country, beneficiary numbers, response timelines, supply gap closures..." rows={4} />
              </Q>
              <Q n={25} text="Are there specific reporting periods or deadlines we need to design the system around?" sub="e.g. Monday 8 AM auto-report, Wednesday 3 PM briefing lock, end-of-month donor summary, quarterly AFRO report">
                <textarea value={s.reportingDeadlines} onChange={e => upd('reportingDeadlines', e.target.value)} placeholder="List all key reporting windows your unit is tied to..." rows={3} />
              </Q>
              <Q n={26} text="How important is OSL PULSE to your ability to do your job effectively?" sub="Rate 1 to 5">
                <ScaleRow val={s.importanceRating} set={n => upd('importanceRating', n)} />
              </Q>
              <BtnRow onBack={back} onNext={next} />
            </div>
          </div>
        )}

        {/* ── STEP 6: FINAL + REVIEW ────────────────────────────── */}
        {step === 6 && (
          <div className="fade-up" style={card}>
            <SecBadge letter="G" title="Special Requests, Wishlist & Review" sub="Your space — anything not captured above, then review and submit" />
            <div style={{ padding: '24px 28px' }}>
              <Q n={27} text="Is there anything specific to your unit's work that we haven't covered in this survey?" sub="Unique workflow, special data requirement, edge case, or feature that would make a real difference to your team">
                <textarea value={s.specialRequests} onChange={e => upd('specialRequests', e.target.value)} placeholder="Nothing is out of scope — if it matters to your work, write it down..." rows={5} />
              </Q>
              <Q n={28} text="Are there external systems or data sources OSL PULSE absolutely needs to connect with?" sub="e.g. BMS live feed, AFRO IM maps, ReliefWeb, partner data systems, national MoH databases, OCHA systems">
                <textarea value={s.integrationsNeeded} onChange={e => upd('integrationsNeeded', e.target.value)} placeholder="List every external data source your unit depends on..." rows={3} />
              </Q>
              <Q n={29} text="What would make you describe OSL PULSE as something you could not operate without?" sub="This is the most important question in the survey. Think about your Monday morning. What does this system need to do for you?">
                <textarea value={s.indispensable} onChange={e => upd('indispensable', e.target.value)} placeholder="Be specific — the one thing that, if it existed, would save you significant time or prevent a critical failure..." rows={5} />
              </Q>

              {/* ── Q30 ─────────────────────────────────────────────── */}
              <div style={{ background: BLUE_PALE, border: `2px solid ${BLUE_MID}`, borderRadius: 4, padding: '16px 18px', marginBottom: 26 }}>
                <Q n={30} text="Is there anything else — not captured anywhere in this survey — that you would like added, integrated, or visible in OSL PULSE?" sub="This is your open page. No structure, no categories. Anything at all — a data source, a view, a connection, a feature, an alert, a report, an automation, something from another tool you wish existed here. Write it all down.">
                  <textarea
                    value={s.openWishlist}
                    onChange={e => upd('openWishlist', e.target.value)}
                    placeholder={`Examples of what people put here:\n— "I wish I could see country risk alerts automatically when a new outbreak is confirmed"\n— "An automated email to my country focal point when their shipment clears customs"\n— "A section that tracks my team's action items with due dates and owners"\n— "Something that pulls ReliefWeb updates for my countries every morning"\n— Anything. Write it exactly as it comes to mind.`}
                    rows={8}
                    style={{ fontFamily: 'inherit', fontSize: 13 }}
                  />
                </Q>
              </div>

              <Divider label="Review your answers before submitting" />
              <Summary s={s} />

              {err && (
                <div style={{ marginTop: 14, padding: '11px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 3, color: '#991B1B', fontSize: 12, fontFamily: 'monospace' }}>{err}</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 18, borderTop: `1px solid ${BORDER}` }}>
                <button onClick={back} style={{ padding: '10px 22px', border: `2px solid ${BORDER}`, background: WHITE, borderRadius: 3, fontFamily: 'monospace', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: MUTED, cursor: 'pointer' }}>← Edit Answers</button>
                <button onClick={submit} disabled={submitting} style={{
                  padding: '12px 36px', background: submitting ? MUTED : BLUE,
                  color: WHITE, border: 'none', borderRadius: 3,
                  fontFamily: 'monospace', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: submitting ? 'none' : '0 4px 18px rgba(0,90,156,0.35)',
                  transition: 'all 0.2s',
                }}>
                  {submitting ? '⏳ Submitting...' : '✓ Submit to OSL PULSE'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `3px solid ${BLUE_MID}`, background: BLUE, padding: '14px 24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', fontSize: 10, letterSpacing: 1 }}>
          WHO AFRO · OSL PULSE · Emergencies Programme Supply Chain Intelligence · 2026
        </p>
      </div>
    </div>
  )
}
