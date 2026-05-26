from apscheduler.schedulers.background import BackgroundScheduler
from twilio.rest import Client
import os

scheduler = BackgroundScheduler()

def send_weekly_plan(phone, plan_text):
    client = Client(os.getenv("TWILIO_SID"), os.getenv("TWILIO_TOKEN"))
    client.messages.create(
        body=f"🍛 Your Ruchikaar Weekly Meal Plan:\n{plan_text}",
        from_=os.getenv("TWILIO_FROM"),
        to=f"whatsapp:{phone}"
    )

def start_scheduler():
    scheduler.add_job(lambda: print("Weekly plan job running"), "cron", day_of_week="mon", hour=8)
    scheduler.start()