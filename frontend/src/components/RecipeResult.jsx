import { ArrowLeft } from "lucide-react"
import TopNav from "./TopNav"
import RecipeCard from "./RecipeCard"

export default function RecipeResult({ ctx }) {
  const { isDark, recipe, setScreen, user } = ctx

  if (!recipe) {
    setScreen("home")
    return null
  }

  const dimText = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)"

  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#0f0d0b" : "#faf6f0" }}>
      <TopNav ctx={ctx} />

      {/* Scroll container */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "1.25rem 1rem 4rem" }}>

        {/* Back link */}
        <button
          onClick={() => setScreen("home")}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: dimText,
            fontSize: 12, fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600, marginBottom: "1rem", padding: "6px 0",
            transition: "color 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#f97316"}
          onMouseLeave={e => e.currentTarget.style.color = dimText}
        >
          <ArrowLeft size={14} /> Back to Home
        </button>

        {/* Rich Recipe Card */}
        <RecipeCard recipe={recipe} isDark={isDark} user={user} />

        {/* Try Another CTA */}
        <button
          onClick={() => setScreen("home")}
          style={{
            marginTop: "1.25rem", width: "100%",
            padding: "0.9rem", borderRadius: 16,
            background: "linear-gradient(135deg,#f97316,#ea580c)",
            border: "none", color: "#fff",
            fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.03em",
            boxShadow: "0 6px 28px rgba(249,115,22,0.4)",
            transition: "transform 0.15s, box-shadow 0.15s"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-2px)"
            e.currentTarget.style.boxShadow = "0 12px 36px rgba(249,115,22,0.5)"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "none"
            e.currentTarget.style.boxShadow = "0 6px 28px rgba(249,115,22,0.4)"
          }}
        >
          ✨ Try Another Recipe
        </button>
      </div>
    </div>
  )
}
