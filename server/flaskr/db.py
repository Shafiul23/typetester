from flask import current_app, g
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def get_db():
    if 'db' not in g:
        g.db = db.session
    return g.db

def close_db(e=None):
    db.session.remove()

def init_db():
    pass
