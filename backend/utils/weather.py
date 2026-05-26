import requests, os

def get_weather(lat, lon):
    key = os.getenv("WEATHER_API_KEY")
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={key}&units=metric"
    try:
        r = requests.get(url, timeout=5).json()
        return {
            "temp": round(r["main"]["temp"]),
            "condition": r["weather"][0]["main"]
        }
    except:
        return {"temp": 25, "condition": "Clear"}