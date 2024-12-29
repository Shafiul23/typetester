import functools
import jwt
import datetime
import re

from flask import Blueprint, request, jsonify, g
from werkzeug.security import check_password_hash, generate_password_hash
from flaskr.db import db
from sqlalchemy.exc import IntegrityError
from .models import User, Score

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"

bp = Blueprint('auth', __name__, url_prefix='/auth')

def generate_jwt(user_id, username):
    payload = {
        "user_id": user_id,
        "username": username,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def decode_jwt(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        return {"error": "Token has expired"}, 401
    except jwt.InvalidTokenError:
        return {"error": "Invalid token"}, 401

@bp.route('/register', methods=["POST"])
def register():
    try:
        data = request.get_json()
        if not data:
            return {"error": "Invalid input"}, 400
                
        username = data.get('username')
        password = data.get('password')
        error = None

        if not username:
            error = 'Username is required.'
        elif len(username) < 3:
            error = 'Username must be at least 3 characters long.'
        elif len(username) > 20:
            error = 'Username must not exceed 20 characters.'
        elif not username.isalnum():
            error = 'Username can only contain letters and numbers.'

        if not password:
            error = 'Password is required.'
        elif len(password) < 6:
            error = 'Password must be at least 6 characters long.'
        elif len(password) > 64:
            error = 'Password must not exceed 64 characters.'
        elif not re.search(r'[A-Z]', password):
            error = 'Password must contain at least one uppercase letter.'
        elif not re.search(r'[a-z]', password):
            error = 'Password must contain at least one lowercase letter.'
        elif not re.search(r'[0-9]', password):
            error = 'Password must contain at least one digit.'

        if error is None:
            existing_user = User.query.filter_by(username=username).first()
            if existing_user:
                return {"error": f"User {username} is already registered."}, 400

            new_user = User(
                username=username,
                password=generate_password_hash(password, method='pbkdf2:sha256')
            )
            db.session.add(new_user)
            db.session.commit()

            return {'message': 'Registered successfully'}, 201

        return {"error": error}, 400

    except Exception as e:
        print(f"Error: {e}")
        return {"error": "An unexpected error occurred."}, 500


@bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return {"error": "Invalid input"}, 400

        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return {"error": "Username and password are required."}, 400

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            token = generate_jwt(user.id, user.username)
            return {"message": "Login successful", "token": token}, 200
        else:
            return {"error": "Invalid username or password"}, 401

    except Exception as e:
        print(f"Error during login: {e}")
        return {"error": "An unexpected error occurred."}, 500


@bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        leaderboard = db.session.query(
            Score.id.label('score_id'),
            User.id.label('user_id'),
            User.username,
            Score.score,
            Score.created
        ).join(User).order_by(Score.score.desc()).limit(20).all()

        leaderboard_list = [
            {
                "score_id": row.score_id,
                "user_id": row.user_id,
                "username": row.username,
                "score": row.score,
                "created": row.created,
            }
            for row in leaderboard
        ]

        return {"leaderboard": leaderboard_list}, 200

    except Exception as e:
        print(f"Error retrieving leaderboard: {e}")
        return {"error": "An unexpected error occurred."}, 500



@bp.route('/personal', methods=['GET'])
def get_personal_scores():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return {"logged_in": False}, 401

        token = auth_header.split(" ")[1]
        decoded = decode_jwt(token)
        if isinstance(decoded, tuple):
            return decoded

        user_id = decoded.get('user_id')
        if not user_id:
            return {"error": "Invalid token payload."}, 401

        order_by = request.args.get('order_by', 'created')
        if order_by not in ['created', 'score']:
            return {"error": "Invalid order_by parameter."}, 400

        order_clause = Score.created if order_by == 'created' else Score.score

        personal_scores = db.session.query(
            Score.id.label('score_id'),
            User.id.label('user_id'),
            User.username,
            Score.score,
            Score.created
        ).join(User).filter(User.id == user_id).order_by(order_clause.desc()).limit(20).all()

        personal_list = [
            {
                "score_id": row.score_id,
                "user_id": row.user_id,
                "username": row.username,
                "score": row.score,
                "created": row.created,
            }
            for row in personal_scores
        ]

        return {"personal": personal_list}, 200

    except Exception as e:
        print(f"Error retrieving personal scores: {e}")
        return {"error": "An unexpected error occurred."}, 500



@bp.route('/scores', methods=['POST'])
def submit_score():
    try:
        data = request.get_json()
        if not data:
            return {"error": "Invalid input"}, 400

        score = data.get('score')
        if not score:
            return {"error": "Score is required."}, 400

        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return {"error": "Authorization token is required."}, 401

        token = auth_header.split(" ")[1]
        decoded = decode_jwt(token)
        if isinstance(decoded, tuple):
            return decoded

        user_id = decoded.get('user_id')
        if not user_id:
            return {"error": "User ID is missing from token."}, 401

        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found."}, 404

        from datetime import datetime, timedelta

        last_submission = Score.query.filter_by(user_id=user_id).order_by(Score.created.desc()).first()

        if last_submission:
            cooldown_period = timedelta(minutes=1)
            if datetime.now() - last_submission.created < cooldown_period:
                return {"error": "You can only submit a score once every minute."}, 429

        new_score = Score(user_id=user_id, score=score)
        db.session.add(new_score)
        db.session.commit()

        return {"message": "Score submitted successfully!"}, 201

    except Exception as e:
        print(f"Error submitting score: {e}")
        return {"error": "An unexpected error occurred."}, 500



@bp.route('/delete', methods=['DELETE'])
def delete_profile():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return {"error": "Authorization token is required."}, 401

        token = auth_header.split(" ")[1]
        decoded = decode_jwt(token)
        if isinstance(decoded, tuple):
            return decoded

        user_id = decoded.get('user_id')
        if not user_id:
            return {"error": "User ID is missing from token."}, 401

        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found."}, 404

        Score.query.filter_by(user_id=user_id).delete()
        db.session.delete(user)
        db.session.commit()

        return {"message": "User profile and associated data deleted successfully."}, 200

    except Exception as e:
        print(f"Error deleting profile: {e}")
        return {"error": "An unexpected error occurred."}, 500


