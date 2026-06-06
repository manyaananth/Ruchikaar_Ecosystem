import { useState, useEffect } from "react"
import { Search, Plus, Trash2, Edit2, AlertCircle, ShoppingCart, RefreshCw, Camera, Mic, ReceiptText } from "lucide-react"
import axios from "../axios"

export default function FridgeInventory({ ctx }) {
  const { isDark, user, setScreen } = ctx
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [showAddModal, setShowAddModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [newItem, setNewItem] = useState({ name: "", quantity: 1, unit: "pcs", category: "Vegetables", expiry_date: "" })

  const card = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)"
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"
  const text = isDark ? "#f0ebe3" : "#1a1208"

  const categories = ["Vegetables", "Dairy & Eggs", "Proteins", "Grains & Cereals", "Spices", "Fruits", "Others"]

  useEffect(() => {
    fetchInventory()
  }, [])

  async function fetchInventory() {
    setLoading(true)
    try {
      const res = await axios.get(`/api/inventory/${user?.id || 1}`)
      setItems(res.data)
    } catch (err) {
      console.error("Failed to fetch inventory", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddItem(e) {
    e.preventDefault()
    try {
      await axios.post(`/api/inventory/${user?.id || 1}`, newItem)
      setShowAddModal(false)
      setNewItem({ name: "", quantity: 1, unit: "pcs", category: "Vegetables", expiry_date: "" })
      fetchInventory()
    } catch (err) {
      console.error("Failed to add item", err)
    }
  }

  async function handleDelete(id) {
    try {
      await axios.delete(`/api/inventory/${id}`)
      fetchInventory()
    } catch (err) {
      console.error("Failed to delete item", err)
    }
  }

  function getExpiryStatus(expiryStr) {
    if (!expiryStr) return { color: "#3b82f6", text: "No expiry", bg: "rgba(59,130,246,0.1)" }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(expiryStr)
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return { color: "#ef4444", text: diffDays === 0 ? "Expires today" : "Expired", bg: "rgba(239,68,68,0.1)" }
    if (diffDays <= 5) return { color: "#f59e0b", text: `Expires in ${diffDays}d`, bg: "rgba(245,158,11,0.1)" }
    return { color: "#22c55e", text: `Good for ${diffDays}d`, bg: "rgba(34,197,94,0.1)" }
  }

  const filteredItems = items.filter(item => 
    (categoryFilter === "All" || item.category === categoryFilter) &&
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  const expiringSoon = items.filter(item => {
    if (!item.expiry_date) return false
    const diff = (new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 5
  })

  async function handleGenerateFromExpiring() {
    setGenerating(true)
    const expiringNames = expiringSoon.map(i => i.name)
    try {
      const res = await axios.post("/api/recipe/generate", {
        ingredients: expiringNames,
        weather_condition: "Clear", region: "Bangalore", // Default
        time_minutes: ctx.prefs.time, servings: ctx.prefs.servings,
        vegOnly: ctx.prefs.vegOnly
      })
      ctx.setRecipe(res.data)
      setScreen("result")
    } catch {
      // Build a dynamic fallback dish based on the user's actual ingredients
      const mainIngr = expiringNames.slice(0, 3).join(", ")
      const dishName = expiringNames.length >= 2
        ? `${expiringNames[0].charAt(0).toUpperCase() + expiringNames[0].slice(1)} & ${expiringNames[1].charAt(0).toUpperCase() + expiringNames[1].slice(1)} Stir-fry`
        : `${expiringNames[0].charAt(0).toUpperCase() + expiringNames[0].slice(1)} Sabzi`
      ctx.setRecipe({
        title: dishName,
        description: `A quick, flavourful dish made with your expiring ingredient${expiringNames.length > 1 ? "s" : ""} to reduce food waste.`,
        ingredients_used: expiringNames,
        steps: [
          `Heat 2 tbsp oil in a wide pan over medium-high heat until it shimmers.`,
          `Add ½ tsp cumin seeds and 1 dried red chilli; let them splutter for 20 seconds.`,
          `Add finely chopped onion and cook, stirring, for 5–6 minutes until golden brown.`,
          `Add ${mainIngr} and stir well to coat.`,
          `Season with ½ tsp turmeric, 1 tsp coriander powder, ½ tsp garam masala and salt to taste; stir and cook 3 minutes.`,
          `Add a splash of water (2–3 tbsp), cover and cook on low heat for 5 minutes until ingredients are tender.`,
          `Garnish with fresh coriander leaves and serve hot with roti or rice.`
        ],
        nutrition_per_serving: { protein_g: 8, carbs_g: 18, fat_g: 10, fiber_g: 4, calories: 190 },
        health_score: 75, prep_time: `${ctx.prefs.time} mins`, servings: ctx.prefs.servings,
        warnings: ["This is an estimated fallback — regenerate for AI-accurate nutrition."],
        positives: ["Zero Waste - Uses your expiring ingredients!", "Quick and minimal oil"]
      })
      setScreen("result")
    } finally { setGenerating(false) }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header & Smart Insights */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: 28, fontFamily: "'Playfair Display', serif", margin: "0 0 4px" }}>Fridge Inventory</h1>
          <p style={{ opacity: 0.6, fontSize: 14, margin: 0 }}>Smart tracking for zero waste & better meals.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{
            padding: "0.6rem 1.2rem", borderRadius: 99, background: "#10b981", color: "#fff",
            border: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
            cursor: "pointer", boxShadow: "0 4px 12px rgba(16,185,129,0.3)"
          }}
        >
          <Plus size={18} /> Add Ingredients
        </button>
      </div>

      {/* Smart Insights Panel */}
      <div style={{ 
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem"
      }}>
        <div style={{
          background: isDark ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: 16, padding: "1.2rem", display: "flex", alignItems: "center", gap: "1rem"
        }}>
          <div style={{ background: "rgba(245,158,11,0.2)", padding: 12, borderRadius: "50%" }}>
            <AlertCircle size={24} color="#f59e0b" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: isDark ? "#fcd34d" : "#b45309" }}>Expiring Soon</h3>
            <p style={{ fontSize: 13, margin: 0, opacity: 0.8, color: isDark ? "#fde68a" : "#92400e" }}>
              {expiringSoon.length > 0 ? `You have ${expiringSoon.length} item(s) expiring within 5 days.` : "All ingredients look fresh!"}
            </p>
            {expiringSoon.length > 0 && (
              <button 
                onClick={handleGenerateFromExpiring}
                disabled={generating}
                style={{
                  background: "transparent", border: "none", color: "#f59e0b", padding: "6px 0 0", 
                  fontSize: 12, fontWeight: 700, cursor: generating ? "not-allowed" : "pointer", textDecoration: "underline"
                }}
              >
                {generating ? "Generating..." : "Generate Recipe to Use Them"}
              </button>
            )}
          </div>
        </div>

        <div style={{
          background: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: 16, padding: "1.2rem", display: "flex", alignItems: "center", gap: "1rem"
        }}>
          <div style={{ background: "rgba(16,185,129,0.2)", padding: 12, borderRadius: "50%" }}>
            <ShoppingCart size={24} color="#10b981" />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: isDark ? "#6ee7b7" : "#065f46" }}>Pantry Health</h3>
            <p style={{ fontSize: 13, margin: 0, opacity: 0.8, color: isDark ? "#a7f3d0" : "#064e3b" }}>
              Your pantry health score is <strong>82/100</strong>. Great mix of fresh vegetables and proteins!
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, background: card, border: `1px solid ${border}`,
          padding: "0.5rem 1rem", borderRadius: 99, flex: 1, minWidth: 200
        }}>
          <Search size={16} opacity={0.5} />
          <input 
            type="text" placeholder="Search ingredients..." 
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: "transparent", border: "none", outline: "none", color: text, width: "100%", fontSize: 14 }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {["All", ...categories].map(cat => (
            <button
              key={cat} onClick={() => setCategoryFilter(cat)}
              style={{
                padding: "0.4rem 1rem", borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                background: categoryFilter === cat ? "#10b981" : card,
                color: categoryFilter === cat ? "#fff" : text,
                border: `1px solid ${categoryFilter === cat ? "#10b981" : border}`
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", opacity: 0.5 }}><RefreshCw size={24} className="spin" /></div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 1rem", background: card, borderRadius: 24, border: `1px dashed ${border}` }}>
          <p style={{ opacity: 0.6, fontSize: 15 }}>No ingredients found.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
          {filteredItems.map(item => {
            const status = getExpiryStatus(item.expiry_date)
            return (
              <div key={item.id} style={{
                background: card, border: `1px solid ${border}`, borderRadius: 16, padding: "1rem",
                display: "flex", flexDirection: "column", gap: "0.75rem", position: "relative"
              }}>
                <button 
                  onClick={() => handleDelete(item.id)}
                  style={{ position: "absolute", top: 12, right: 12, background: "transparent", border: "none", cursor: "pointer", opacity: 0.4 }}
                >
                  <Trash2 size={16} color="#ef4444" />
                </button>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {item.category}
                </div>
                <div>
                  <h4 style={{ fontSize: 18, margin: "0 0 4px", fontWeight: 700 }}>{item.name}</h4>
                  <p style={{ fontSize: 14, margin: 0, opacity: 0.6 }}>{item.quantity} {item.unit}</p>
                </div>
                <div style={{ 
                  marginTop: "auto", display: "inline-block", alignSelf: "flex-start",
                  background: status.bg, color: status.color, padding: "4px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700
                }}>
                  {status.text}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem"
        }}>
          <div style={{
            background: isDark ? "#1a1a1a" : "#fff", width: "100%", maxWidth: 400, borderRadius: 24,
            padding: "1.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", color: text
          }}>
            <h2 style={{ fontSize: 20, margin: "0 0 1rem", color: text }}>Add Ingredient</h2>
            
            {/* Mock AI Buttons */}
            <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
              <button style={{ flex: 1, padding: "8px", borderRadius: 12, background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                <Camera size={18} /> Photo
              </button>
              <button style={{ flex: 1, padding: "8px", borderRadius: 12, background: "rgba(168,85,247,0.1)", color: "#a855f7", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                <ReceiptText size={18} /> Receipt
              </button>
              <button style={{ flex: 1, padding: "8px", borderRadius: 12, background: "rgba(249,115,22,0.1)", color: "#f97316", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                <Mic size={18} /> Voice
              </button>
            </div>

            <form onSubmit={handleAddItem} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: 12, opacity: 0.6, display: "block", marginBottom: 4 }}>Ingredient Name</label>
                <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}
                  style={{ width: "100%", padding: "0.8rem", borderRadius: 12, background: card, border: `1px solid ${border}`, color: text, colorScheme: isDark ? "dark" : "light" }} />
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, opacity: 0.6, display: "block", marginBottom: 4 }}>Quantity</label>
                  <input required type="number" step="0.1" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                    style={{ width: "100%", padding: "0.8rem", borderRadius: 12, background: card, border: `1px solid ${border}`, color: text, colorScheme: isDark ? "dark" : "light" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, opacity: 0.6, display: "block", marginBottom: 4 }}>Unit</label>
                  <select value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})}
                    style={{ width: "100%", padding: "0.8rem", borderRadius: 12, background: card, border: `1px solid ${border}`, color: text, colorScheme: isDark ? "dark" : "light" }}>
                    <option>pcs</option><option>kg</option><option>g</option><option>L</option><option>ml</option><option>packet</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, opacity: 0.6, display: "block", marginBottom: 4 }}>Category</label>
                <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}
                  style={{ width: "100%", padding: "0.8rem", borderRadius: 12, background: card, border: `1px solid ${border}`, color: text, colorScheme: isDark ? "dark" : "light" }}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, opacity: 0.6, display: "block", marginBottom: 4 }}>Expiry Date</label>
                <input type="date" value={newItem.expiry_date} onChange={e => setNewItem({...newItem, expiry_date: e.target.value})}
                  style={{ width: "100%", padding: "0.8rem", borderRadius: 12, background: card, border: `1px solid ${border}`, color: text, colorScheme: isDark ? "dark" : "light" }} />
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: "0.8rem", borderRadius: 12, background: "transparent", border: `1px solid ${border}`, color: text, cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "0.8rem", borderRadius: 12, background: "#10b981", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
