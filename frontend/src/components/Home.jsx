import { useState } from "react"
import SpinWheel from "./SpinWheel"
import IngredientInput from "./IngredientInput"
import HealthAuditTab from "./HealthAuditTab"
import TopNav from "./TopNav"
import RegionalRandom from "./RegionalRandom"

const TABS = [
  {
    id: "wheel",
    label: "Surprise Me",
    emoji: "🎡",
    desc: "Let fate decide your meal",
    gradient: "linear-gradient(135deg,#f97316,#ea580c)"
  },
  {
    id: "ingredient",
    label: "By Ingredients",
    emoji: "🥦",
    desc: "Cook with what you have",
    gradient: "linear-gradient(135deg,#22c55e,#16a34a)"
  },
  {
    id: "regional",
    label: "Regional Classics",
    emoji: "🍛",
    desc: "North & South Indian dishes",
    gradient: "linear-gradient(135deg,#a855f7,#7c3aed)"
  },
  {
    id: "health",
    label: "Health Audit",
    emoji: "🏥",
    desc: "Scan & rate food labels",
    gradient: "linear-gradient(135deg,#3b82f6,#2563eb)"
  },
]

const FOOD_WORDS = ["Biryani", "Dosa", "Paneer", "Chole", "Idli", "Dal Makhani", "Samosa", "Uttapam", "Lassi", "Pav Bhaji"]

export default function Home({ ctx }) {
  const [tab, setTab] = useState("wheel")
  const { isDark } = ctx

  const active = TABS.find(t => t.id === tab)

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Ambient background blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-15%", right: "-10%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)"
        }} />
        <div style={{
          position: "absolute", bottom: "5%", left: "-15%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(234,88,12,0.08) 0%, transparent 70%)"
        }} />
        <div style={{
          position: "absolute", top: "40%", left: "55%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)"
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
        <TopNav ctx={ctx} />

        {/* ── Hero strip ─────────────────────── */}
        <div style={{
          background: isDark
            ? "linear-gradient(180deg, rgba(124,45,18,0.18) 0%, transparent 100%)"
            : "linear-gradient(180deg, rgba(255,237,213,0.7) 0%, transparent 100%)",
          padding: "1.75rem 1.25rem 0",
          textAlign: "center"
        }}>
          {/* Floating food words marquee */}
          <div style={{ overflow: "hidden", marginBottom: 12 }}>
            <div style={{
              display: "flex", gap: "2rem", width: "max-content",
              animation: "marquee 18s linear infinite"
            }}>
              {[...FOOD_WORDS, ...FOOD_WORDS].map((w, i) => (
                <span key={i} style={{
                  fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                  color: isDark ? "rgba(249,115,22,0.45)" : "rgba(194,68,15,0.45)",
                  fontWeight: 600, whiteSpace: "nowrap"
                }}>
                  {w}
                </span>
              ))}
            </div>
          </div>

          {/* Tagline */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.6rem, 5vw, 2.4rem)",
            fontWeight: 800, lineHeight: 1.2, margin: "0 0 6px",
            background: "linear-gradient(135deg, #f97316 0%, #fbbf24 60%, #ea580c 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            What's Your Hunger Today?
          </h1>
          <p style={{
            fontSize: 14, fontFamily: "'DM Sans', sans-serif",
            color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
            margin: "0 auto 1.25rem", maxWidth: 320, lineHeight: 1.55
          }}>
            AI-powered recipes tailored to your ingredients, mood & health goals
          </p>
        </div>

        {/* ── Tab cards ──────────────────────── */}
        <div style={{
          display: "flex", gap: 10, padding: "0 1rem 1rem",
          justifyContent: "center", flexWrap: "wrap",
          maxWidth: 640, margin: "0 auto", width: "100%"
        }}>
          {TABS.map(t => {
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  flex: "1 1 auto", minWidth: 100, maxWidth: 180,
                  padding: "14px 16px", borderRadius: 18,
                  border: isActive
                    ? "2px solid transparent"
                    : `2px solid ${isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
                  background: isActive
                    ? t.gradient
                    : isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
                  cursor: "pointer", textAlign: "center",
                  transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                  transform: isActive ? "translateY(-3px) scale(1.03)" : "none",
                  boxShadow: isActive
                    ? "0 8px 28px rgba(249,115,22,0.35)"
                    : isDark ? "none" : "0 2px 12px rgba(0,0,0,0.06)"
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>{t.emoji}</div>
                <div style={{
                  fontSize: 13, fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  color: isActive ? "#fff" : isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                  marginBottom: 3
                }}>
                  {t.label}
                </div>
                <div style={{
                  fontSize: 10, fontFamily: "'DM Sans', sans-serif",
                  color: isActive ? "rgba(255,255,255,0.75)" : isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)",
                  lineHeight: 1.3
                }}>
                  {t.desc}
                </div>
              </button>
            )
          })}
        </div>

        {/* ── Active tab indicator strip ─────── */}
        <div style={{
          maxWidth: 640, margin: "0 auto", width: "100%",
          padding: "0 1rem 1rem"
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 16px", borderRadius: 12,
            background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.6)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`,
            backdropFilter: "blur(8px)"
          }}>
            <span style={{ fontSize: 18 }}>{active.emoji}</span>
            <div>
              <div style={{
                fontSize: 13, fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)"
              }}>
                {active.label}
              </div>
              <div style={{
                fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)"
              }}>
                {active.desc}
              </div>
            </div>
            {/* Hunger meter */}
            <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <span style={{
                fontSize: 10, fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase", letterSpacing: "0.08em",
                color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"
              }}>
                hunger
              </span>
              <div style={{ display: "flex", gap: 3 }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{
                    width: 6, height: 18,
                    borderRadius: 3,
                    background: i < 4
                      ? `linear-gradient(180deg,#f97316,#ea580c)`
                      : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                    transform: `scaleY(${0.5 + i * 0.15})`,
                    transformOrigin: "bottom"
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Content panel ──────────────────── */}
        <div style={{
          flex: 1, padding: "0 1rem 4rem",
          maxWidth: tab === "regional" ? 960 : 640, margin: "0 auto", width: "100%",
          transition: "max-width 0.4s ease"
        }}>
          {/* Glass card wrapper */}
          <div style={{
            background: isDark ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.7)",
            borderRadius: 24,
            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"}`,
            padding: "1.5rem 1.25rem",
            backdropFilter: "blur(12px)",
            boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.4)" : "0 8px 40px rgba(0,0,0,0.08)"
          }}>
            {tab === "wheel"      && <SpinWheel ctx={ctx} />}
            {tab === "ingredient" && <IngredientInput ctx={ctx} />}
            {tab === "regional"   && <RegionalRandom ctx={ctx} />}
            {tab === "health"     && <HealthAuditTab ctx={ctx} />}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0) }
          to   { transform: translateX(-50%) }
        }
      `}</style>
    </div>
  )
}
