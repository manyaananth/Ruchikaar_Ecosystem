import { useState } from "react"
import LandingPage from "./components/LandingPage"
import LoginPage from "./components/LoginPage"
import Onboarding from "./components/Onboarding"
import Home from "./components/Home"
import RecipeResult from "./components/RecipeResult"
import ProfilePage from "./components/ProfilePage"
import SavedRecipesPage from "./components/SavedRecipesPage"
import FridgeInventoryPage from "./components/FridgeInventoryPage"

export default function App() {
  const [isDark, setIsDark] = useState(true)
  // screens: landing | login | onboarding | home | result | profile | saved | inventory
  const [screen, setScreen] = useState("landing")
  const [prefs, setPrefs] = useState({ time: 30, servings: 2, vegOnly: false })
  const [recipe, setRecipe] = useState(null)
  const [user, setUser] = useState(null)

  const ctx = { isDark, setIsDark, screen, setScreen, prefs, setPrefs, recipe, setRecipe, user, setUser }

  if (screen === "landing") {
    return <LandingPage onLogin={() => setScreen("login")} />
  }

  if (screen === "login") {
    return (
      <LoginPage
        onSuccess={(userData) => {
          setUser(userData)
          setScreen("onboarding")
        }}
        onBack={() => setScreen("landing")}
      />
    )
  }

  return (
    <div className={isDark ? "dark" : ""} style={{ fontFamily: "'Playfair Display', 'DM Sans', serif" }}>
      <div style={{
        minHeight: "100vh",
        background: isDark ? "#0f0d0b" : "#faf6f0",
        color: isDark ? "#f0ebe3" : "#1a1208",
        transition: "background 0.4s, color 0.4s"
      }}>
        {screen === "onboarding" && <Onboarding ctx={ctx} />}
        {screen === "home" && <Home ctx={ctx} />}
        {screen === "result" && <RecipeResult ctx={ctx} />}
        {screen === "profile" && <ProfilePage ctx={ctx} />}
        {screen === "saved" && <SavedRecipesPage ctx={ctx} />}
        {screen === "inventory" && <FridgeInventoryPage ctx={ctx} />}
      </div>
    </div>
  )
}