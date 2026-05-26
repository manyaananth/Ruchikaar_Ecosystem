import { useState } from "react"
import { Clock, Users, Bookmark, Check, Flame, Beef, Wheat, Droplets, Zap, Leaf, Info, AlertTriangle, CheckCircle } from "lucide-react"
import axios from "axios"

/* ── helpers ──────────────────────────────────────── */
function estimateCalories(n = {}) {
  return Math.round((n.protein_g || 0) * 4 + (n.carbs_g || 0) * 4 + (n.fat_g || 0) * 9)
}

function MacroBar({ label, value, unit, max, color, icon: Icon, bg }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: bg, display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Icon size={13} color={color} />
          </div>
          <span style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, opacity: 0.75 }}>
            {label}
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "'DM Sans', sans-serif" }}>
          {value}{unit}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, borderRadius: 99,
          background: color,
          transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: `0 0 8px ${color}55`
        }} />
      </div>
    </div>
  )
}

// ScoreRing removed as requested

/* ── main component ───────────────────────────────── */
export default function RecipeCard({ recipe, isDark, user }) {
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const n = recipe.nutrition_per_serving || {}
  const calories = n.calories || estimateCalories(n)

  const surface = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
  const border = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"
  const dimText = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)"

  async function saveRecipe() {
    if (saved) return
    setSaveError(false)
    try {
      const userId = user?.id || 1
      await axios.post("/api/recipe/save", { user_id: userId, recipe })
      setSaved(true)
    } catch {
      setSaveError(true)
      setTimeout(() => setSaveError(false), 2500)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── HERO BANNER ───────────────────────────────── */}
      <div style={{
        position: "relative", borderRadius: 24, overflow: "hidden",
        background: "linear-gradient(135deg, #7c2d12 0%, #c2440f 50%, #f97316 100%)",
        padding: "2rem 1.75rem", minHeight: 170
      }}>
        {/* decorative blobs */}
        <div style={{
          position: "absolute", top: -40, right: -40,
          width: 200, height: 200, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)", pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", bottom: -30, left: -20,
          width: 140, height: 140, borderRadius: "50%",
          background: "rgba(0,0,0,0.12)", pointerEvents: "none"
        }} />

        {/* save button */}
        <button
          onClick={saveRecipe}
          style={{
            position: "absolute", top: 16, right: 16,
            width: 40, height: 40, borderRadius: 12,
            border: saveError ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(255,255,255,0.25)",
            background: saved ? "rgba(74,222,128,0.3)" : saveError ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            cursor: saved ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.3s"
          }}
          title={saved ? "Saved!" : "Save recipe"}
        >
          {saved ? <Check size={16} color="#4ade80" /> : saveError ? <span style={{fontSize:14}}>✗</span> : <Bookmark size={16} color="white" />}
        </button>

        {/* badge */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "rgba(0,0,0,0.2)", backdropFilter: "blur(8px)",
            borderRadius: 99, padding: "4px 12px",
            border: "1px solid rgba(255,255,255,0.15)"
          }}>
            <span style={{ fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              🍽 AI Generated
            </span>
          </div>
          {recipe.ingredients_used?.length > 0 && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "rgba(34,197,94,0.15)", backdropFilter: "blur(8px)",
              borderRadius: 99, padding: "4px 12px",
              border: "1px solid rgba(34,197,94,0.3)"
            }}>
              <span style={{ fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                color: "#86efac", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                🥦 Inspired by your {recipe.ingredients_used.length} ingredients
              </span>
            </div>
          )}
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 800,
          color: "#fff", margin: "0 0 8px", lineHeight: 1.25,
          textShadow: "0 2px 12px rgba(0,0,0,0.3)"
        }}>
          {recipe.title}
        </h2>

        <p style={{
          fontSize: 13, color: "rgba(255,255,255,0.72)",
          fontFamily: "'DM Sans', sans-serif", margin: 0, lineHeight: 1.6,
          maxWidth: 400
        }}>
          {recipe.description}
        </p>

        {/* meta row */}
        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          {recipe.prep_time && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Clock size={13} color="rgba(255,255,255,0.6)" />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}>
                {recipe.prep_time}
              </span>
            </div>
          )}
          {recipe.servings && (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Users size={13} color="rgba(255,255,255,0.6)" />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif" }}>
                {recipe.servings} servings
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── NUTRITION SUMMARY ─────────────────────────── */}
      <div style={{
        borderRadius: 22, border: `1px solid ${border}`,
        background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.9)",
        overflow: "hidden"
      }}>
        {/* section header */}
        <div style={{
          padding: "14px 20px 10px",
          borderBottom: `1px solid ${border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Zap size={14} color="#f97316" />
            <span style={{
              fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em", color: "#f97316"
            }}>
              Nutrition Summary · per serving
            </span>
          </div>
        </div>

        <div style={{ padding: "18px 20px", display: "flex", gap: 20, flexWrap: "wrap" }}>
          {/* Left: macro bars */}
          <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* calories highlight */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "linear-gradient(135deg, rgba(249,115,22,0.18), rgba(234,88,12,0.08))",
              border: "1px solid rgba(249,115,22,0.25)",
              borderRadius: 14, padding: "12px 16px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: "rgba(249,115,22,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Flame size={15} color="#f97316" />
                </div>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.5, fontFamily: "'DM Sans', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Total Calories
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#f97316", fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
                    {calories} <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.7 }}>kcal</span>
                  </div>
                </div>
              </div>
              <div style={{
                fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                color: "rgba(249,115,22,0.8)", fontWeight: 600,
                background: "rgba(249,115,22,0.12)", padding: "3px 10px", borderRadius: 99
              }}>
                ~{Math.round(calories / 20)}% DV
              </div>
            </div>

            {/* macro bars */}
            <MacroBar
              label="Protein" value={n.protein_g || 0} unit="g" max={60}
              color="#60a5fa" bg="rgba(96,165,250,0.15)" icon={Beef}
            />
            <MacroBar
              label="Carbohydrates" value={n.carbs_g || 0} unit="g" max={130}
              color="#fbbf24" bg="rgba(251,191,36,0.15)" icon={Wheat}
            />
            <MacroBar
              label="Total Fats" value={n.fat_g || 0} unit="g" max={65}
              color="#f87171" bg="rgba(248,113,113,0.15)" icon={Droplets}
            />
            <MacroBar
              label="Dietary Fibre" value={n.fiber_g || Math.round((n.carbs_g || 0) * 0.12)} unit="g" max={30}
              color="#34d399" bg="rgba(52,211,153,0.15)" icon={Leaf}
            />
          </div>

          {/* Right: mini stats */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, minWidth: 120 }}>

            <div style={{
              width: "100%", display: "flex", flexDirection: "column", gap: 8
            }}>
              {[
                { label: "Sugar", value: `${n.sugar_g || Math.round((n.carbs_g || 0) * 0.2)}g`, color: "#f472b6" },
                { label: "Sodium", value: `${n.sodium_mg || 320}mg`, color: "#a78bfa" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: surface, borderRadius: 10, padding: "6px 12px",
                  border: `1px solid ${border}`
                }}>
                  <span style={{ fontSize: 11, color: dimText, fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "'DM Sans', sans-serif" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* macro ratio bar */}
        <div style={{ padding: "0 20px 18px" }}>
          <div style={{ fontSize: 10, color: dimText, fontFamily: "'DM Sans', sans-serif", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Macro Ratio
          </div>
          <div style={{ height: 8, borderRadius: 99, overflow: "hidden", display: "flex", gap: 1 }}>
            {(() => {
              const p = (n.protein_g || 0) * 4
              const c = (n.carbs_g || 0) * 4
              const f = (n.fat_g || 0) * 9
              const total = p + c + f || 1
              return [
                { pct: (p / total) * 100, color: "#60a5fa", label: "P" },
                { pct: (c / total) * 100, color: "#fbbf24", label: "C" },
                { pct: (f / total) * 100, color: "#f87171", label: "F" },
              ].map(({ pct, color, label }) => (
                <div key={label} style={{ flex: pct, background: color, minWidth: 3 }} />
              ))
            })()}
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
            {[
              { label: "Protein", color: "#60a5fa" },
              { label: "Carbs", color: "#fbbf24" },
              { label: "Fat", color: "#f87171" },
            ].map(({ label, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                <span style={{ fontSize: 10, color: dimText, fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── INGREDIENTS USED ──────────────────────────── */}
      {recipe.ingredients_used?.length > 0 && (
        <div style={{
          borderRadius: 22, border: `1px solid ${border}`,
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.9)",
          padding: "16px 20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
            <span style={{ fontSize: 14 }}>🥦</span>
            <span style={{
              fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em", color: "#f97316"
            }}>
              Ingredients Used
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {recipe.ingredients_used.map((item) => (
              <span key={item} style={{
                fontSize: 12, fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                padding: "5px 12px", borderRadius: 99,
                background: isDark ? "rgba(249,115,22,0.12)" : "rgba(249,115,22,0.1)",
                border: "1px solid rgba(249,115,22,0.25)",
                color: "#f97316"
              }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP BY STEP ──────────────────────────────── */}
      {recipe.steps?.length > 0 && (
        <div style={{
          borderRadius: 22, border: `1px solid ${border}`,
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.9)",
          padding: "16px 20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
            <span style={{ fontSize: 14 }}>👨‍🍳</span>
            <span style={{
              fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em", color: "#f97316"
            }}>
              Step-by-Step Instructions
            </span>
            <span style={{
              marginLeft: "auto", fontSize: 10, fontFamily: "'DM Sans', sans-serif",
              background: "rgba(249,115,22,0.12)", color: "#f97316",
              padding: "2px 10px", borderRadius: 99, fontWeight: 600
            }}>
              {recipe.steps.length} steps
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {recipe.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{
                  flexShrink: 0, width: 30, height: 30, borderRadius: 10,
                  background: `linear-gradient(135deg, hsl(${20 + i * 8}, 90%, ${45 - i * 2}%), #ea580c)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: "0 3px 10px rgba(249,115,22,0.35)"
                }}>
                  {i + 1}
                </div>
                <p style={{
                  margin: 0, fontSize: 13, lineHeight: 1.7,
                  fontFamily: "'DM Sans', sans-serif",
                  color: isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.7)",
                  paddingTop: 5
                }}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HEALTH CONSIDERATIONS (WARNINGS) ──────────── */}
      {recipe.warnings?.length > 0 && (
        <div style={{
          borderRadius: 22, border: "1px solid rgba(239,68,68,0.2)",
          background: "rgba(239,68,68,0.05)",
          padding: "16px 20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
            <AlertTriangle size={14} color="#ef4444" />
            <span style={{
              fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em", color: "#ef4444"
            }}>
              Health Considerations
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recipe.warnings.map((w, i) => (
              <div key={i} style={{
                fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                color: isDark ? "#fca5a5" : "#b91c1c", lineHeight: 1.5
              }}>{w}</div>
            ))}
          </div>
        </div>
      )}

      {/* ── HEALTH BENEFITS (POSITIVES) ───────────────── */}
      {recipe.positives?.length > 0 && (
        <div style={{
          borderRadius: 22, border: "1px solid rgba(34,197,94,0.2)",
          background: "rgba(34,197,94,0.05)",
          padding: "16px 20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
            <CheckCircle size={14} color="#22c55e" />
            <span style={{
              fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em", color: "#22c55e"
            }}>
              Health Benefits
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recipe.positives.map((p, i) => (
              <div key={i} style={{
                fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                color: isDark ? "#86efac" : "#166534", lineHeight: 1.5
              }}>{p}</div>
            ))}
          </div>
        </div>
      )}

      {/* ── CHEF'S TIP ────────────────────────────────── */}
      {recipe.ai_tip && (
        <div style={{
          borderRadius: 22, border: "1px solid rgba(59,130,246,0.2)",
          background: "rgba(59,130,246,0.05)",
          padding: "16px 20px",
          display: "flex", gap: 12, alignItems: "flex-start"
        }}>
          <Info size={16} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{
            margin: 0, fontSize: 13, lineHeight: 1.65,
            fontFamily: "'DM Sans', sans-serif",
            color: isDark ? "#93c5fd" : "#1e40af"
          }}>
            <strong>Chef's Tip:</strong> {recipe.ai_tip}
          </p>
        </div>
      )}

      {/* ── SHARE VIA TWILIO ──────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
        <button
          onClick={async () => {
            const phone = prompt("Enter WhatsApp number (with country code, e.g. +1234567890):")
            if (!phone) return
            try {
              await axios.post("/api/notification/share", { recipe, phone })
              alert("Recipe sent via WhatsApp!")
            } catch (err) {
              alert("Failed to send recipe. Make sure Twilio is configured and backend is running.")
            }
          }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 24px", borderRadius: 99,
            background: "#25D366", color: "#fff", border: "none",
            fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer", boxShadow: "0 4px 14px rgba(37,211,102,0.3)"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.12.551 4.14 1.597 5.945L.193 23.364l5.52-1.448c1.748.966 3.693 1.474 5.718 1.474 6.645 0 12.03-5.385 12.03-12.03S18.676 0 12.031 0zm0 21.391c-1.782 0-3.52-.479-5.048-1.385l-.36-.214-3.75.983.998-3.655-.235-.373a10.021 10.021 0 01-1.53-5.355c0-5.543 4.51-10.053 10.053-10.053 5.542 0 10.052 4.51 10.052 10.053 0 5.543-4.51 10.053-10.052 10.053zm5.525-7.535c-.302-.151-1.791-.884-2.068-.985-.276-.1-.478-.151-.678.151-.201.302-.78 .985-.956 1.186-.176.201-.352.226-.654.075-1.571-.786-2.656-1.428-3.658-2.584-.258-.3-.027-.463.124-.614.135-.135.302-.352.453-.528.151-.176.201-.302.302-.503.1-.201.05-.377-.025-.528-.075-.151-.678-1.634-.93-2.237-.246-.59-.496-.51-.678-.52-.176-.01-.377-.01-.578-.01-.201 0-.528.075-.805.377-.276.302-1.056 1.03-1.056 2.513 0 1.483 1.081 2.915 1.232 3.116.151.201 2.125 3.242 5.148 4.544 1.83.789 2.474.836 3.254.71.865-.141 2.068-.844 2.368-1.66.302-.816.302-1.518.211-1.66-.091-.141-.341-.227-.643-.378z"/>
          </svg>
          Share via WhatsApp
        </button>
      </div>
    </div>
  )
}