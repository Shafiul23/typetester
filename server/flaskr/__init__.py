import os
from flask import Flask
from flask_cors import CORS
from flaskr.db import db
from dotenv import load_dotenv

load_dotenv()

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)

    app.config.from_mapping(
        SECRET_KEY=os.getenv('FLASK_SECRET_KEY', 'dev'),
        SQLALCHEMY_DATABASE_URI=os.getenv(
            'DATABASE_URL', 
            'postgresql://typetester:admin123@localhost/typetester_db'
        ),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    db.init_app(app)

    from . import auth
    app.register_blueprint(auth.bp)

    CORS(app, supports_credentials=True)

    return app
