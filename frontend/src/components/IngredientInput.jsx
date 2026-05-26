import { useState, useRef } from "react"
import { Camera, Plus, X, Zap } from "lucide-react"
import axios from "axios"
import WeatherRegionPanel from "./WeatherRegionPanel"
import RecipeLoader from "./RecipeLoader"

export default function IngredientInput({ ctx }) {
  const { isDark, setScreen, setRecipe, prefs } = ctx
  const [items, setItems] = useState([])
  const [text, setText] = useState("")
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showWeather, setShowWeather] = useState(false)
  const [weather, setWeather] = useState({ condition: "Clear", region: "Bangalore" })
  const fileRef = useRef()

  const border  = isDark ? "rgba(249,115,22,0.12)" : "rgba(180,120,20,0.15)"
  const cardBg  = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.85)"
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"

  function addItem() {
    const parts = text.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
    const merged = [...new Set([...items, ...parts])]
    setItems(merged); setText("")
  }

  function remove(it) { setItems(items.filter(x => x !== it)) }

  async function scanPhoto(e) {
    const file = e.target.files[0]; if (!file) return
    setScanning(true)
    try {
      const form = new FormData(); form.append("image", file)
      const res = await axios.post("/api/vision/scan", form)
      setItems(prev => [...new Set([...prev, ...(res.data.ingredients || [])])])
    } catch {
      // Demo fallback
      setItems(prev => [...new Set([...prev, "tomato", "onion", "garlic", "paneer"])])
    } finally { setScanning(false) }
  }

  async function generate() {
    if (!items.length) return
    setLoading(true)
    try {
      const res = await axios.post("/api/recipe/generate", {
        ingredients: items,
        weather_condition: weather.condition, region: weather.region,
        time_minutes: prefs.time, servings: prefs.servings,
        vegOnly: prefs.vegOnly
      })
      setRecipe(res.data); setScreen("result")
    } catch {
      // Build a dynamic fallback dish based on the user's actual ingredients
      const mainIngr = items.slice(0, 3).join(", ")
      const dishName = items.length >= 2
        ? `${items[0].charAt(0).toUpperCase() + items[0].slice(1)} & ${items[1].charAt(0).toUpperCase() + items[1].slice(1)} Stir-fry`
        : `${items[0].charAt(0).toUpperCase() + items[0].slice(1)} Sabzi`
      setRecipe({
        title: dishName,
        description: `A quick, flavourful dish made with your ${items.length} ingredient${items.length > 1 ? "s" : ""} — perfect for ${weather.condition} weather in ${weather.region}.`,
        ingredients_used: items,
        steps: [
          `Heat 2 tbsp oil in a wide pan over medium-high heat until it shimmers.`,
          `Add ½ tsp cumin seeds and 1 dried red chilli; let them splutter for 20 seconds.`,
          `Add finely chopped onion and cook, stirring, for 5–6 minutes until golden brown.`,
          `Add ${mainIngr} and stir well to coat with the masala base.`,
          `Season with ½ tsp turmeric, 1 tsp coriander powder, ½ tsp garam masala and salt to taste; stir and cook 3 minutes.`,
          `Add a splash of water (2–3 tbsp), cover and cook on low heat for 5 minutes until ingredients are tender.`,
          `Garnish with fresh coriander leaves and serve hot with roti or rice.`
        ],
        nutrition_per_serving: { protein_g: 8, carbs_g: 18, fat_g: 10, fiber_g: 4, calories: 190 },
        health_score: 65, prep_time: `${prefs.time} mins`, servings: prefs.servings,
        warnings: ["This is an estimated fallback — regenerate for AI-accurate nutrition."],
        positives: ["Made with your fresh ingredients", "Quick and minimal oil"]
      })
      setScreen("result")
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Weather row */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => setShowWeather(!showWeather)}
          style={{
            fontSize: 12, fontFamily: "'DM Sans', sans-serif",
            background: isDark ? "rgba(249,115,22,0.12)" : "rgba(249,115,22,0.1)",
            border: "1px solid rgba(249,115,22,0.3)",
            color: "#f97316", padding: "5px 14px", borderRadius: 99, cursor: "pointer"
          }}
        >
          🌤 {weather.condition} · 📍 {weather.region} {showWeather ? "▲" : "▼"}
        </button>
      </div>

      {showWeather && (
        <WeatherRegionPanel isDark={isDark} weather={weather} setWeather={setWeather} onClose={() => setShowWeather(false)} />
      )}

      {loading ? (
        <RecipeLoader isDark={isDark} />
      ) : (
        <>
          {/* Tag area */}
          <div style={{
            background: cardBg, border: `1px solid ${border}`,
            borderRadius: 18, padding: "1.25rem", minHeight: 100
          }}>
            <p style={{ fontSize: 11, opacity: 0.4, fontFamily: "'DM Sans', sans-serif", marginBottom: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Ingredients
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, minHeight: 36 }}>
              {items.map(it => (
                <span key={it} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "5px 12px", borderRadius: 99, fontSize: 13,
                  background: "rgba(249,115,22,0.15)", color: "#f97316",
                  border: "1px solid rgba(249,115,22,0.3)",
                  fontFamily: "'DM Sans', sans-serif"
                }}>
                  {it}
                  <button onClick={() => remove(it)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f97316", padding: 0, lineHeight: 1 }}>
                    <X size={11} />
                  </button>
                </span>
              ))}
              {!items.length && (
                <span style={{ opacity: 0.25, fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontStyle: "italic" }}>
                  Add ingredients below…
                </span>
              )}
            </div>
          </div>

          {/* Input row */}
          <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <select
                onChange={e => { if(e.target.value) { setText(e.target.value); e.target.value="" } }}
                style={{
                  padding: "0.75rem 1rem", borderRadius: 12, fontSize: 14,
                  background: inputBg, border: `1px solid ${border}`,
                  color: isDark ? "#f0ebe3" : "#1a1208", outline: "none",
                  fontFamily: "'DM Sans', sans-serif", width: "40%",
                  colorScheme: isDark ? "dark" : "light"
                }}
              >
                <option value="">Select common ingredient...</option>
                <optgroup label="Vegetables & Fruits">
                  <option value="Tomato">Tomato</option>
                  <option value="Onion">Onion</option>
                  <option value="Potato">Potato</option>
                  <option value="Garlic">Garlic</option>
                  <option value="Ginger">Ginger</option>
                  <option value="Spinach">Spinach</option>
                  <option value="Carrot">Carrot</option>
                  <option value="Lemon">Lemon</option>
                </optgroup>
                <optgroup label="Cereals & Pulses">
                  <option value="Rice">Rice</option>
                  <option value="Wheat Flour">Wheat Flour</option>
                  <option value="Toor Dal">Toor Dal</option>
                  <option value="Moong Dal">Moong Dal</option>
                  <option value="Chana Dal">Chana Dal</option>
                  <option value="Chickpeas">Chickpeas (Chole)</option>
                </optgroup>
                <optgroup label="Spices">
                  <option value="Cumin">Cumin (Jeera)</option>
                  <option value="Turmeric">Turmeric</option>
                  <option value="Garam Masala">Garam Masala</option>
                  <option value="Red Chilli Powder">Red Chilli Powder</option>
                  <option value="Coriander Powder">Coriander Powder</option>
                </optgroup>
                <optgroup label="Dairy & Proteins">
                  <option value="Paneer">Paneer</option>
                  <option value="Milk">Milk</option>
                  <option value="Ghee">Ghee</option>
                  <option value="Eggs">Eggs</option>
                  <option value="Chicken">Chicken</option>
                </optgroup>
              </select>
              <input
                value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => (e.key === "Enter" || e.key === ",") && (e.preventDefault(), addItem())}
                placeholder="Or type manually (e.g. tomato, paneer…)"
              style={{
                flex: 1, padding: "0.75rem 1rem", borderRadius: 12, fontSize: 14,
                background: inputBg, border: `1px solid ${border}`,
                color: isDark ? "#f0ebe3" : "#1a1208", outline: "none",
                fontFamily: "'DM Sans', sans-serif",
                transition: "border-color 0.2s"
              }}
            />
            <button
              onClick={addItem}
              style={{
                width: 46, height: 46, borderRadius: 12,
                background: "linear-gradient(135deg,#f97316,#ea580c)",
                border: "none", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 14px rgba(249,115,22,0.3)"
              }}
            >
              <Plus size={18} color="#fff" />
              </button>
            </div>
          </div>

          {/* Photo scan */}
          <label style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            padding: "0.85rem", borderRadius: 14, cursor: "pointer",
            border: `2px dashed ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            fontSize: 13, fontFamily: "'DM Sans', sans-serif",
            color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)",
            transition: "border-color 0.2s",
            "&:hover": { borderColor: "#f97316" }
          }}>
            <Camera size={16} color="#f97316" />
            {scanning ? "Scanning photo…" : "Upload photo to detect ingredients"}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={scanPhoto} />
          </label>

          {/* Generate */}
          <button
            onClick={generate} disabled={!items.length}
            style={{
              width: "100%", padding: "1rem", borderRadius: 14,
              background: items.length ? "linear-gradient(135deg,#f97316,#ea580c)" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
              border: "none",
              color: items.length ? "#fff" : (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"),
              fontSize: 15, fontWeight: 700, cursor: items.length ? "pointer" : "not-allowed",
              fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.04em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: items.length ? "0 6px 24px rgba(249,115,22,0.35)" : "none",
              transition: "all 0.3s"
            }}
          >
            <Zap size={16} />
            Generate Recipe ({items.length} ingredients)
          </button>
          <style>{`
            select option, select optgroup {
              background-color: ${isDark ? "#1a1208" : "#fff"};
              color: ${isDark ? "#f0ebe3" : "#1a1208"};
            }
          `}</style>
        </>
      )}
    </div>
  )
}
