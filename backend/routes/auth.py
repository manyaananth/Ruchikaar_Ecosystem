from flask import Blueprint, request, jsonify
from extensions import db
from models import User
from werkzeug.security import generate_password_hash, check_password_hash
import re

auth_bp = Blueprint("auth", __name__)

def is_valid_phone(phone):
    import re
    return re.match(r'^[6-9]\d{9}$', str(phone))

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json or {}
    name = data.get("name", "").strip()
    phone = str(data.get("phone", "")).strip()
    password = data.get("password", "")

    if not name or not phone or not password:
        return jsonify({"error": "Name, phone number and password are required"}), 400

    if not is_valid_phone(phone):
        return jsonify({"error": "Please enter a valid 10-digit Indian mobile number"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    existing = User.query.filter_by(phone=phone).first()
    if existing:
        return jsonify({"error": "Phone number already registered"}), 409

    hashed_pw = generate_password_hash(password)
    user = User(name=name, phone=phone, email=f"{phone}@ruchikaar.local", password_hash=hashed_pw)
    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "Registration successful",
        "user": {"id": user.id, "name": user.name, "phone": user.phone}
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    phone = str(data.get("phone", "")).strip()
    password = data.get("password", "")

    if not phone or not password:
        return jsonify({"error": "Phone number and password are required"}), 400

    user = User.query.filter_by(phone=phone).first()
    if not user:
        return jsonify({"error": "Invalid phone number or password"}), 401

    if not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid phone number or password"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "health_goal": user.health_goal,
            "location": user.location,
        }
    }), 200


@auth_bp.route("/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "health_goal": user.health_goal,
        "location": user.location,
        "phone": user.phone
    })


@auth_bp.route("/profile/<int:user_id>", methods=["PUT"])
def update_profile(user_id):
    user = User.query.get_or_404(user_id)
    data = request.json or {}

    if "name" in data and data["name"].strip():
        user.name = data["name"].strip()
    if "health_goal" in data:
        user.health_goal = data["health_goal"]
    if "location" in data:
        user.location = data["location"]
    if "phone" in data:
        user.phone = data["phone"]

    # Handle password change
    if "new_password" in data and data["new_password"]:
        current_password = data.get("current_password", "")
        if not current_password:
            return jsonify({"error": "Current password is required to set a new password"}), 400
        if not check_password_hash(user.password_hash, current_password):
            return jsonify({"error": "Current password is incorrect"}), 401
        if len(data["new_password"]) < 6:
            return jsonify({"error": "New password must be at least 6 characters"}), 400
        user.password_hash = generate_password_hash(data["new_password"])

    db.session.commit()
    return jsonify({
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "health_goal": user.health_goal,
            "location": user.location,
            "phone": user.phone
        }
    })
