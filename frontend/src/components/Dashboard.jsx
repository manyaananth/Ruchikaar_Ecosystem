import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { Sun, Moon, Camera, ChefHat, Activity } from "lucide-react"
import axios from "axios"

function FoodSphere({ isHovered }) {
  const meshRef = useRef()
  const targetScale = useRef(1)
  const currentScale = useRef(1)
  const targetSpeed = useRef(0.003)
  const currentSpeed = useRef(0.003)

  useFrame(() => {
    if (!meshRef.current) return
    targetScale.current = isHovered ? 1.2 : 1
    targetSpeed.current = isHovered ? 0.018 : 0.003
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale.current, 0.08)
    currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed.current, 0.06)
    meshRef.current.rotation.y += currentSpeed.current
    meshRef.current.scale.setScalar(currentScale.current)
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.4, 1]} />
      <meshPhysicalMaterial
        color="#c2440f"
        metalness={0.3}
        roughness={0.6}
        clearcoat={0.4}
        clearcoatRoughness={0.2}
      />
    </mesh>
  )
}

export default function Dashboard() {
  const [isDark, setIsDark] = useState(true)
  const [ingredients, setIngredients] = useState("")
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const fileRef = useRef()

  const bg = isDark ? "bg-stone-950 text-stone-100" : "bg-stone-50 text-stone-900"
  const card = isDark ? "bg-stone-900 border-stone-800" : "bg-white border-stone-200 shadow-sm"

  async function handleScan() {
    const file = fileRef.current?.files[0]
    if (!file) return
    const form = new FormData()
    form.append("image", file)
    const res = await axios.post("/api/vision/scan", form)
    setIngredients(res.data.ingredients.join(", "))
  }

  async function handleGenerate() {
    setLoading(true)
    try {
      const res = await axios.post("/api/recipe/generate", {
        ingredients: ingredients.split(",").map(s => s.trim()),
        lat: 12.9716, lon: 77.5946,
        health_goal: "balanced"
      })
      setRecipe(res.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${bg} p-4 transition-colors duration-300`}>
      {/* Nav */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-500">Ruchikaar 🍛</h1>
        <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full border border-stone-700">
          {isDark ? <Sun size={18}/> : <Moon size={18}/>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 3D Canvas */}
        <div className={`rounded-2xl border ${card} p-4 h-72`}>
          <Canvas camera={{ position: [0, 0, 4] }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <Environment preset="city" />
            <FoodSphere isHovered={isHovered} />
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>

        {/* Input Panel */}
        <div className={`rounded-2xl border ${card} p-4 flex flex-col gap-3`}>
          <div className="flex items-center gap-2 text-orange-500 font-semibold">
            <ChefHat size={18}/> Ingredients
          </div>
          <input
            className={`w-full rounded-lg px-3 py-2 text-sm border ${isDark ? "bg-stone-800 border-stone-700" : "bg-stone-100 border-stone-300"}`}
            placeholder="tomato, onion, paneer..."
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={() => fileRef.current.click()}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm border ${isDark ? "border-stone-700" : "border-stone-300"}`}>
              <Camera size={14}/> Scan Photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleScan}/>
            <button
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg py-2 text-sm font-semibold transition-colors">
              {loading ? "Cooking..." : "⚡ Generate Recipe"}
            </button>
          </div>
        </div>

        {/* Recipe Output */}
        {recipe && (
          <div className={`md:col-span-2 rounded-2xl border ${card} p-4`}>
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-lg font-bold">{recipe.title}</h2>
              <div className="flex items-center gap-1 text-orange-500">
                <Activity size={16}/>
                <span className="font-bold">{recipe.health_score}/100</span>
              </div>
            </div>
            <p className="text-sm opacity-70 mb-3">{recipe.description}</p>
            <div className="flex gap-4 mb-3">
              {recipe.nutrition_per_serving && <>
                <div className="text-center"><div className="font-bold text-blue-400">{recipe.nutrition_per_serving.protein_g}g</div><div className="text-xs opacity-60">Protein</div></div>
                <div className="text-center"><div className="font-bold text-amber-400">{recipe.nutrition_per_serving.carbs_g}g</div><div className="text-xs opacity-60">Carbs</div></div>
                <div className="text-center"><div className="font-bold text-red-400">{recipe.nutrition_per_serving.fat_g}g</div><div className="text-xs opacity-60">Fats</div></div>
              </>}
            </div>
            <ol className="text-sm space-y-1 list-decimal list-inside opacity-80">
              {recipe.steps?.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}