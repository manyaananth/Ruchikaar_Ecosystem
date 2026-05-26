const WEATHER_OPTIONS = ["Clear", "Rainy", "Cloudy", "Cold", "Hot", "Windy", "Snowy", "Humid"]
const REGIONS = [
  "Bangalore", "Mumbai", "Delhi", "Chennai", "Kolkata",
  "Hyderabad", "Pune", "Jaipur", "Ahmedabad", "Kochi",
  "Mysuru", "Goa", "Lucknow", "Bhopal", "Chandigarh"
]

export default function WeatherRegionPanel({ isDark, weather, setWeather, onClose }) {
  const bg = isDark ? "#1a1510" : "#fff8f0"
  const border = isDark ? "rgba(249,115,22,0.15)" : "rgba(249,115,22,0.2)"
  const chip = (active) => ({
    padding: "6px 14px", borderRadius: 99, fontSize: 12,
    fontFamily: "'DM Sans', sans-serif", cursor: "pointer", border: "none",
    transition: "all 0.2s",
    background: active ? "rgba(249,115,22,0.2)" : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
    color: active ? "#f97316" : isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
    outline: active ? "1px solid #f97316" : "none"
  })

  return (
    <div style={{
      width: "100%", background: bg, border: `1px solid ${border}`,
      borderRadius: 18, padding: "1.25rem",
      animation: "fadeUp 0.25s ease"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.45, fontFamily: "'DM Sans', sans-serif" }}>
          🌤 Weather & Region
        </p>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.4, fontSize: 18, color: "inherit" }}>×</button>
      </div>

      <p style={{ fontSize: 11, opacity: 0.4, fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>Weather</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {WEATHER_OPTIONS.map(w => (
          <button key={w} style={chip(weather.condition === w)} onClick={() => setWeather(p => ({ ...p, condition: w }))}>
            {w}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 11, opacity: 0.4, fontFamily: "'DM Sans', sans-serif", marginBottom: 8 }}>Region</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {REGIONS.map(r => (
          <button key={r} style={chip(weather.region === r)} onClick={() => setWeather(p => ({ ...p, region: r }))}>
            {r}
          </button>
        ))}
      </div>
    </div>
  )
}
