import { useState, useRef, useEffect } from "react"
import axios from "../axios"
import WeatherRegionPanel from "./WeatherRegionPanel"
import RecipeLoader from "./RecipeLoader"

const CUISINES = [
  "South Indian", "Punjabi", "Bengali", "Rajasthani",
  "Gujarati", "Kerala", "Hyderabadi", "Mughlai",
  "Street Food", "Healthy Bowl", "Comfort Food", "Quick Bites"
]

// Rich, distinct colours — alternating dark/medium so text always contrasts
const SEGMENT_COLORS = [
  "#7c2d12","#c2440f","#9a3412","#ea580c",
  "#b45309","#d97706","#92400e","#f97316",
  "#7c2d12","#c2410c","#a16207","#dc6803"
]

function hexLuminance(hex) {
  const c = hex.replace("#", "")
  const [r, g, b] = [0, 2, 4].map(o => {
    const v = parseInt(c.slice(o, o + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ")
  const lines = []
  let current = ""
  for (const word of words) {
    const test = current ? current + " " + word : word
    if (ctx.measureText(test).width <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines
}

function drawWheel(canvas, rotation) {
  if (!canvas) return
  const ctx = canvas.getContext("2d")
  const size = canvas.width
  const cx = size / 2, cy = size / 2
  const r = size / 2 - 10
  const slice = (2 * Math.PI) / CUISINES.length

  ctx.clearRect(0, 0, size, size)

  // Outer glow ring
  const grad = ctx.createRadialGradient(cx, cy, r - 6, cx, cy, r + 8)
  grad.addColorStop(0, "rgba(249,115,22,0.6)")
  grad.addColorStop(1, "transparent")
  ctx.beginPath(); ctx.arc(cx, cy, r + 6, 0, Math.PI * 2)
  ctx.strokeStyle = grad; ctx.lineWidth = 10; ctx.stroke()

  CUISINES.forEach((label, i) => {
    const start = rotation + i * slice
    const end = start + slice
    const bg = SEGMENT_COLORS[i % SEGMENT_COLORS.length]
    const lum = hexLuminance(bg)
    const textColor = lum > 0.18 ? "#1c0800" : "#ffffff"

    // Slice fill
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, r, start, end)
    ctx.closePath()
    ctx.fillStyle = bg
    ctx.fill()

    // Segment border
    ctx.strokeStyle = "rgba(255,255,255,0.15)"
    ctx.lineWidth = 1.5
    ctx.stroke()

    // Label
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(start + slice / 2)

    // Text shadow for legibility
    ctx.shadowColor = lum > 0.18 ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.6)"
    ctx.shadowBlur = 4

    ctx.fillStyle = textColor
    ctx.font = `bold 12px 'DM Sans', sans-serif`
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"

    const textRadius = r - 12
    const maxW = textRadius * 0.72

    const lines = wrapText(ctx, label, maxW)
    const lineH = 14
    const totalH = lines.length * lineH
    lines.forEach((line, li) => {
      ctx.fillText(line, textRadius, -totalH / 2 + li * lineH + lineH / 2)
    })

    ctx.shadowBlur = 0
    ctx.restore()
  })

  // Center circle with gradient
  const cGrad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, 30)
  cGrad.addColorStop(0, "#f97316")
  cGrad.addColorStop(1, "#7c2d12")
  ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2)
  ctx.fillStyle = cGrad
  ctx.fill()
  ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 2; ctx.stroke()

  // Center emoji
  ctx.font = "bold 20px serif"
  ctx.textAlign = "center"; ctx.textBaseline = "middle"
  ctx.shadowBlur = 0
  ctx.fillText("🍽", cx, cy)
}

export default function SpinWheel({ ctx }) {
  const { isDark, setScreen, setRecipe, prefs } = ctx
  const canvasRef = useRef()
  const rafRef = useRef()
  const rotRef = useRef(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showWeather, setShowWeather] = useState(false)
  const [weather, setWeather] = useState({ condition: "Clear", region: "Bangalore" })

  useEffect(() => {
    drawWheel(canvasRef.current, rotRef.current)
  }, [isDark])

  function spin() {
    if (spinning || loading) return
    setSpinning(true); setResult(null)

    const target = rotRef.current + (Math.PI * 8) + Math.random() * Math.PI * 6
    const duration = 4000
    const start = performance.now()
    const startRot = rotRef.current

    function frame(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      rotRef.current = startRot + (target - startRot) * ease
      drawWheel(canvasRef.current, rotRef.current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(frame)
      } else {
        setSpinning(false)
        const norm = ((rotRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        const slice = (2 * Math.PI) / CUISINES.length
        const idx = Math.floor((CUISINES.length - (norm / slice)) % CUISINES.length)
        const picked = CUISINES[Math.abs(idx) % CUISINES.length]
        setResult(picked)
      }
    }
    rafRef.current = requestAnimationFrame(frame)
  }

  async function generate(cuisine) {
    setLoading(true)
    try {
      const res = await axios.post("/api/recipe/generate", {
        ingredients: [],
        cuisine,
        weather_condition: weather.condition,
        region: weather.region,
        time_minutes: prefs.time,
        servings: prefs.servings,
        vegOnly: prefs.vegOnly
      })
      setRecipe(res.data)
      setScreen("result")
    } catch {
      setRecipe({
        title: `${cuisine} Delight`,
        description: `A beautiful ${cuisine} recipe crafted for ${weather.condition} weather in ${weather.region}.`,
        ingredients_used: ["onion", "tomato", "garlic", "ginger", "spices", "oil", "salt", "coriander"],
        steps: [
          "Heat 2 tablespoons of oil in a heavy-bottomed pan over medium flame. Once hot, add cumin seeds and let them splutter for 30 seconds until aromatic.",
          "Add finely chopped onions and sauté for 8–10 minutes, stirring frequently, until they turn golden brown and caramelized. This step builds the base flavour.",
          "Add the ginger-garlic paste and cook for 2 minutes until the raw smell disappears. Then add chopped tomatoes and mix well.",
          "Stir in turmeric, red chilli powder, coriander powder and salt. Cook on medium-low heat for 5–6 minutes until the oil separates from the masala.",
          "Add the main protein or vegetable ingredient, stir to coat with the masala, and cook covered for 10–12 minutes until fully cooked through.",
          "Add 100ml of water if needed, adjust seasoning, and simmer for 3 more minutes. Finish with fresh coriander leaves and a squeeze of lemon.",
          "Serve hot with steamed rice, roti, or naan. Garnish with a drizzle of ghee for extra richness and authentic flavour."
        ],
        nutrition_per_serving: { protein_g: 12, carbs_g: 38, fat_g: 9, calories: 280, fiber_g: 4, sugar_g: 5, sodium_mg: 320 },
        health_score: 72, prep_time: `${prefs.time} mins`, servings: prefs.servings
      })
      setScreen("result")
    } finally { setLoading(false) }
  }

  const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)"
  const border = isDark ? "rgba(249,180,60,0.12)" : "rgba(180,120,20,0.15)"

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
      {/* Weather / Region toggle */}
      <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => setShowWeather(!showWeather)}
          style={{
            fontSize: 12, fontFamily: "'DM Sans', sans-serif",
            background: isDark ? "rgba(249,115,22,0.12)" : "rgba(249,115,22,0.1)",
            border: "1px solid rgba(249,115,22,0.3)",
            color: "#f97316", padding: "5px 14px", borderRadius: 99, cursor: "pointer"
          }}
        >
          🌤 {weather.condition} · 📍 {weather.region} {showWeather ? "▲" : "▼"}
        </button>
      </div>

      {showWeather && (
        <WeatherRegionPanel
          isDark={isDark} weather={weather} setWeather={setWeather}
          onClose={() => setShowWeather(false)}
        />
      )}

      {loading ? (
        <RecipeLoader isDark={isDark} />
      ) : (
        <>
          {/* Canvas wheel */}
          <div style={{ position: "relative" }}>
            {/* Pointer arrow */}
            <div style={{
              position: "absolute", top: "50%", right: -22,
              transform: "translateY(-50%)",
              width: 0, height: 0,
              borderTop: "12px solid transparent",
              borderBottom: "12px solid transparent",
              borderRight: "24px solid #f97316",
              filter: "drop-shadow(0 0 8px rgba(249,115,22,0.7))",
              zIndex: 10
            }} />
            <canvas
              ref={canvasRef} width={360} height={360}
              style={{ borderRadius: "50%", display: "block", cursor: spinning ? "default" : "pointer" }}
              onClick={spin}
            />
          </div>

          {/* Spin button */}
          <button
            onClick={spin}
            disabled={spinning}
            style={{
              padding: "0.85rem 2.5rem", borderRadius: 99,
              background: spinning ? (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)") : "linear-gradient(135deg,#f97316,#ea580c)",
              border: "none", color: spinning ? (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)") : "#fff",
              fontSize: 15, fontWeight: 700, cursor: spinning ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.04em",
              boxShadow: spinning ? "none" : "0 6px 24px rgba(249,115,22,0.4)",
              transition: "all 0.3s"
            }}
          >
            {spinning ? "Spinning…" : "✨ Spin the Wheel"}
          </button>
        </>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={{
          width: "100%", background: cardBg, border: `1px solid ${border}`,
          borderRadius: 18, padding: "1.25rem 1.5rem",
          backdropFilter: "blur(12px)", textAlign: "center",
          animation: "fadeUp 0.4s ease"
        }}>
          <p style={{ fontSize: 12, opacity: 0.45, fontFamily: "'DM Sans', sans-serif", marginBottom: 6 }}>
            The wheel landed on
          </p>
          <p style={{ fontSize: 24, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#f97316", marginBottom: 16 }}>
            {result}
          </p>
          <button
            onClick={() => generate(result)}
            style={{
              padding: "0.75rem 2rem", borderRadius: 12,
              background: "linear-gradient(135deg,#f97316,#ea580c)",
              border: "none", color: "#fff", fontSize: 14, fontWeight: 700,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 4px 20px rgba(249,115,22,0.35)"
            }}
          >
            Generate {result} Recipe →
          </button>
        </div>
      )}

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
