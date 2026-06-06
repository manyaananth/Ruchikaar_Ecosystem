import { useState, useEffect, useRef } from "react"
import indianFood from "../assets/indian_food_3d.png"

/* ─── Floating spice particle ─── */
function Particle({ style }) {
  return <div style={style} />
}

/* ─── Animated counter ─── */
function Counter({ target, suffix = "" }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.ceil(target / 60)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(timer) }
      else setVal(start)
    }, 22)
    return () => clearInterval(timer)
  }, [target])
  return <span>{val}{suffix}</span>
}

const FEATURES = [
  { icon: "🧠", title: "Context-Aware AI", desc: "Understands your health goals, local weather & pantry in real time" },
  { icon: "📸", title: "Vision Scanner", desc: "Snap your fridge — our AI identifies ingredients instantly" },
  { icon: "🌏", title: "Regional Mastery", desc: "Authentic North & South Indian recipes from a 30-year master chef AI" },
  { icon: "💊", title: "Nutrition Engine", desc: "Macro tracking, health scores & personalised dietary warnings" },
  { icon: "📄", title: "PDF Download", desc: "Download any recipe as a beautifully formatted PDF to save or print" },
  { icon: "🎡", title: "Cuisine Wheel", desc: "Spin the wheel and let AI surprise you with a regional delicacy" },
]

const STATS = [
  { value: 500, suffix: "+", label: "Authentic Recipes" },
  { value: 28, suffix: "", label: "Indian Cuisines" },
  { value: 100, suffix: "%", label: "AI Powered" },
  { value: 100, suffix: "%", label: "Private & Local" },
]

export default function LandingPage({ onLogin }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const [hoverBtn, setHoverBtn] = useState(false)
  const heroRef = useRef(null)

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("mousemove", handleMouse)
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("mousemove", handleMouse)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Parallax tilt for 3D food image
  const tiltX = ((mousePos.y / window.innerHeight) - 0.5) * 18
  const tiltY = ((mousePos.x / window.innerWidth) - 0.5) * -18

  // Particles
  const particles = Array.from({ length: 18 }, (_, i) => ({
    style: {
      position: "fixed",
      width: `${6 + (i % 4) * 4}px`,
      height: `${6 + (i % 4) * 4}px`,
      borderRadius: "50%",
      background: i % 3 === 0 ? "rgba(249,115,22,0.5)" : i % 3 === 1 ? "rgba(220,60,20,0.35)" : "rgba(255,200,80,0.4)",
      top: `${(i * 17 + 5) % 95}%`,
      left: `${(i * 23 + 3) % 96}%`,
      filter: "blur(1px)",
      animation: `float${i % 3} ${4 + (i % 3) * 2}s ease-in-out infinite alternate`,
      pointerEvents: "none",
      zIndex: 0,
    }
  }))

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0705 0%, #140d06 40%, #1a1008 70%, #0d0805 100%)",
      color: "#f0ebe3",
      fontFamily: "'DM Sans', sans-serif",
      overflowX: "hidden",
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes float0 { from { transform: translateY(0px) rotate(0deg); } to { transform: translateY(-22px) rotate(10deg); } }
        @keyframes float1 { from { transform: translateY(0px) rotate(0deg); } to { transform: translateY(-14px) rotate(-8deg); } }
        @keyframes float2 { from { transform: translateY(0px) rotate(0deg); } to { transform: translateY(-30px) rotate(15deg); } }
        @keyframes shimmer { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
        @keyframes spin3d { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(249,115,22,0.4), 0 0 60px rgba(249,115,22,0.15); }
          50% { box-shadow: 0 0 50px rgba(249,115,22,0.7), 0 0 100px rgba(249,115,22,0.3); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .feature-card:hover {
          transform: translateY(-8px) scale(1.02) !important;
          border-color: rgba(249,115,22,0.5) !important;
          background: rgba(249,115,22,0.08) !important;
        }
        .stat-box:hover {
          transform: scale(1.05) !important;
        }
      `}</style>

      {/* Particles */}
      {particles.map((p, i) => <Particle key={i} style={p.style} />)}

      {/* Ambient glow blobs */}
      <div style={{ position: "fixed", top: "10%", left: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "10%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(180,30,10,0.1) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "1rem 4rem",
        background: "rgba(10,7,5,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(249,115,22,0.12)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>🔥</span>
          <span style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", fontWeight: 800, color: "#f97316", letterSpacing: "-0.02em" }}>Ruchikaar</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "rgba(240,235,227,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Team byte2bite</span>
          <button
            onClick={onLogin}
            style={{
              padding: "0.55rem 1.4rem",
              borderRadius: 30,
              background: "linear-gradient(135deg, #f97316, #dc2626)",
              border: "none", color: "#fff",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              letterSpacing: "0.05em",
              boxShadow: "0 4px 20px rgba(249,115,22,0.4)",
              transition: "all 0.2s",
            }}
          >
            Login →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        padding: "6rem 4rem 3rem",
        position: "relative", zIndex: 1,
        gap: "4rem",
      }}>
        {/* Left copy */}
        <div style={{ flex: 1, maxWidth: 620, animation: "fadeInLeft 0.9s ease forwards" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(249,115,22,0.12)",
            border: "1px solid rgba(249,115,22,0.3)",
            borderRadius: 30, padding: "0.4rem 1rem",
            marginBottom: "1.5rem",
          }}>
            <span style={{ fontSize: 11 }}>✨</span>
            <span style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>World's First Context-Aware Culinary AI</span>
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(3rem, 5vw, 5rem)",
            fontWeight: 900, lineHeight: 1.08,
            margin: "0 0 0.6rem",
            background: "linear-gradient(135deg, #ffffff 0%, #f97316 40%, #ff6b35 70%, #fbbf24 100%)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "gradientShift 4s ease infinite",
          }}>
            Ruchikaar
          </h1>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.4rem, 2.5vw, 2.2rem)",
            fontWeight: 700, lineHeight: 1.2,
            margin: "0 0 1.2rem",
            color: "rgba(240,235,227,0.9)",
          }}>
            Precision Cooking,{" "}
            <span style={{ color: "#f97316", fontStyle: "italic" }}>Indian Soul</span>
          </h2>

          <p style={{ fontSize: "clamp(1rem, 1.5vw, 1.15rem)", color: "rgba(240,235,227,0.55)", lineHeight: 1.8, marginBottom: "2.5rem", maxWidth: 500 }}>
            The world's first AI that cooks like your grandmother but thinks like a nutritionist.
            Context-aware, weather-smart, pantry-intelligent — engineered for the Indian kitchen.
          </p>

          {/* Team info */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(249,115,22,0.15)",
            borderRadius: 16, padding: "1rem 1.4rem",
            marginBottom: "2.5rem", display: "inline-block"
          }}>
            <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Team — byte2bite</div>
            <div style={{ fontSize: 13, color: "rgba(240,235,227,0.6)" }}>Chinmayi Mohan · Manya E A · Yashaswini B G</div>
          </div>

          <div style={{ display: "flex", gap: 14 }}>
            <button
              id="hero-login-btn"
              onMouseEnter={() => setHoverBtn(true)}
              onMouseLeave={() => setHoverBtn(false)}
              onClick={onLogin}
              style={{
                padding: "1rem 2.5rem",
                borderRadius: 16,
                background: hoverBtn
                  ? "linear-gradient(135deg, #ff8c42, #e83820)"
                  : "linear-gradient(135deg, #f97316, #dc2626)",
                border: "none", color: "#fff",
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                letterSpacing: "0.04em",
                boxShadow: hoverBtn
                  ? "0 12px 40px rgba(249,115,22,0.6)"
                  : "0 6px 28px rgba(249,115,22,0.4)",
                transform: hoverBtn ? "translateY(-3px) scale(1.02)" : "none",
                transition: "all 0.25s",
                display: "flex", alignItems: "center", gap: 8,
                animation: "pulse-glow 3s ease-in-out infinite",
              }}
            >
              🚀 Get Started — Login
            </button>
            <a href="#features" style={{
              padding: "1rem 1.8rem",
              borderRadius: 16,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(240,235,227,0.7)",
              fontSize: 14, fontWeight: 500, cursor: "pointer",
              textDecoration: "none",
              transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              Explore ↓
            </a>
          </div>
        </div>

        {/* Right — 3D food image */}
        <div style={{
          flex: 1, display: "flex", justifyContent: "center", alignItems: "center",
          position: "relative", animation: "fadeInRight 1s ease 0.3s forwards", opacity: 0,
        }}>
          {/* Glow ring behind image */}
          <div style={{
            position: "absolute",
            width: 480, height: 480,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(249,115,22,0.25) 0%, rgba(220,38,38,0.1) 50%, transparent 70%)",
            filter: "blur(30px)",
            animation: "pulse-glow 3s ease-in-out infinite",
          }} />

          {/* Food image with 3D tilt effect */}
          <div style={{
            perspective: "800px",
            width: "100%",
            maxWidth: 520,
          }}>
            <img
              src={indianFood}
              alt="3D Indian Food Feast"
              style={{
                width: "100%",
                borderRadius: 32,
                boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(249,115,22,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
                transform: `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`,
                transition: "transform 0.15s ease",
                border: "1px solid rgba(249,115,22,0.2)",
              }}
            />
            {/* Floating badges */}
            <div style={{
              position: "absolute", top: "12%", left: "-8%",
              background: "rgba(10,7,5,0.92)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(249,115,22,0.3)",
              borderRadius: 14, padding: "0.7rem 1.1rem",
              boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
              animation: "float0 4s ease-in-out infinite alternate",
            }}>
              <div style={{ fontSize: 18 }}>🧠</div>
              <div style={{ fontSize: 11, color: "#f97316", fontWeight: 600 }}>AI-Powered</div>
            </div>
            <div style={{
              position: "absolute", bottom: "18%", right: "-6%",
              background: "rgba(10,7,5,0.92)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(249,115,22,0.3)",
              borderRadius: 14, padding: "0.7rem 1.1rem",
              boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
              animation: "float1 5s ease-in-out infinite alternate",
            }}>
              <div style={{ fontSize: 18 }}>🌶️</div>
              <div style={{ fontSize: 11, color: "#f97316", fontWeight: 600 }}>500+ Recipes</div>
            </div>
            <div style={{
              position: "absolute", top: "55%", left: "-10%",
              background: "rgba(10,7,5,0.92)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(249,115,22,0.3)",
              borderRadius: 14, padding: "0.7rem 1.1rem",
              boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
              animation: "float2 6s ease-in-out infinite alternate",
            }}>
              <div style={{ fontSize: 18 }}>💊</div>
              <div style={{ fontSize: 11, color: "#f97316", fontWeight: 600 }}>Health Scored</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{
        padding: "3rem 4rem",
        borderTop: "1px solid rgba(249,115,22,0.1)",
        borderBottom: "1px solid rgba(249,115,22,0.1)",
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem",
        position: "relative", zIndex: 1,
        background: "rgba(249,115,22,0.04)",
      }}>
        {STATS.map((s, i) => (
          <div key={i} className="stat-box" style={{
            textAlign: "center",
            transition: "transform 0.3s",
          }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, color: "#f97316" }}>
              <Counter target={s.value} suffix={s.suffix} />
            </div>
            <div style={{ fontSize: 13, color: "rgba(240,235,227,0.45)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "6rem 4rem", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div style={{ fontSize: 11, color: "#f97316", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14 }}>What we built</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, margin: 0 }}>
            Every Feature, Crafted with{" "}
            <span style={{ color: "#f97316" }}>Indian Precision</span>
          </h2>
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem"
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card" style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(249,115,22,0.12)",
              borderRadius: 20, padding: "2rem",
              cursor: "default",
              transition: "all 0.3s ease",
            }}>
              <div style={{ fontSize: 36, marginBottom: "1rem" }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, margin: "0 0 0.6rem", color: "#f0ebe3" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(240,235,227,0.5)", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUOTE SECTION ── */}
      <section style={{
        padding: "5rem 4rem",
        background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(220,38,38,0.05) 100%)",
        borderTop: "1px solid rgba(249,115,22,0.1)",
        borderBottom: "1px solid rgba(249,115,22,0.1)",
        textAlign: "center", position: "relative", zIndex: 1,
      }}>
        <div style={{ fontSize: 48, marginBottom: "1.5rem" }}>🍛</div>
        <blockquote style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(1.3rem, 2.5vw, 2rem)",
          fontWeight: 700, fontStyle: "italic",
          color: "rgba(240,235,227,0.9)",
          maxWidth: 700, margin: "0 auto 2rem",
          lineHeight: 1.5,
        }}>
          "Food is not just fuel. It is history, culture, love and memory —<br />
          all on a single plate."
        </blockquote>
        <p style={{ fontSize: 13, color: "rgba(240,235,227,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>— The Ruchikaar Philosophy</p>
      </section>

      {/* ── CTA FOOTER ── */}
      <section style={{
        padding: "5rem 4rem", textAlign: "center",
        position: "relative", zIndex: 1,
      }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 900, margin: "0 0 1rem" }}>
          Ready to cook{" "}
          <span style={{ color: "#f97316" }}>smarter?</span>
        </h2>
        <p style={{ fontSize: 15, color: "rgba(240,235,227,0.45)", marginBottom: "2.5rem" }}>
          Join Ruchikaar and transform the way India cooks — one AI-powered recipe at a time.
        </p>
        <button
          onClick={onLogin}
          style={{
            padding: "1.1rem 3rem",
            borderRadius: 18,
            background: "linear-gradient(135deg, #f97316, #dc2626)",
            border: "none", color: "#fff",
            fontSize: 16, fontWeight: 700, cursor: "pointer",
            letterSpacing: "0.04em",
            boxShadow: "0 8px 40px rgba(249,115,22,0.5)",
            transition: "all 0.25s",
          }}
        >
          🔥 Enter Ruchikaar →
        </button>
        <p style={{ marginTop: "3rem", fontSize: 11, color: "rgba(240,235,227,0.18)", letterSpacing: "0.08em" }}>
          RUCHIKAAR · PRECISION COOKING, INDIAN SOUL · TEAM BYTE2BITE
        </p>
      </section>
    </div>
  )
}
