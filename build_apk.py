#!/usr/bin/env python3
"""
Ruchikaar APK Build Script
===========================
Run this ONCE after you have your Render backend URL.

Usage:
    python build_apk.py https://ruchikaar-backend.onrender.com

This script will:
  1. Update VITE_API_BASE_URL in the frontend .env.production
  2. Build the frontend (npm run build)
  3. Run capacitor sync (npx cap sync android)
  4. Print instructions for Android Studio
"""

import sys, os, subprocess

if len(sys.argv) < 2:
    print("Usage: python build_apk.py <RENDER_BACKEND_URL>")
    print("Example: python build_apk.py https://ruchikaar-backend.onrender.com")
    sys.exit(1)

backend_url = sys.argv[1].rstrip("/")
frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")
env_file = os.path.join(frontend_dir, ".env.production")

print(f"\n🔧 Setting VITE_API_BASE_URL = {backend_url}")
with open(env_file, "w") as f:
    f.write(f"VITE_API_BASE_URL={backend_url}\n")
print("   ✅ .env.production updated")

print("\n📦 Building frontend...")
result = subprocess.run(
    ["npm", "run", "build"],
    cwd=frontend_dir,
    shell=True
)
if result.returncode != 0:
    print("❌ Build failed! Fix errors above and try again.")
    sys.exit(1)
print("   ✅ Frontend built successfully → frontend/dist/")

print("\n📱 Syncing with Capacitor (Android)...")
result = subprocess.run(
    ["npx", "cap", "sync", "android"],
    cwd=frontend_dir,
    shell=True
)
if result.returncode != 0:
    print("❌ Capacitor sync failed! Make sure @capacitor/cli is installed.")
    sys.exit(1)
print("   ✅ Android project synced!")

print("\n" + "="*60)
print("🎉 DONE! Now build the APK in Android Studio:")
print("="*60)
print()
print("1. Open Android Studio")
print(f"2. Open folder: {os.path.join(frontend_dir, 'android')}")
print("3. Wait for Gradle sync to finish")
print("4. Menu → Build → Build Bundle(s)/APK(s) → Build APK(s)")
print("5. APK will be at:")
print(f"   {os.path.join(frontend_dir, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk')}")
print()
print("6. Transfer that .apk file to your phone and install it!")
print("   (Enable 'Install unknown apps' in Android settings if asked)")
print()
