import { useEffect, useState } from "react"
import { Activity, TrendingUp, AlertCircle, Camera } from "lucide-react"
import axios from "axios"

export default function HealthScore({ isDark }) {
  const [summary, setSummary] = useState(null)
  const [history, setHistory] = useState([])
  const [labelResult, setLabelResult] = useState(null)
  const [scanning, setScanning] = useState(false)

  const card = isDark ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200 shadow-sm"
  const muted = isDark ? "bg-stone-800" : "bg-stone-100"

  useEffect(() => {
    axios.get("/api/health/summary/1").then(r => setSummary(r.data)).catch(() => {})
    axios.get("/api/health/history/1").then(r => setHistory(r.data)).catch(() => {})
  }, [])

  async function handleLabelScan(e) {
    const file = e.target.files[0]
    if (!file) return
    setScanning(true)
    try {
      const form = new FormData()
      form.append("image", file)
      const res = await axios.post("/api/health/label-scan", form)
      setLabelResult(res.data)
    } catch {
      alert("Label scan failed — make sure LLaVA is running")
    } finally {
      setScanning(false)
    }
  }

  const avgScore = summary?.avg_score || 0
  const scoreColor =
    avgScore >= 70 ? "text-green-400" : avgScore >= 45 ? "text-amber-400" : "text-red-400"

  return (
    <div className="flex flex-col gap-4 md:col-span-2">
      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Avg Health Score", value: avgScore + "/100", color: scoreColor },
          { label: "Recipes Logged", value: summary?.total_recipes || 0 },
          { label: "Avg Protein", value: (summary?.avg_protein || 0) + "g" },
          { label: "Avg Carbs", value: (summary?.avg_carbs || 0) + "g" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-2xl border ${card} p-4 text-center`}>
            <div className={`text-2xl font-bold ${color || "text-orange-400"}`}>{value}</div>
            <div className="text-xs opacity-50 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* History log */}
      <div className={`rounded-2xl border ${card} p-5`}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-orange-500" />
          <h2 className="font-semibold text-sm">Recent Health Logs</h2>
        </div>

        {history.length === 0 ? (
          <p className="text-sm opacity-40 text-center py-4">
            No logs yet — generate and save a recipe first
          </p>
        ) : (
          <div className="space-y-2">
            {history.map(log => (
              <div
                key={log.id}
                className={`flex items-center justify-between rounded-xl px-4 py-3 ${muted}`}
              >
                <div className="text-xs opacity-50">{log.logged_at}</div>
                <div className="flex gap-4 text-xs">
                  <span className="text-blue-400">{log.protein}g protein</span>
                  <span className="text-amber-400">{log.carbs}g carbs</span>
                  <span className="text-red-400">{log.fats}g fat</span>
                </div>
                <div
                  className={`font-bold text-sm ${
                    log.score >= 70
                      ? "text-green-400"
                      : log.score >= 45
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {log.score}/100
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nutritional label scanner */}
      <div className={`rounded-2xl border ${card} p-5`}>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-orange-500" />
          <h2 className="font-semibold text-sm">Packaged Food Label Scanner</h2>
        </div>

        <label className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
          isDark ? "border-stone-700 hover:border-orange-500" : "border-stone-300 hover:border-orange-400"
        }`}>
          <Camera size={16} className="text-orange-500" />
          <span className="text-sm opacity-70">
            {scanning ? "Scanning label..." : "Upload a packaged food label to audit it"}
          </span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleLabelScan}
          />
        </label>

        {labelResult && (
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{labelResult.product_name || "Scanned Product"}</h3>
              <span className="text-sm font-bold">
                {labelResult.verdict}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {[
                { label: "Protein", value: labelResult.protein_g + "g", color: "text-blue-400" },
                { label: "Carbs", value: labelResult.carbs_g + "g", color: "text-amber-400" },
                { label: "Fat", value: labelResult.fat_g + "g", color: "text-red-400" },
                { label: "Sugar", value: labelResult.sugar_g + "g", color: "text-pink-400" },
                { label: "Sodium", value: labelResult.sodium_mg + "mg", color: "text-purple-400" },
                { label: "Calories", value: labelResult.calories, color: "text-orange-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className={`rounded-lg py-2 ${muted}`}>
                  <div className={`font-bold ${color}`}>{value}</div>
                  <div className="opacity-50">{label}</div>
                </div>
              ))}
            </div>

            {labelResult.warnings?.length > 0 && (
              <div className="space-y-1">
                {labelResult.warnings.map(w => (
                  <div key={w} className="text-sm text-amber-400 bg-amber-500 bg-opacity-10 rounded-lg px-3 py-2">
                    {w}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}