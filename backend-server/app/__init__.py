from .config import config
from .routes import routes
from .models import db
from .models.User import init_users
from .models.Profile import init_profiles
from .models.Branch import init_branches
from .models.System import init_system_settings
from .models.Form import init_forms

from flask import Flask
from flask_cors import CORS


def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False if config_name == 'production' else True
    CORS(app, supports_credentials=True)
    db.init_app(app)

    with app.app_context():
        db.create_all()
        init_branches()
        init_users()
        init_profiles()
        init_system_settings()
        init_forms()

    for route in routes:
        app.register_blueprint(route)

    return app
