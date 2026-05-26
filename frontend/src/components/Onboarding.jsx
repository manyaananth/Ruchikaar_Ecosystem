import { useState } from "react"
import { Clock, Users, ChevronRight, Flame, Leaf } from "lucide-react"

const S = {
  wrap: (dark) => ({
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "2rem", position: "relative", overflow: "hidden"
  }),
  blob: {
    position: "absolute", borderRadius: "50%", filter: "blur(80px)",
    opacity: 0.18, pointerEvents: "none"
  },
  card: (dark) => ({
    background: dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)",
    border: `1px solid ${dark ? "rgba(255,180,60,0.15)" : "rgba(180,120,20,0.18)"}`,
    borderRadius: 24, padding: "2.5rem 2rem",
    backdropFilter: "blur(12px)", width: "100%", maxWidth: 440,
    boxShadow: dark ? "0 8px 48px rgba(0,0,0,0.5)" : "0 8px 40px rgba(0,0,0,0.08)"
  }),
  label: (dark) => ({
    fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
    color: dark ? "#c97d30" : "#a05c10", fontFamily: "'DM Sans', sans-serif",
    marginBottom: 10, display: "flex", alignItems: "center", gap: 6
  }),
  slider: (dark) => ({
    WebkitAppearance: "none", appearance: "none",
    width: "100%", height: 4, borderRadius: 99,
    background: dark
      ? "linear-gradient(to right, #f97316, #f97316 var(--pct,50%), rgba(255,255,255,0.12) var(--pct,50%))"
      : "linear-gradient(to right, #ea6c00, #ea6c00 var(--pct,50%), rgba(0,0,0,0.1) var(--pct,50%))",
    outline: "none", cursor: "pointer"
  }),
  val: (dark) => ({
    fontSize: 48, fontFamily: "'Playfair Display', serif",
    fontWeight: 700, color: "#f97316", lineHeight: 1,
    textShadow: "0 0 40px rgba(249,115,22,0.3)"
  }),
  servingBtn: (active, dark) => ({
    width: 52, height: 52, borderRadius: 14,
    border: active
      ? "2px solid #f97316"
      : `2px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`,
    background: active
      ? "rgba(249,115,22,0.18)"
      : dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    color: active ? "#f97316" : dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)",
    fontSize: 18, fontWeight: 700, cursor: "pointer",
    transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Playfair Display', serif"
  }),
  cta: {
    width: "100%", padding: "1rem", borderRadius: 14,
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    border: "none", color: "#fff", fontSize: 15, fontWeight: 700,
    letterSpacing: "0.04em", cursor: "pointer", display: "flex",
    alignItems: "center", justifyContent: "center", gap: 8,
    fontFamily: "'DM Sans', sans-serif",
    boxShadow: "0 4px 24px rgba(249,115,22,0.35)",
    transition: "transform 0.15s, box-shadow 0.15s"
  }
}

export default function Onboarding({ ctx }) {
  const { isDark, setScreen, prefs, setPrefs } = ctx
  const [hovered, setHovered] = useState(false)

  const timePct = `${((prefs.time - 5) / 115) * 100}%`
  const servingOptions = [1, 2, 3, 4, 6, 8]

  return (
    <div style={S.wrap(isDark)}>
      {/* Background blobs */}
      <div style={{ ...S.blob, width: 400, height: 400, background: "#f97316", top: -100, right: -100 }} />
      <div style={{ ...S.blob, width: 300, height: 300, background: "#7c2d12", bottom: -80, left: -80 }} />

      {/* Logo */}
      <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <Flame size={28} color="#f97316" />
          <span style={{ fontSize: 32, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#f97316", letterSpacing: "-0.01em" }}>
            Ruchikaar
          </span>
        </div>
        <p style={{ fontSize: 13, opacity: 0.45, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Your AI Kitchen Companion
        </p>
      </div>

      <div style={S.card(isDark)}>
        {/* Time */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={S.label(isDark)}>
            <Clock size={12} /> How much time do you have?
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 16 }}>
            <span style={S.val(isDark)}>{prefs.time}</span>
            <span style={{ fontSize: 15, opacity: 0.5, fontFamily: "'DM Sans', sans-serif" }}>minutes</span>
          </div>
          <input
            type="range" min={5} max={120} step={5}
            value={prefs.time}
            style={{ ...S.slider(isDark), "--pct": timePct }}
            onChange={e => setPrefs(p => ({ ...p, time: +e.target.value }))}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, opacity: 0.3, fontSize: 11, fontFamily: "'DM Sans', sans-serif" }}>
            <span>5 min</span><span>120 min</span>
          </div>
        </div>

        <div style={{ height: 1, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)", margin: "0 0 1.8rem" }} />

        {/* Servings */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={S.label(isDark)}>
            <Users size={12} /> Number of servings
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {servingOptions.map(n => (
              <button
                key={n}
                style={S.servingBtn(prefs.servings === n, isDark)}
                onClick={() => setPrefs(p => ({ ...p, servings: n }))}
              >
                {n}
              </button>
            ))}
          </div>
          <p style={{ marginTop: 10, fontSize: 12, opacity: 0.35, fontFamily: "'DM Sans', sans-serif" }}>
            Selected: {prefs.servings} {prefs.servings === 1 ? "person" : "people"}
          </p>
        </div>

        {/* Veg Only Toggle */}
        <div style={{ marginBottom: "2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", padding: "1rem 1.25rem", borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Leaf size={20} color="#22c55e" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>100% Vegetarian</div>
              <div style={{ fontSize: 12, opacity: 0.5, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>Exclude meat, poultry & seafood</div>
            </div>
          </div>
          
          <div 
            onClick={() => setPrefs(p => ({ ...p, vegOnly: !p.vegOnly }))}
            style={{
              width: 50, height: 28, borderRadius: 99,
              background: prefs.vegOnly ? "#22c55e" : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
              position: "relative", cursor: "pointer", transition: "all 0.3s",
              boxShadow: prefs.vegOnly ? "0 2px 12px rgba(34,197,94,0.4)" : "none"
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: "50%", background: "#fff",
              position: "absolute", top: 3, left: prefs.vegOnly ? 25 : 3,
              transition: "all 0.3s", boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
            }} />
          </div>
        </div>

        <button
          style={{ ...S.cta, transform: hovered ? "translateY(-2px)" : "none", boxShadow: hovered ? "0 8px 32px rgba(249,115,22,0.45)" : "0 4px 24px rgba(249,115,22,0.35)" }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setScreen("home")}
        >
          Let's Cook <ChevronRight size={18} />
        </button>
      </div>

      <p style={{ marginTop: 20, fontSize: 11, opacity: 0.25, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.06em" }}>
        Powered by local AI · 100% private
      </p>
    </div>
  )
}
