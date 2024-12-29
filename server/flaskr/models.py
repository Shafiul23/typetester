from flaskr.db import db 
from datetime import datetime

print("db from models", db)

class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    scores = db.relationship('Score', backref='user', lazy=True)

    def __repr__(self):
        return f"<User {self.username}>"

class Score(db.Model):
    __tablename__ = 'score'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    created = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Score {self.score} by User {self.user_id}>"
