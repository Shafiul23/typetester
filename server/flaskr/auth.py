import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)
from werkzeug.security import check_password_hash, generate_password_hash

from flaskr.db import get_db

bp = Blueprint('auth', __name__, url_prefix='/auth')

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
        db = get_db()


        if not username or not password:
            return {"error": "Username and password are required."}, 400


        user = db.execute(
            "SELECT * FROM user WHERE username = ?", (username,)
        ).fetchone()

        if user and check_password_hash(user['password'], password):
            session.clear()
            session['user_id'] = user['id']
            print("session id set to:", session['user_id'])
            return {"message": "Login successful"}, 200
        else:
            return {"error": "Invalid username or password"}, 401

    except Exception as e:
        print(f"Error during login: {e}")
        return {"error": "An unexpected error occurred."}, 500


@bp.route('/status', methods=['GET'])
def status():
    try:
        if g.user:
            print("User logged in:", g.user['username'])  # Debugging log
            return {"logged_in": True, "username": g.user['username']}, 200
        print("No user logged in.")  # Debugging log
        return {"logged_in": False}, 200
    except Exception as e:
        print(f"Error checking status: {e}")
        return {"error": "An unexpected error occurred."}, 500



@bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return {"message": "Logout successful"}, 200



@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')
    print(f"Session user_id: {user_id}")  # Debugging log
    if user_id is None:
        g.user = None
    else:
        g.user = get_db().execute(
            'SELECT * FROM user WHERE id = ?', (user_id,)
        ).fetchone()
        print(f"Loaded user: {g.user}")  # Debugging log



def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login'))

        return view(**kwargs)

    return wrapped_view



