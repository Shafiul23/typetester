from flask import Blueprint, jsonify, request
from .models import User
from .extensions import db

main = Blueprint('main', __name__)

# Example API route to fetch all users
@main.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all()
    user_list = [{'id': user.id, 'name': user.name, 'email': user.email} for user in users]
    return jsonify(user_list)

# Example API route to create a new user
@main.route('/api/users', methods=['POST'])
def create_user():
    data = request.get_json()
    new_user = User(name=data['name'], email=data['email'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User created successfully'}), 201
