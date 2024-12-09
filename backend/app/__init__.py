import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from .extensions import db, migrate
from .config import Config

def create_app():
    app = Flask(
        __name__,
        instance_relative_config=True,
        static_folder="../../client/build/static",  # Explicitly set the static folder
        static_url_path="/static",  # URL prefix for serving static files
    )
    
    # Load configurations
    app.config.from_object(Config)
    app.config.from_pyfile("config.py", silent=True)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)

    # Enable CORS for API requests
    CORS(app)

    # Path to React build directory
    react_build_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../client/build")

    # Serve React's index.html for the root route
    @app.route("/")
    def index():
        return send_from_directory(react_build_path, "index.html")

    # Serve React's other static files
    @app.route("/<path:path>")
    def serve_static_files(path):
        if os.path.exists(os.path.join(react_build_path, path)):
            return send_from_directory(react_build_path, path)
        # Fallback to React's index.html for React Router
        return send_from_directory(react_build_path, "index.html")

    # Register blueprints
    from .routes import main
    app.register_blueprint(main)

    return app
