from flask import g
from flask.cli import with_appcontext
from flask_sqlalchemy import SQLAlchemy
import click
from sqlalchemy import inspect, text

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


@click.command("migrate-score-duration")
@with_appcontext
def migrate_score_duration_command():
    """Add duration without guessing the duration of historical scores."""
    columns = {column['name'] for column in inspect(db.engine).get_columns('score')}
    if 'duration_seconds' not in columns:
        db.session.execute(text(
            'ALTER TABLE score ADD COLUMN duration_seconds INTEGER '
            'CHECK (duration_seconds IN (15, 30, 60))'
        ))
        db.session.commit()
    click.echo("Score duration migration complete; historical durations remain unknown.")


def register_commands(app):
    """Register database commands with the Flask app."""
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
    app.cli.add_command(migrate_score_duration_command)
