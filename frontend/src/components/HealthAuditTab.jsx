import { useState, useRef } from "react"
import { Camera, ShieldAlert, CheckCircle, AlertTriangle, XCircle, Info, ImageOff } from "lucide-react"
import axios from "axios"

/* ── Rating helpers ────────────────────────────────── */
// Convert 0-100 internal score to 0-10 display
function toTen(score100) {
  return Math.round((score100 / 100) * 10 * 10) / 10
}

function getSignal(score100) {
  if (score100 >= 70) return {
    label: "Healthy", emoji: "✅",
    color: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)",
    icon: CheckCircle, tier: "green"
  }
  if (score100 >= 45) return {
    label: "Moderate", emoji: "⚠️",
    color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)",
    icon: AlertTriangle, tier: "yellow"
  }
  return {
    label: "Avoid", emoji: "🚫",
    color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)",
    icon: XCircle, tier: "red"
  }
}

/* ── Score Dial (0-10) ─────────────────────────────── */
function ScoreDial({ score100 }) {
  const rating = toTen(score100)
  const sig = getSignal(score100)
  const r = 50
  const circ = 2 * Math.PI * r
  const dash = (score100 / 100) * circ * 0.75  // 3/4 circle arc
  const trackDash = circ * 0.75

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <svg width={140} height={140} style={{ transform: "rotate(135deg)" }}>
          {/* Track */}
          <circle
            cx={70} cy={70} r={r}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={10}
            strokeDasharray={`${trackDash} ${circ}`}
            strokeLinecap="round"
          />
          {/* Fill */}
          <circle
            cx={70} cy={70} r={r}
            fill="none"
            stroke={sig.color}
            strokeWidth={10}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${sig.color}88)`,
              transition: "stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)"
            }}
          />
        </svg>

        {/* Center text */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          paddingBottom: 12
        }}>
          <div style={{
            fontSize: 36, fontWeight: 900, color: sig.color,
            fontFamily: "'Playfair Display', serif", lineHeight: 1
          }}>
            {rating}
          </div>
          <div style={{
            fontSize: 11, opacity: 0.45,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.08em"
          }}>/ 10</div>
        </div>
      </div>

      {/* Signal badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "8px 20px", borderRadius: 99,
        background: sig.bg, border: `1.5px solid ${sig.border}`
      }}>
        <span style={{ fontSize: 16 }}>{sig.emoji}</span>
        <span style={{
          fontSize: 15, fontWeight: 700, color: sig.color,
          fontFamily: "'DM Sans', sans-serif"
        }}>
          {sig.label}
        </span>
      </div>
    </div>
  )
}

/* ── Nutrient Bar ──────────────────────────────────── */
function NutrientBar({ label, value, unit, max, color, warnHigh, isDark }) {
  const pct = Math.min((value / max) * 100, 100)
  const isHigh = warnHigh && pct > 75
  const barColor = isHigh ? "#ef4444" : color

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 6
      }}>
        <span style={{
          fontSize: 13, fontFamily: "'DM Sans', sans-serif",
          color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.6)"
        }}>
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isHigh && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#ef4444",
              background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
              padding: "2px 8px", borderRadius: 99, letterSpacing: "0.05em"
            }}>
              HIGH ⚠
            </span>
          )}
          <span style={{
            fontSize: 14, fontWeight: 700,
            color: isHigh ? "#ef4444" : color,
            fontFamily: "'DM Sans', sans-serif"
          }}>
            {value}{unit}
          </span>
        </div>
      </div>
      <div style={{
        height: 8, borderRadius: 99,
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"
      }}>
        <div style={{
          height: "100%", borderRadius: 99,
          width: `${pct}%`,
          background: isHigh
            ? "linear-gradient(90deg,#f97316,#ef4444)"
            : `linear-gradient(90deg,${color}aa,${color})`,
          transition: "width 0.9s cubic-bezier(0.34,1.56,0.64,1)",
          boxShadow: `0 0 8px ${barColor}44`
        }} />
      </div>
    </div>
  )
}

/* ── Main Component ────────────────────────────────── */
export default function HealthAuditTab({ ctx }) {
  const { isDark } = ctx
  const [result, setResult] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState(null)
  const [scanError, setScanError] = useState(null)
  const fileRef = useRef()

  const card = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)"
  const border = isDark ? "rgba(249,115,22,0.12)" : "rgba(180,120,20,0.15)"

  async function processFile(file) {
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setScanning(true); setResult(null); setScanError(null)
    try {
      const form = new FormData(); form.append("image", file)
      const res = await axios.post("/api/health/label-scan", form)
      setResult(res.data)
    } catch (err) {
      const msg = err.response?.data?.message
      const errType = err.response?.data?.error
      if (errType === "unclear_image") {
        setScanError(msg || "Could not identify food in this image.")
      } else {
        setScanError("Scan failed. Please make sure Ollama is running and try again.")
      }
    } finally { setScanning(false) }
  }

  function handleDrop(e) {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith("image/")) processFile(file)
  }

  const sig = result ? getSignal(result.health_score) : null

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <ShieldAlert size={18} color="#f97316" />
          <h2 style={{ fontSize: 18, fontFamily: "'Playfair Display', serif", fontWeight: 700, margin: 0 }}>
            Ingredient Health Analyser
          </h2>
        </div>
        <p style={{ fontSize: 13, opacity: 0.45, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.55, margin: 0 }}>
          Upload any food photo — raw ingredients, cooked dishes, or packaged labels. Our AI will identify what's in the image and give you a <strong>0–10 health rating</strong>.
        </p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current.click()}
        style={{
          border: `2px dashed ${dragOver ? "#f97316" : isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
          borderRadius: 20, padding: preview ? "1rem" : "2rem",
          textAlign: "center", cursor: "pointer",
          background: dragOver ? "rgba(249,115,22,0.06)" : "transparent",
          transition: "all 0.2s", position: "relative", overflow: "hidden"
        }}
      >
        {preview ? (
          <div style={{ position: "relative" }}>
            <img src={preview} alt="Uploaded label" style={{
              maxHeight: 160, borderRadius: 12, objectFit: "contain",
              opacity: scanning ? 0.4 : 1, transition: "opacity 0.3s"
            }} />
            {scanning && (
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: "3px solid rgba(249,115,22,0.2)",
                  borderTop: "3px solid #f97316",
                  animation: "spin 0.8s linear infinite"
                }} />
                <p style={{ fontSize: 13, color: "#f97316", fontFamily: "'DM Sans', sans-serif", margin: 0, fontWeight: 600 }}>
                  AI Analysing…
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            <Camera size={32} color={dragOver ? "#f97316" : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
              style={{ margin: "0 auto 12px", display: "block" }} />
            <p style={{ fontSize: 14, fontFamily: "'DM Sans', sans-serif", opacity: 0.5, margin: 0 }}>
              {scanning ? "🔍 AI is analysing the label…" : "Tap to upload or drag & drop"}
            </p>
            <p style={{ fontSize: 11, marginTop: 6, opacity: 0.3, fontFamily: "'DM Sans', sans-serif", margin: "6px 0 0" }}>
              JPG, PNG, HEIC supported
            </p>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
          onChange={e => processFile(e.target.files[0])} />
      </div>

      {/* Error / Unclear image */}
      {scanError && !scanning && (
        <div style={{
          background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.25)",
          borderRadius: 16, padding: "1.25rem"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <ImageOff size={20} color="#f97316"/>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#f97316", fontFamily: "'DM Sans', sans-serif" }}>Image Not Recognised</span>
          </div>
          <p style={{ fontSize: 13, color: "rgba(240,235,227,0.65)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, margin: "0 0 12px" }}>{scanError}</p>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "0.75rem 1rem" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(240,235,227,0.5)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>✅ Good photo examples:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["🍅 Tomatoes on a surface","🥕 A bunch of carrots","🌾 A bowl of rice","🧅 Onions & garlic","📦 Packaged food label"].map(ex => (
                <span key={ex} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 99, background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)", color: "#f97316", fontFamily: "'DM Sans', sans-serif" }}>{ex}</span>
              ))}
            </div>
          </div>
          <button onClick={() => { setScanError(null); setPreview(null); fileRef.current.click() }} style={{ marginTop:12, width:"100%", padding:"0.7rem", borderRadius:12, border:"1px solid rgba(249,115,22,0.3)", background:"transparent", color:"#f97316", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans', sans-serif" }}>📷 Try Another Photo</button>
        </div>
      )}

      {/* Results */}
      {result && !scanning && (
        <div style={{ animation: "fadeUp 0.4s ease" }}>

          {/* ── Score + Product header card ── */}
          <div style={{
            background: card, border: `1px solid ${border}`,
            borderRadius: 20, padding: "1.5rem", marginBottom: "1rem",
            position: "relative", overflow: "hidden"
          }}>
            {/* Coloured top accent stripe */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 4,
              background: `linear-gradient(90deg, ${sig.color}88, ${sig.color})`
            }} />

            {/* Product + dial row */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", gap: 16, marginBottom: 20, flexWrap: "wrap"
            }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <h3 style={{
                  fontSize: 20, fontFamily: "'Playfair Display', serif",
                  fontWeight: 700, marginBottom: 4, margin: "0 0 4px"
                }}>
                  {result.product_name}
                </h3>
                <p style={{
                  fontSize: 13, opacity: 0.45,
                  fontFamily: "'DM Sans', sans-serif", margin: "0 0 12px"
                }}>
                  Per serving: {result.serving_size} · {result.calories} kcal
                </p>

                {/* Colour signal legend */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { label: "Healthy (7–10)", color: "#22c55e", active: sig.tier === "green" },
                    { label: "Moderate (4–6)", color: "#f59e0b", active: sig.tier === "yellow" },
                    { label: "Avoid (0–3)", color: "#ef4444", active: sig.tier === "red" },
                  ].map(({ label, color, active }) => (
                    <div key={label} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      opacity: active ? 1 : 0.3
                    }}>
                      <div style={{
                        width: 12, height: 12, borderRadius: 3,
                        background: color,
                        boxShadow: active ? `0 0 8px ${color}` : "none"
                      }} />
                      <span style={{
                        fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                        fontWeight: active ? 700 : 400,
                        color: active ? color : undefined
                      }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <ScoreDial score100={result.health_score} />
            </div>

            {/* Nutrient bars */}
            <div style={{
              borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
              paddingTop: 16
            }}>
              <p style={{
                fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase", letterSpacing: "0.09em",
                color: "#f97316", fontWeight: 700, marginBottom: 14, margin: "0 0 14px"
              }}>
                Nutritional Breakdown
              </p>
              <NutrientBar label="Protein"  value={result.protein_g} unit="g"  max={30}  color="#3b82f6" warnHigh={false} isDark={isDark} />
              <NutrientBar label="Carbohydrates" value={result.carbs_g} unit="g" max={60} color="#f97316" warnHigh={false} isDark={isDark} />
              <NutrientBar label="Fat"      value={result.fat_g}     unit="g"  max={30}  color="#a855f7" warnHigh={true}  isDark={isDark} />
              <NutrientBar label="Sugar"    value={result.sugar_g}   unit="g"  max={30}  color="#ec4899" warnHigh={true}  isDark={isDark} />
              <NutrientBar label="Sodium"   value={result.sodium_mg} unit="mg" max={300} color="#f59e0b" warnHigh={true}  isDark={isDark} />
            </div>
          </div>

          {/* ── Ingredients Detected ── */}
          {result.ingredients_identified?.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <p style={{
                fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase", letterSpacing: "0.09em",
                color: "#a855f7", fontWeight: 700, margin: "0 0 8px"
              }}>
                🔍 Ingredients Detected
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.ingredients_identified.map((ing, i) => (
                  <span key={i} style={{
                    fontSize: 12, padding: "4px 12px", borderRadius: 99,
                    background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)",
                    color: isDark ? "#d8b4fe" : "#7c3aed",
                    fontFamily: "'DM Sans', sans-serif"
                  }}>
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Red Alerts ── */}
          {result.red_alerts?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1rem" }}>
              <p style={{
                fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase", letterSpacing: "0.1em",
                color: "#ff0000", fontWeight: 800, margin: "0 0 4px",
                display: "flex", alignItems: "center", gap: 6
              }}>
                <AlertTriangle size={16} color="#ff0000" />
                Red Alerts
              </p>
              {result.red_alerts.map((w, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "12px 16px", borderRadius: 12,
                  background: "rgba(255,0,0,0.12)", border: "1px solid rgba(255,0,0,0.4)",
                  fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                  color: isDark ? "#ffb3b3" : "#990000", lineHeight: 1.5, fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(255,0,0,0.15)"
                }}>
                  {w}
                </div>
              ))}
            </div>
          )}

          {/* ── Warnings ── */}
          {result.warnings?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1rem" }}>
              <p style={{
                fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase", letterSpacing: "0.09em",
                color: "#f59e0b", fontWeight: 700, margin: "0 0 4px"
              }}>
                ⚠ Moderate Concerns
              </p>
              {result.warnings.map((w, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "10px 14px", borderRadius: 12,
                  background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
                  fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                  color: isDark ? "#fcd34d" : "#b45309", lineHeight: 1.5
                }}>
                  {w}
                </div>
              ))}
            </div>
          )}

          {/* ── Positives ── */}
          {result.positives?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "1rem" }}>
              <p style={{
                fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase", letterSpacing: "0.09em",
                color: "#22c55e", fontWeight: 700, margin: "0 0 4px"
              }}>
                ✓ Positives
              </p>
              {result.positives.map((p, i) => (
                <div key={i} style={{
                  padding: "10px 14px", borderRadius: 12,
                  background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
                  fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                  color: isDark ? "#86efac" : "#166534", lineHeight: 1.5
                }}>
                  {p}
                </div>
              ))}
            </div>
          )}

          {/* ── AI Tip ── */}
          {result.ai_tip && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "12px 16px", borderRadius: 14,
              background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)",
              marginBottom: "0.5rem"
            }}>
              <Info size={16} color="#3b82f6" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{
                fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                color: isDark ? "#93c5fd" : "#1e40af",
                margin: 0, lineHeight: 1.55
              }}>
                <strong>AI Tip:</strong> {result.ai_tip}
              </p>
            </div>
          )}

          {/* ── Action Buttons ── */}
          <div style={{ display: "flex", gap: "12px", marginTop: "1rem" }}>
            <button
              onClick={() => { alert("Saved to Fridge Inventory!") }}
              style={{
                flex: 1, padding: "0.8rem",
                borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 4px 12px rgba(16,185,129,0.3)"
              }}
            >
              🧊 Save to Fridge
            </button>
            <button
              onClick={() => { setResult(null); setPreview(null) }}
              style={{
                flex: 1, padding: "0.8rem",
                borderRadius: 12, border: `1px solid ${isDark ? "rgba(249,115,22,0.25)" : "rgba(249,115,22,0.3)"}`,
                background: "transparent", color: "#f97316",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif"
              }}
            >
              📷 Scan Another
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
