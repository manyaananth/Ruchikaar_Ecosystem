import { useEffect, useState } from "react"

const PHASES = [
  { emoji: "🧠", label: "Reading your preferences…",       tip: "The AI chef is selecting the best flavour profile for you." },
  { emoji: "🌦",  label: "Checking weather context…",       tip: "Weather influences spice levels and cooking techniques." },
  { emoji: "🥘", label: "Crafting the recipe…",             tip: "Finding the perfect balance of spices, proteins, and carbs." },
  { emoji: "📝", label: "Writing cooking steps…",           tip: "Each step is tailored for a home kitchen." },
  { emoji: "🍽", label: "Calculating nutrition facts…",     tip: "Real-world macros based on your actual ingredients." },
  { emoji: "✨", label: "Polishing your recipe…",           tip: "Adding the chef's finishing touches." },
]

const COOKING_FACTS = [
  "Turmeric has been used in Indian cooking for over 4,000 years.",
  "The word 'curry' comes from the Tamil word 'kari'.",
  "India has the world's largest vegetarian population.",
  "Biryani has 26+ regional variants across India.",
  "Cumin seeds contain more iron per gram than red meat.",
  "Ghee has a higher smoke point than olive oil — ideal for high-heat cooking.",
  "Cardamom is the world's third most expensive spice.",
  "Asafoetida (hing) is the best natural substitute for onion and garlic.",
]

export default function RecipeLoader({ isDark }) {
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [factIdx, setFactIdx]   = useState(0)
  const [progress, setProgress] = useState(0)
  const [dots, setDots]         = useState(".")

  // Cycle through phases
  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIdx(i => Math.min(i + 1, PHASES.length - 1))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Rotate fun facts
  useEffect(() => {
    setFactIdx(Math.floor(Math.random() * COOKING_FACTS.length))
    const interval = setInterval(() => {
      setFactIdx(i => (i + 1) % COOKING_FACTS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Animated progress bar (fake, resets at 90%)
  useEffect(() => {
    let val = 0
    const tick = setInterval(() => {
      val += Math.random() * 2.5
      if (val >= 90) { clearInterval(tick); val = 90 }
      setProgress(Math.round(val))
    }, 400)
    return () => clearInterval(tick)
  }, [])

  // Animated dots
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 450)
    return () => clearInterval(t)
  }, [])

  const phase = PHASES[phaseIdx]
  const bg    = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.88)"
  const sub   = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.38)"

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 28, padding: "2rem 1rem", textAlign: "center"
    }}>

      {/* Animated pan icon */}
      <div style={{ position: "relative", width: 100, height: 100 }}>
        {/* Steam rings */}
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: "absolute",
            left: `${28 + i * 14}px`, top: "-20px",
            width: 14, height: 14, borderRadius: "50%",
            border: "2px solid rgba(249,115,22,0.45)",
            animation: `steamRise 1.8s ease-in-out ${i * 0.45}s infinite`,
            opacity: 0,
          }} />
        ))}
        {/* Pan body */}
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          background: "linear-gradient(135deg, #7c2d12, #f97316)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 44,
          boxShadow: "0 8px 36px rgba(249,115,22,0.5)",
          animation: "pulsePan 2s ease-in-out infinite",
        }}>
          {phase.emoji}
        </div>
      </div>

      {/* Phase label */}
      <div>
        <div style={{
          fontSize: 18, fontWeight: 800,
          fontFamily: "'Playfair Display', serif",
          background: "linear-gradient(135deg, #f97316, #fbbf24)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: 6
        }}>
          {phase.label.replace("…", dots)}
        </div>
        <div style={{ fontSize: 13, color: sub, fontFamily: "'DM Sans', sans-serif", maxWidth: 280, lineHeight: 1.6 }}>
          {phase.tip}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: 320 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: sub, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Cooking progress
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#f97316", fontFamily: "'DM Sans', sans-serif" }}>
            {progress}%
          </span>
        </div>
        <div style={{
          height: 8, borderRadius: 99,
          background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          overflow: "hidden"
        }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            borderRadius: 99,
            background: "linear-gradient(90deg, #ea580c, #f97316, #fbbf24)",
            transition: "width 0.4s ease",
            boxShadow: "0 0 12px rgba(249,115,22,0.6)",
          }} />
        </div>
      </div>

      {/* Phase steps */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", maxWidth: 340 }}>
        {PHASES.map((p, i) => (
          <div key={i} style={{
            width: 32, height: 32, borderRadius: 10, fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: i < phaseIdx
              ? "linear-gradient(135deg,#f97316,#ea580c)"
              : i === phaseIdx
              ? "rgba(249,115,22,0.25)"
              : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            border: i === phaseIdx ? "2px solid #f97316" : "2px solid transparent",
            transition: "all 0.4s ease",
            boxShadow: i === phaseIdx ? "0 0 12px rgba(249,115,22,0.5)" : "none",
          }}>
            {i < phaseIdx ? "✓" : p.emoji}
          </div>
        ))}
      </div>

      {/* Fun fact card */}
      <div style={{
        background: bg,
        border: `1px solid ${isDark ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.2)"}`,
        borderRadius: 18, padding: "14px 20px", maxWidth: 320, width: "100%",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          fontSize: 10, fontFamily: "'DM Sans', sans-serif",
          textTransform: "uppercase", letterSpacing: "0.1em",
          color: "#f97316", fontWeight: 700, marginBottom: 6
        }}>
          🍛 Did you know?
        </div>
        <div style={{
          fontSize: 13, fontFamily: "'DM Sans', sans-serif",
          color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.6)",
          lineHeight: 1.6,
          animation: "factFade 0.5s ease",
          key: factIdx,
        }}>
          {COOKING_FACTS[factIdx]}
        </div>
      </div>

      <style>{`
        @keyframes pulsePan {
          0%, 100% { transform: scale(1) rotate(-3deg); }
          50%       { transform: scale(1.07) rotate(3deg); }
        }
        @keyframes steamRise {
          0%   { opacity: 0; transform: translateY(0) scale(0.6); }
          40%  { opacity: 0.8; }
          100% { opacity: 0; transform: translateY(-36px) scale(1.4); }
        }
        @keyframes factFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
