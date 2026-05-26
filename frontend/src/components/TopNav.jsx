import { Sun, Moon, Flame, ArrowLeft, Bookmark, Archive } from "lucide-react"
import { useState } from "react"

export default function TopNav({ ctx }) {
  const { isDark, setIsDark, screen, setScreen, prefs, user } = ctx
  const [moonHover, setMoonHover] = useState(false)
  const [avatarHover, setAvatarHover] = useState(false)
  const [savedHover, setSavedHover] = useState(false)
  const [fridgeHover, setFridgeHover] = useState(false)

  const initials = user ? (user.name || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) : "?"

  const iconBtn = {
    background: "transparent",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
    borderRadius: 10, width: 38, height: 38,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", transition: "all 0.2s",
    color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"
  }

  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "1rem 1.25rem",
      borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
      background: isDark ? "rgba(15,13,11,0.95)" : "rgba(250,246,240,0.95)",
      backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 50
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {screen !== "home" && (
          <button style={iconBtn} onClick={() => setScreen("home")}>
            <ArrowLeft size={16} />
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Flame size={20} color="#f97316" />
          <span style={{ fontSize: 18, fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#f97316" }}>Ruchikaar</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Prefs pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "4px 12px", borderRadius: 99, fontSize: 11,
          fontFamily: "'DM Sans', sans-serif",
          background: isDark ? "rgba(249,115,22,0.12)" : "rgba(249,115,22,0.1)",
          border: "1px solid rgba(249,115,22,0.25)",
          color: "#f97316", cursor: "pointer"
        }} onClick={() => setScreen("onboarding")} title="Edit preferences">
          <span>⏱ {prefs.time}m</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>👤 {prefs.servings}</span>
          {prefs.vegOnly && (
            <>
              <span style={{ opacity: 0.4 }}>·</span>
              <span style={{ color: "#22c55e", fontWeight: 700 }}>🌱 VEG</span>
            </>
          )}
        </div>

        {/* Saved recipes button */}
        {user && (
          <button
            style={{ ...iconBtn, borderColor: savedHover ? "rgba(249,115,22,0.4)" : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"), background: savedHover ? "rgba(249,115,22,0.08)" : "transparent" }}
            onMouseEnter={() => setSavedHover(true)}
            onMouseLeave={() => setSavedHover(false)}
            onClick={() => setScreen("saved")}
            title="Saved Recipes"
          >
            <Bookmark size={16} color={savedHover ? "#f97316" : (isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)")} />
          </button>
        )}

        {/* Fridge Inventory button */}
        {user && (
          <button
            style={{ ...iconBtn, borderColor: fridgeHover ? "rgba(16,185,129,0.4)" : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"), background: fridgeHover ? "rgba(16,185,129,0.08)" : "transparent" }}
            onMouseEnter={() => setFridgeHover(true)}
            onMouseLeave={() => setFridgeHover(false)}
            onClick={() => setScreen("inventory")}
            title="Fridge Inventory"
          >
            <Archive size={16} color={fridgeHover ? "#10b981" : (isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)")} />
          </button>
        )}

        {/* Theme toggle */}
        <button
          style={{ ...iconBtn, borderColor: isDark ? "rgba(249,115,22,0.3)" : "rgba(249,115,22,0.3)" }}
          onMouseEnter={() => setMoonHover(true)}
          onMouseLeave={() => setMoonHover(false)}
          onClick={() => setIsDark(!isDark)}
        >
          {isDark
            ? <Sun size={16} color={moonHover ? "#f97316" : "#f0ebe3"} />
            : <Moon size={16} color={moonHover ? "#f97316" : "#1a1208"} />
          }
        </button>

        {/* User avatar → profile */}
        {user && (
          <button
            onClick={() => setScreen("profile")}
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
            title={`${user.name} — View Profile`}
            style={{
              width: 38, height: 38, borderRadius: "50%",
              background: avatarHover ? "linear-gradient(135deg, #ff8c42, #e83820)" : "linear-gradient(135deg, #f97316, #dc2626)",
              border: "2px solid rgba(249,115,22,0.4)",
              color: "#fff", fontSize: 13, fontWeight: 800,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: avatarHover ? "0 4px 16px rgba(249,115,22,0.45)" : "0 2px 8px rgba(249,115,22,0.25)",
              transition: "all 0.2s", flexShrink: 0
            }}
          >
            {initials}
          </button>
        )}
      </div>
    </nav>
  )
}
