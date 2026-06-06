import { useRef, useState } from "react"
import { Camera, Mic, Plus, X } from "lucide-react"
import axios from "../axios"

export default function IngredientScanner({ ingredients, setIngredients, isDark }) {
  const fileRef = useRef()
  const [scanning, setScanning] = useState(false)
  const [tag, setTag] = useState("")

  const card = isDark
    ? "bg-stone-900 border-stone-800"
    : "bg-white border-stone-200 shadow-sm"
  const input = isDark
    ? "bg-stone-800 border-stone-700 text-stone-100 placeholder-stone-500"
    : "bg-stone-100 border-stone-300 text-stone-900 placeholder-stone-400"

  async function handlePhotoScan(e) {
    const file = e.target.files[0]
    if (!file) return
    setScanning(true)
    try {
      const form = new FormData()
      form.append("image", file)
      const res = await axios.post("/api/vision/scan", form)
      const detected = res.data.ingredients || []
      // Merge without duplicates
      const merged = [...new Set([...ingredients, ...detected])]
      setIngredients(merged)
    } catch {
      alert("Scan failed — make sure Ollama is running with LLaVA")
    } finally {
      setScanning(false)
    }
  }

  function addTag() {
    const trimmed = tag.trim().toLowerCase()
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed])
    }
    setTag("")
  }

  function removeTag(item) {
    setIngredients(ingredients.filter(i => i !== item))
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className={`rounded-2xl border ${card} p-5 flex flex-col gap-4`}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-orange-500 text-sm uppercase tracking-wide">
          Ingredients
        </h2>
        <span className="text-xs opacity-50">{ingredients.length} items</span>
      </div>

      {/* Tag chips */}
      <div className="flex flex-wrap gap-2 min-h-10">
        {ingredients.map(item => (
          <span
            key={item}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-500 bg-opacity-15 text-orange-400 border border-orange-500 border-opacity-30"
          >
            {item}
            <button onClick={() => removeTag(item)} className="hover:text-red-400 transition-colors">
              <X size={10} />
            </button>
          </span>
        ))}
        {ingredients.length === 0 && (
          <span className="text-xs opacity-40">No ingredients yet — scan or type below</span>
        )}
      </div>

      {/* Text input */}
      <div className="flex gap-2">
        <input
          className={`flex-1 rounded-lg px-3 py-2 text-sm border ${input} outline-none focus:border-orange-500 transition-colors`}
          placeholder="Type ingredient, press Enter..."
          value={tag}
          onChange={e => setTag(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={addTag}
          className="px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => fileRef.current.click()}
          disabled={scanning}
          className={`flex items-center gap-2 flex-1 justify-center px-3 py-2 rounded-lg text-sm border transition-colors ${
            isDark
              ? "border-stone-700 hover:border-orange-500 hover:text-orange-400"
              : "border-stone-300 hover:border-orange-400 hover:text-orange-500"
          }`}
        >
          <Camera size={15} />
          {scanning ? "Scanning..." : "Scan Photo"}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoScan}
        />

        <button
          onClick={() => setIngredients([])}
          className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
            isDark
              ? "border-stone-700 hover:border-red-500 hover:text-red-400"
              : "border-stone-300 hover:border-red-400 hover:text-red-500"
          }`}
        >
          Clear all
        </button>
      </div>
    </div>
  )
}