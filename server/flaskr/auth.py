import functools
import jwt
import datetime

from flask import Blueprint, request, jsonify, g
from werkzeug.security import check_password_hash, generate_password_hash
from flaskr.db import get_db

SECRET_KEY = "your_secret_key"  # Replace with a secure, private key
ALGORITHM = "HS256"  # Algorithm used for JWT

bp = Blueprint('auth', __name__, url_prefix='/auth')

def generate_jwt(user_id, username):
    payload = {
        "user_id": user_id,
        "username": username,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Expiration time
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
        db = get_db()
        error = None

        if not username:
            error = 'Username is required.'
        elif not password:
            error = 'Password is required.'

        if error is None:
            try:
                db.execute(
                    "INSERT INTO user (username, password) VALUES (?, ?)",
                    (username, generate_password_hash(password, method='pbkdf2:sha256')),
                )
                db.commit()
                return {'message': 'Registered successfully'}, 201
            except db.IntegrityError:
                error = f"User {username} is already registered."

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

        db = get_db()
        user = db.execute(
            "SELECT * FROM user WHERE username = ?", (username,)
        ).fetchone()

        if user and check_password_hash(user['password'], password):
            token = generate_jwt(user['id'], user['username'])
            return {"message": "Login successful", "token": token}, 200
        else:
            return {"error": "Invalid username or password"}, 401

    except Exception as e:
        print(f"Error during login: {e}")
        return {"error": "An unexpected error occurred."}, 500


@bp.route('/status', methods=['GET'])
def status():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return {"logged_in": False}, 401

        token = auth_header.split(" ")[1]  # Extract the token from "Bearer <token>"
        decoded = decode_jwt(token)
        if isinstance(decoded, tuple):  # If an error occurred during decoding
            return decoded

        return {
            "logged_in": True,
            "user_id": decoded['user_id'],
            "username": decoded['username']
        }, 200
    except Exception as e:
        print(f"Error checking status: {e}")
        return {"error": "An unexpected error occurred."}, 500



@bp.route('/logout', methods=['POST'])
def logout():
    return {"message": "Logout successful"}, 200


@bp.before_app_request
def load_logged_in_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        g.user = None
        return
    
    token = auth_header.split(" ")[1]  # Extract the token from "Bearer <token>"
    decoded = decode_jwt(token)
    if isinstance(decoded, tuple):  # If an error occurred during decoding
        g.user = None
        return
    
    g.user = get_db().execute(
        'SELECT * FROM user WHERE id = ?', (decoded['user_id'],)
    ).fetchone()




def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login'))

        return view(**kwargs)

    return wrapped_view



