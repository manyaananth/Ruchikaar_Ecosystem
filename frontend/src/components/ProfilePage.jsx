import { useState } from "react"
import { User, Lock, MapPin, Phone, ArrowLeft, Save, Check, Eye, EyeOff } from "lucide-react"
import axios from "../axios"

const HEALTH_GOALS = ["balanced diet","weight loss","muscle gain","low carb","high protein","diabetic friendly","heart healthy","vegetarian","vegan"]

function InputRow({ icon: Icon, label, type = "text", value, onChange, placeholder, rightEl }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: "1.2rem" }}>
      <label style={{ fontSize:11, fontFamily:"'DM Sans', sans-serif", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"rgba(249,115,22,0.8)", display:"block", marginBottom:6 }}>{label}</label>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", opacity:0.4 }}><Icon size={15}/></span>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width:"100%", padding:"0.8rem 1rem 0.8rem 2.6rem", borderRadius:12, border: focused ? "1.5px solid #f97316" : "1.5px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"#f0ebe3", fontSize:14, fontFamily:"'DM Sans', sans-serif", outline:"none", boxSizing:"border-box", transition:"border 0.2s", paddingRight: rightEl ? "3rem" : "1rem" }}
        />
        {rightEl && <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", cursor:"pointer", opacity:0.5 }}>{rightEl}</span>}
      </div>
    </div>
  )
}

export default function ProfilePage({ ctx }) {
  const { setScreen, user, setUser } = ctx
  const [tab, setTab] = useState("profile")
  const [form, setForm] = useState({ name: user?.name||"", phone: user?.phone||"", location: user?.location||"", health_goal: user?.health_goal||"balanced diet" })
  const [pwForm, setPwForm] = useState({ current:"", newPw:"", confirm:"" })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const set = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }))
  const setPw = (f) => (e) => setPwForm(prev => ({ ...prev, [f]: e.target.value }))

  async function handleSaveProfile() {
    if (!form.name.trim()) return setError("Name cannot be empty")
    setSaving(true); setError("")
    try {
      const res = await axios.put(`/api/auth/profile/${user.id}`, form)
      setUser({ ...user, ...res.data.user })
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (e) { setError(e.response?.data?.error || "Failed to save profile") }
    finally { setSaving(false) }
  }

  async function handleChangePassword() {
    setError("")
    if (!pwForm.current) return setError("Enter your current password")
    if (pwForm.newPw.length < 6) return setError("New password must be at least 6 characters")
    if (pwForm.newPw !== pwForm.confirm) return setError("Passwords do not match")
    setSaving(true)
    try {
      await axios.put(`/api/auth/profile/${user.id}`, { current_password: pwForm.current, new_password: pwForm.newPw })
      setSaved(true); setPwForm({ current:"", newPw:"", confirm:"" }); setTimeout(() => setSaved(false), 2500)
    } catch (e) { setError(e.response?.data?.error || "Failed to change password") }
    finally { setSaving(false) }
  }

  const initials = (user?.name || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg, #0a0705 0%, #140d06 50%, #0d0805 100%)", fontFamily:"'DM Sans', sans-serif", color:"#f0ebe3" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap'); @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }`}</style>
      <div style={{ position:"fixed", top:"-10%", right:"-5%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 65%)", pointerEvents:"none" }} />
      <div style={{ maxWidth:580, margin:"0 auto", padding:"2rem 1.25rem", position:"relative", animation:"slideUp 0.5s ease" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"2rem" }}>
          <button onClick={() => setScreen("home")} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"0.5rem 0.85rem", color:"rgba(240,235,227,0.5)", fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <ArrowLeft size={14}/> Back
          </button>
          <span style={{ fontFamily:"'Playfair Display', serif", fontSize:22, fontWeight:800, color:"#f97316" }}>My Profile</span>
        </div>

        {/* Avatar card */}
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(249,115,22,0.15)", borderRadius:24, padding:"1.75rem", marginBottom:"1.5rem", display:"flex", alignItems:"center", gap:20 }}>
          <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg, #f97316, #dc2626)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, fontWeight:800, color:"#fff", fontFamily:"'Playfair Display', serif", flexShrink:0, boxShadow:"0 8px 24px rgba(249,115,22,0.35)" }}>{initials}</div>
          <div>
            <div style={{ fontSize:20, fontFamily:"'Playfair Display', serif", fontWeight:800 }}>{user?.name || "User"}</div>
            <div style={{ fontSize:13, color:"rgba(240,235,227,0.45)", marginTop:2 }}>{user?.email}</div>
            <div style={{ marginTop:8, display:"inline-flex", padding:"3px 12px", borderRadius:99, fontSize:11, fontWeight:600, background:"rgba(249,115,22,0.12)", border:"1px solid rgba(249,115,22,0.25)", color:"#f97316", textTransform:"capitalize" }}>🎯 {user?.health_goal || "balanced diet"}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,0.05)", borderRadius:14, padding:4, marginBottom:"1.5rem" }}>
          {[{ id:"profile", label:"✏️ Edit Profile" },{ id:"password", label:"🔒 Change Password" }].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setError("") }} style={{ flex:1, padding:"0.6rem", borderRadius:10, border:"none", background: tab===t.id ? "linear-gradient(135deg, #f97316, #dc2626)" : "transparent", color: tab===t.id ? "#fff" : "rgba(240,235,227,0.4)", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans', sans-serif", transition:"all 0.2s" }}>{t.label}</button>
          ))}
        </div>

        {/* Form card */}
        <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(249,115,22,0.12)", borderRadius:24, padding:"2rem", boxShadow:"0 20px 60px rgba(0,0,0,0.4)" }}>
          {tab === "profile" && (<>
            <InputRow icon={User} label="Full Name" value={form.name} onChange={set("name")} placeholder="Your name"/>
            <InputRow icon={Phone} label="Phone Number" value={form.phone} onChange={set("phone")} placeholder="+91 9876543210" type="tel"/>
            <InputRow icon={MapPin} label="City / Location" value={form.location} onChange={set("location")} placeholder="e.g. Bengaluru"/>
            <div style={{ marginBottom:"1.5rem" }}>
              <label style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:"rgba(249,115,22,0.8)", display:"block", marginBottom:8 }}>🎯 Health Goal</label>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {HEALTH_GOALS.map(g => (
                  <button key={g} onClick={() => setForm(f => ({ ...f, health_goal: g }))} style={{ padding:"6px 14px", borderRadius:99, border:"1.5px solid", borderColor: form.health_goal===g ? "#f97316" : "rgba(255,255,255,0.1)", background: form.health_goal===g ? "rgba(249,115,22,0.18)" : "transparent", color: form.health_goal===g ? "#f97316" : "rgba(240,235,227,0.5)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans', sans-serif", transition:"all 0.2s", textTransform:"capitalize" }}>{g}</button>
                ))}
              </div>
            </div>
          </>)}

          {tab === "password" && (<>
            <InputRow icon={Lock} label="Current Password" type={showCurrent ? "text":"password"} value={pwForm.current} onChange={setPw("current")} placeholder="Your current password" rightEl={<span onClick={() => setShowCurrent(s=>!s)}>{showCurrent ? <EyeOff size={15}/> : <Eye size={15}/>}</span>}/>
            <InputRow icon={Lock} label="New Password" type={showNew ? "text":"password"} value={pwForm.newPw} onChange={setPw("newPw")} placeholder="At least 6 characters" rightEl={<span onClick={() => setShowNew(s=>!s)}>{showNew ? <EyeOff size={15}/> : <Eye size={15}/>}</span>}/>
            <InputRow icon={Lock} label="Confirm New Password" type="password" value={pwForm.confirm} onChange={setPw("confirm")} placeholder="Repeat new password"/>
          </>)}

          {error && <div style={{ background:"rgba(220,38,38,0.12)", border:"1px solid rgba(220,38,38,0.3)", borderRadius:10, padding:"0.7rem 1rem", marginBottom:"1rem", fontSize:13, color:"#f87171" }}>⚠️ {error}</div>}
          {saved && <div style={{ background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:10, padding:"0.7rem 1rem", marginBottom:"1rem", fontSize:13, color:"#4ade80" }}>✅ {tab==="profile" ? "Profile updated!" : "Password changed!"}</div>}

          <button onClick={tab==="profile" ? handleSaveProfile : handleChangePassword} disabled={saving} style={{ width:"100%", padding:"0.9rem", borderRadius:14, border:"none", background: saving ? "rgba(249,115,22,0.4)" : "linear-gradient(135deg, #f97316, #dc2626)", color:"#fff", fontSize:14, fontWeight:700, cursor: saving?"not-allowed":"pointer", fontFamily:"'DM Sans', sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:"0 4px 20px rgba(249,115,22,0.3)" }}>
            {saving ? "⏳ Saving..." : saved ? <><Check size={16}/>Saved!</> : <><Save size={16}/>{tab==="profile" ? "Save Profile" : "Update Password"}</>}
          </button>
        </div>

        {/* Bottom links */}
        <div style={{ marginTop:"1.5rem", display:"flex", gap:12, justifyContent:"center" }}>
          <button onClick={() => setScreen("saved")} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(249,115,22,0.2)", borderRadius:14, padding:"0.8rem 1.5rem", color:"#f97316", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans', sans-serif" }}>🔖 My Saved Recipes</button>
          <button onClick={() => { setUser(null); setScreen("landing") }} style={{ background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)", borderRadius:14, padding:"0.8rem 1.5rem", color:"#f87171", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans', sans-serif" }}>🚪 Sign Out</button>
        </div>
      </div>
    </div>
  )
}
