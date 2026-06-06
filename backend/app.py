import os
from flask import Flask
from flask_cors import CORS
from extensions import db
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow all origins in production (tighten this later with specific domain)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)

    from routes.vision import vision_bp
    from routes.recipe import recipe_bp
    from routes.health import health_bp
    from routes.auth import auth_bp
    from routes.inventory import inventory_bp

    app.register_blueprint(vision_bp, url_prefix="/api/vision")
    app.register_blueprint(recipe_bp, url_prefix="/api/recipe")
    app.register_blueprint(health_bp, url_prefix="/api/health")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(inventory_bp, url_prefix="/api/inventory")

    with app.app_context():
        db.create_all()

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host="0.0.0.0", port=port)