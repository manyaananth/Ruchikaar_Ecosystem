import { useState, useEffect } from "react"
import { ArrowLeft, Bookmark, Trash2, ChefHat, Clock, Loader } from "lucide-react"
import axios from "../axios"

export default function SavedRecipesPage({ ctx }) {
  const { setScreen, user, isDark } = ctx
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    axios.get(`/api/recipe/saved/${user.id}`)
      .then(res => setRecipes(res.data))
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false))
  }, [user])

  async function handleDelete(id) {
    setDeleting(id)
    try {
      await axios.delete(`/api/recipe/saved/${id}`)
      setRecipes(prev => prev.filter(r => r.id !== id))
      if (expanded === id) setExpanded(null)
    } catch { /* ignore */ }
    finally { setDeleting(null) }
  }

  const border = "rgba(249,115,22,0.12)"
  const card = "rgba(255,255,255,0.04)"

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg, #0a0705 0%, #140d06 50%, #0d0805 100%)", fontFamily:"'DM Sans', sans-serif", color:"#f0ebe3" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap'); @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ position:"fixed", top:"-10%", right:"-5%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 65%)", pointerEvents:"none" }} />

      <div style={{ maxWidth:640, margin:"0 auto", padding:"2rem 1.25rem", position:"relative" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"2rem" }}>
          <button onClick={() => setScreen("home")} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"0.5rem 0.85rem", color:"rgba(240,235,227,0.5)", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <ArrowLeft size={14}/> Back
          </button>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Bookmark size={18} color="#f97316"/>
              <span style={{ fontFamily:"'Playfair Display', serif", fontSize:22, fontWeight:800, color:"#f97316" }}>Saved Recipes</span>
            </div>
            <div style={{ fontSize:12, color:"rgba(240,235,227,0.35)", marginTop:2 }}>{recipes.length} recipe{recipes.length !== 1 ? "s" : ""} saved</div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"5rem 0", gap:16 }}>
            <Loader size={32} color="#f97316" style={{ animation:"spin 1s linear infinite" }}/>
            <p style={{ color:"rgba(240,235,227,0.4)", fontSize:14 }}>Loading your recipes…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* Empty */}
        {!loading && recipes.length === 0 && (
          <div style={{ background:card, border:`1px solid ${border}`, borderRadius:24, padding:"4rem 2rem", textAlign:"center" }}>
            <div style={{ fontSize:60, marginBottom:16 }}>📭</div>
            <div style={{ fontFamily:"'Playfair Display', serif", fontSize:22, fontWeight:700, marginBottom:8 }}>No saved recipes yet</div>
            <div style={{ fontSize:14, color:"rgba(240,235,227,0.4)", marginBottom:24 }}>Generate a recipe and tap the 🔖 bookmark icon to save it here.</div>
            <button onClick={() => setScreen("home")} style={{ background:"linear-gradient(135deg, #f97316, #dc2626)", border:"none", borderRadius:14, padding:"0.8rem 2rem", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans', sans-serif" }}>
              🍳 Generate a Recipe
            </button>
          </div>
        )}

        {/* Recipe list */}
        {!loading && recipes.map((recipe, idx) => (
          <div key={recipe.id} style={{ background:card, border:`1px solid ${border}`, borderRadius:22, marginBottom:"1rem", overflow:"hidden", animation:`fadeUp 0.4s ease ${idx * 0.05}s both` }}>

            {/* Card header */}
            <div style={{ padding:"1.25rem 1.5rem", display:"flex", alignItems:"flex-start", gap:14, cursor:"pointer" }}
              onClick={() => setExpanded(expanded === recipe.id ? null : recipe.id)}>
              <div style={{ width:46, height:46, borderRadius:14, background:"linear-gradient(135deg, #f97316, #dc2626)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <ChefHat size={20} color="#fff"/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"'Playfair Display', serif", fontSize:17, fontWeight:700, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{recipe.title}</div>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  {recipe.created_at && (
                    <span style={{ fontSize:11, color:"rgba(240,235,227,0.35)", display:"flex", alignItems:"center", gap:4 }}>
                      <Clock size={10}/> {recipe.created_at}
                    </span>
                  )}
                  {recipe.health_score > 0 && (
                    <span style={{ fontSize:11, fontWeight:700, padding:"1px 8px", borderRadius:99, background: recipe.health_score >= 70 ? "rgba(34,197,94,0.15)" : recipe.health_score >= 45 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)", color: recipe.health_score >= 70 ? "#4ade80" : recipe.health_score >= 45 ? "#fbbf24" : "#f87171" }}>
                      ♥ {recipe.health_score}/100
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(recipe.id) }} disabled={deleting === recipe.id}
                  style={{ width:34, height:34, borderRadius:10, border:"1px solid rgba(239,68,68,0.25)", background:"rgba(239,68,68,0.08)", color:"#f87171", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
                  {deleting === recipe.id ? <Loader size={13} style={{ animation:"spin 0.8s linear infinite" }}/> : <Trash2 size={13}/>}
                </button>
                <span style={{ fontSize:18, color:"rgba(240,235,227,0.3)", transition:"transform 0.2s", transform: expanded===recipe.id ? "rotate(180deg)" : "rotate(0deg)" }}>⌄</span>
              </div>
            </div>

            {/* Expanded details */}
            {expanded === recipe.id && (
              <div style={{ padding:"0 1.5rem 1.5rem", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                {recipe.description && (
                  <p style={{ fontSize:13, color:"rgba(240,235,227,0.5)", lineHeight:1.6, margin:"1rem 0" }}>{recipe.description}</p>
                )}
                {recipe.ingredients_used?.length > 0 && (
                  <div style={{ marginBottom:"1rem" }}>
                    <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"#f97316", marginBottom:8 }}>🥦 Ingredients</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {recipe.ingredients_used.map((ing, i) => (
                        <span key={i} style={{ fontSize:12, padding:"4px 10px", borderRadius:99, background:"rgba(249,115,22,0.1)", border:"1px solid rgba(249,115,22,0.2)", color:"#f97316" }}>{ing}</span>
                      ))}
                    </div>
                  </div>
                )}
                {recipe.steps?.length > 0 && (
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"#f97316", marginBottom:10 }}>👨‍🍳 Instructions</div>
                    {recipe.steps.map((step, i) => (
                      <div key={i} style={{ display:"flex", gap:12, marginBottom:10 }}>
                        <div style={{ flexShrink:0, width:24, height:24, borderRadius:8, background:"linear-gradient(135deg, #f97316, #ea580c)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#fff" }}>{i+1}</div>
                        <p style={{ margin:0, fontSize:13, lineHeight:1.65, color:"rgba(240,235,227,0.7)", paddingTop:3 }}>{step}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
