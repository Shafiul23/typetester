import os
from flask import Flask
from flask_cors import CORS
from flaskr.db import db, register_commands
from dotenv import load_dotenv

load_dotenv(dotenv_path='.flaskenv')


def _get_database_uri() -> str | None:
    """Return a SQLAlchemy-compatible database URI.

    Render and some external providers supply a `postgres://` URL which SQLAlchemy
    does not recognise.  Convert it to the `postgresql://` scheme when needed so
    the app can connect using modern Postgres drivers.
    """

    uri = os.getenv("DATABASE_URL")
    if uri and uri.startswith("postgres://"):
        uri = uri.replace("postgres://", "postgresql://", 1)
    return uri


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)

    app.config.from_mapping(
        SECRET_KEY=os.getenv('FLASK_SECRET_KEY', 'dev'),
        SQLALCHEMY_DATABASE_URI=_get_database_uri(),
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
    register_commands(app)

    from . import auth
    app.register_blueprint(auth.bp)

    CORS(app, supports_credentials=True)

    with app.app_context():
        # This will create all tables if they don't exist
        from .models import User, Score
        db.create_all()
        print("✅ Database tables ensured/created!")

    return app

