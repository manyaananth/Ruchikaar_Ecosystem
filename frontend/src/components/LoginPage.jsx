import { useState } from "react"

const INPUT_STYLE = (focused, dark) => ({
  width: "100%",
  padding: "0.9rem 1.1rem 0.9rem 2.8rem",
  borderRadius: 12,
  border: focused ? "1.5px solid #f97316" : "1.5px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.05)",
  color: "#f0ebe3",
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  transition: "border 0.2s, box-shadow 0.2s",
  boxShadow: focused ? "0 0 0 3px rgba(249,115,22,0.12)" : "none",
  boxSizing: "border-box",
})

function InputField({ icon, type, placeholder, value, onChange, id }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: "relative", marginBottom: "1.1rem" }}>
      <span style={{
        position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
        fontSize: 16, pointerEvents: "none", opacity: 0.5,
      }}>{icon}</span>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={INPUT_STYLE(focused)}
      />
    </div>
  )
}

export default function LoginPage({ onSuccess, onBack }) {
  const [mode, setMode] = useState("login") // login | register
  const [form, setForm] = useState({ name: "", phone: "", password: "", confirmPassword: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [hoverBtn, setHoverBtn] = useState(false)

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (mode === "register") {
      if (!form.name.trim()) return setError("Please enter your name")
      if (!/^[6-9]\d{9}$/.test(form.phone)) return setError("Please enter a valid 10-digit Indian mobile number")
      if (form.password !== form.confirmPassword) return setError("Passwords do not match")
      if (form.password.length < 6) return setError("Password must be at least 6 characters")
    }

    setLoading(true)
    try {
      const endpoint = mode === "login"
        ? "/api/auth/login"
        : "/api/auth/register"

      const body = mode === "login"
        ? { phone: form.phone, password: form.password }
        : { name: form.name, phone: form.phone, password: form.password }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        setSuccess(mode === "login" ? "Welcome back! Loading your kitchen..." : "Account created! Welcome to Ruchikaar!")
        setTimeout(() => onSuccess(data.user), 1200)
      }
    } catch {
      setError("Cannot connect to server. Make sure the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(m => m === "login" ? "register" : "login")
    setError("")
    setSuccess("")
    setForm({ name: "", phone: "", password: "", confirmPassword: "" })
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "'DM Sans', sans-serif",
      background: "linear-gradient(135deg, #0a0705 0%, #140d06 50%, #0d0805 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes float0 { from { transform: translateY(0); } to { transform: translateY(-20px); } }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes slideUpIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .err-shake { animation: shake 0.4s ease; }
        .tab-btn { transition: all 0.25s; }
        .tab-btn:hover { opacity: 0.85; }
      `}</style>

      {/* Ambient blobs */}
      <div style={{ position: "fixed", top: "-10%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-5%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(180,30,10,0.1) 0%, transparent 65%)", pointerEvents: "none" }} />

      {/* ── LEFT PANEL — Branding ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "4rem",
        background: "linear-gradient(160deg, rgba(249,115,22,0.08) 0%, transparent 60%)",
        borderRight: "1px solid rgba(249,115,22,0.08)",
        position: "relative",
      }}>
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            position: "absolute", top: 32, left: 32,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "0.5rem 1rem",
            color: "rgba(240,235,227,0.5)", fontSize: 13,
            cursor: "pointer", transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          ← Back
        </button>

        <div style={{ maxWidth: 460 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2.5rem" }}>
            <span style={{ fontSize: 40 }}>🔥</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, color: "#f97316" }}>Ruchikaar</span>
          </div>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 800, color: "#f0ebe3", lineHeight: 1.2, margin: "0 0 1rem" }}>
            Precision Cooking,<br />
            <span style={{ color: "#f97316", fontStyle: "italic" }}>Indian Soul</span>
          </h2>

          <p style={{ fontSize: 15, color: "rgba(240,235,227,0.45)", lineHeight: 1.8, marginBottom: "3rem", maxWidth: 380 }}>
            The world's first context-aware culinary assistant. Sign in to unlock AI-powered recipes tailored to your health, weather, and pantry.
          </p>

          {/* Feature bullets */}
          {[
            { icon: "🧠", text: "AI recipes from your actual ingredients" },
            { icon: "🌦️", text: "Weather-aware meal suggestions" },
            { icon: "💊", text: "Live nutrition & health scoring" },
            { icon: "📸", text: "Camera-based ingredient scanner" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1rem" }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 14, color: "rgba(240,235,227,0.6)" }}>{item.text}</span>
            </div>
          ))}

          <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(249,115,22,0.1)" }}>
            <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Team byte2bite</div>
            <div style={{ fontSize: 12, color: "rgba(240,235,227,0.3)" }}>Chinmayi Mohan · Manya E A · Yashaswini B G</div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div style={{
        width: "min(480px, 100%)",
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "3rem 2.5rem",
      }}>
        <div style={{
          width: "100%", maxWidth: 400,
          animation: "slideUpIn 0.6s ease forwards",
        }}>
          {/* Card */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(249,115,22,0.15)",
            borderRadius: 24, padding: "2.5rem 2rem",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}>
            {/* Mode tabs */}
            <div style={{
              display: "flex", gap: 4,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 12, padding: 4,
              marginBottom: "2rem",
            }}>
              {["login", "register"].map(m => (
                <button
                  key={m}
                  className="tab-btn"
                  onClick={() => { setMode(m); setError(""); setSuccess("") }}
                  style={{
                    flex: 1, padding: "0.6rem",
                    borderRadius: 10, border: "none",
                    background: mode === m ? "linear-gradient(135deg, #f97316, #dc2626)" : "transparent",
                    color: mode === m ? "#fff" : "rgba(240,235,227,0.4)",
                    fontSize: 13, fontWeight: 600,
                    cursor: "pointer", letterSpacing: "0.03em",
                    boxShadow: mode === m ? "0 4px 16px rgba(249,115,22,0.3)" : "none",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {m === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: "#f0ebe3", margin: "0 0 0.4rem" }}>
              {mode === "login" ? "Welcome back! 👋" : "Join Ruchikaar 🎉"}
            </h3>
            <p style={{ fontSize: 13, color: "rgba(240,235,227,0.4)", margin: "0 0 1.8rem" }}>
              {mode === "login" ? "Sign in to your culinary AI" : "Create your free account"}
            </p>

            <form onSubmit={handleSubmit}>
              {mode === "register" && (
                <InputField id="reg-name" icon="👤" type="text" placeholder="Full name" value={form.name} onChange={set("name")} />
              )}
              <InputField id="login-phone" icon="📱" type="tel" placeholder="Phone number (e.g. 9876543210)" value={form.phone} onChange={set("phone")} />
              <InputField id="login-password" icon="🔒" type="password" placeholder="Password" value={form.password} onChange={set("password")} />
              {mode === "register" && (
                <InputField id="reg-confirm" icon="🔑" type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={set("confirmPassword")} />
              )}

              {/* Error */}
              {error && (
                <div className="err-shake" style={{
                  background: "rgba(220,38,38,0.12)",
                  border: "1px solid rgba(220,38,38,0.3)",
                  borderRadius: 10, padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  fontSize: 13, color: "#f87171",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div style={{
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  borderRadius: 10, padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  fontSize: 13, color: "#4ade80",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  ✅ {success}
                </div>
              )}

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                onMouseEnter={() => setHoverBtn(true)}
                onMouseLeave={() => setHoverBtn(false)}
                style={{
                  width: "100%", padding: "0.95rem",
                  borderRadius: 14,
                  background: loading ? "rgba(249,115,22,0.4)" : hoverBtn ? "linear-gradient(135deg, #ff8c42, #e83820)" : "linear-gradient(135deg, #f97316, #dc2626)",
                  border: "none", color: "#fff",
                  fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  letterSpacing: "0.04em",
                  boxShadow: hoverBtn && !loading ? "0 8px 28px rgba(249,115,22,0.5)" : "0 4px 20px rgba(249,115,22,0.3)",
                  transform: hoverBtn && !loading ? "translateY(-2px)" : "none",
                  transition: "all 0.2s",
                  fontFamily: "'DM Sans', sans-serif",
                  marginTop: 4,
                }}
              >
                {loading
                  ? "⏳ Please wait..."
                  : mode === "login"
                    ? "🔥 Sign In to Ruchikaar"
                    : "🚀 Create Account"}
              </button>
            </form>

            {/* Guest access */}
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <button
                onClick={() => onSuccess({ id: 0, name: "Guest", email: "guest@ruchikaar.ai" })}
                style={{
                  background: "none", border: "none",
                  color: "rgba(240,235,227,0.35)", fontSize: 12,
                  cursor: "pointer", textDecoration: "underline",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "color 0.2s",
                }}
              >
                Continue as Guest (no account needed)
              </button>
            </div>
          </div>

          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: 11, color: "rgba(240,235,227,0.18)", letterSpacing: "0.06em" }}>
            Powered by local AI · 100% private · No data leaves your device
          </p>
        </div>
      </div>
    </div>
  )
}
