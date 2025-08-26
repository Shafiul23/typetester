from flask import g
from flask_sqlalchemy import SQLAlchemy
import click

db = SQLAlchemy()

def get_db():
    if 'db' not in g:
        g.db = db.session
    return g.db

def close_db(e=None):
    db.session.remove()

def init_db():
    """Create all database tables defined on the SQLAlchemy metadata."""
    db.create_all()


@click.command("init-db")
def init_db_command():
    """CLI command to initialize database tables."""
    init_db()
    click.echo("Tables created successfully!")


def register_commands(app):
    """Register database commands with the Flask app."""
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
