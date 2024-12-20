import os

from flask import Flask
from flask_cors import CORS


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        SESSION_COOKIE_SECURE=False,
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    print("SESSION_COOKIE_SECURE is set to:", app.config['SESSION_COOKIE_SECURE'])

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # a simple page that says hello
    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    from . import db
    db.init_app(app)

    from . import auth
    app.register_blueprint(auth.bp)

    app.config['SECRET_KEY'] = 'your-secret-key'  # Secret key for signing the session cookie
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Or 'Strict' if more secure
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SECURE'] = False

    # Enable CORS
    CORS(app, supports_credentials=True)

    return app