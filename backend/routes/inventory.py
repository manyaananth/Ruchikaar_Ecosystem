from flask import Blueprint, request, jsonify
from extensions import db
from models import PantryItem
from datetime import datetime

inventory_bp = Blueprint("inventory", __name__)

@inventory_bp.route("/<int:user_id>", methods=["GET"])
def get_inventory(user_id):
    items = PantryItem.query.filter_by(user_id=user_id).order_by(PantryItem.expiry_date.asc()).all()
    result = []
    for item in items:
        result.append({
            "id": item.id,
            "name": item.name,
            "quantity": item.quantity,
            "unit": item.unit,
            "category": item.category,
            "purchase_date": item.purchase_date.strftime("%Y-%m-%d") if item.purchase_date else None,
            "expiry_date": item.expiry_date.strftime("%Y-%m-%d") if item.expiry_date else None,
            "notes": item.notes,
            "updated_at": item.updated_at.strftime("%Y-%m-%d %H:%M") if item.updated_at else None
        })
    return jsonify(result)

@inventory_bp.route("/<int:user_id>", methods=["POST"])
def add_item(user_id):
    data = request.json
    
    # Handle both single item and bulk add
    items_to_add = data if isinstance(data, list) else [data]
    added_items = []
    
    for item_data in items_to_add:
        purchase_date = datetime.strptime(item_data.get("purchase_date"), "%Y-%m-%d") if item_data.get("purchase_date") else datetime.utcnow()
        expiry_date = datetime.strptime(item_data.get("expiry_date"), "%Y-%m-%d") if item_data.get("expiry_date") else None
        
        new_item = PantryItem(
            user_id=user_id,
            name=item_data.get("name"),
            quantity=float(item_data.get("quantity", 1.0)),
            unit=item_data.get("unit", "pcs"),
            category=item_data.get("category", "Others"),
            purchase_date=purchase_date,
            expiry_date=expiry_date,
            notes=item_data.get("notes", "")
        )
        db.session.add(new_item)
        added_items.append(new_item)
        
    db.session.commit()
    
    return jsonify({"message": f"{len(added_items)} item(s) added successfully."}), 201

@inventory_bp.route("/<int:item_id>", methods=["PUT"])
def update_item(item_id):
    item = PantryItem.query.get_or_404(item_id)
    data = request.json
    
    if "name" in data:
        item.name = data["name"]
    if "quantity" in data:
        item.quantity = float(data["quantity"])
    if "unit" in data:
        item.unit = data["unit"]
    if "category" in data:
        item.category = data["category"]
    if "expiry_date" in data and data["expiry_date"]:
        item.expiry_date = datetime.strptime(data["expiry_date"], "%Y-%m-%d")
    if "notes" in data:
        item.notes = data["notes"]
        
    db.session.commit()
    return jsonify({"message": "Item updated successfully."})

@inventory_bp.route("/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    item = PantryItem.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted successfully."})
