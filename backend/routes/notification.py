from flask import Blueprint, request, jsonify
import os
from twilio.rest import Client

notification_bp = Blueprint("notification", __name__)

@notification_bp.route("/share", methods=["POST"])
def share_recipe():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    phone = data.get("phone")
    recipe = data.get("recipe")
    
    if not phone or not recipe:
        return jsonify({"error": "Phone number and recipe are required"}), 400

    twilio_sid = os.getenv("TWILIO_SID")
    twilio_token = os.getenv("TWILIO_TOKEN")
    twilio_from = os.getenv("TWILIO_WHATSAPP_FROM")
    
    if not twilio_sid or not twilio_token or not twilio_from:
        return jsonify({"error": "Twilio credentials are not configured"}), 500

    try:
        client = Client(twilio_sid, twilio_token)
        
        # Format the recipe into a nice WhatsApp message
        message_body = f"🔥 *{recipe.get('title', 'Your Recipe')}*\n\n"
        message_body += f"{recipe.get('description', '')}\n\n"
        
        message_body += "*Ingredients Used:*\n"
        for item in recipe.get('ingredients_used', []):
            message_body += f"• {item}\n"
            
        message_body += "\n*Instructions:*\n"
        for i, step in enumerate(recipe.get('steps', [])):
            message_body += f"{i+1}. {step}\n"
            
        if recipe.get('ai_tip'):
            message_body += f"\n💡 *Chef's Tip:* {recipe.get('ai_tip')}\n"

        message = client.messages.create(
            body=message_body,
            from_=twilio_from,
            to=f"whatsapp:{phone}" if not phone.startswith("whatsapp:") else phone
        )
        
        return jsonify({"success": True, "message_sid": message.sid})
    except Exception as e:
        print(f"Twilio error: {str(e)}")
        return jsonify({"error": str(e)}), 500
