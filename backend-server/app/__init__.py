from .config import config
from .routes import routes
from .models import db
from .models.User import init_users
from .models.Profile import init_profiles
from .models.Branch import init_branches

from flask import Flask
from flask_cors import CORS


def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    app.config['SESSION_TYPE'] = 'filesystem'
    # 设置cookie的SameSite属性为None，以支持跨站点使用
    app.config['SESSION_COOKIE_SAMESITE'] = 'None'
    app.config['SESSION_COOKIE_SECURE'] = True
    CORS(app, supports_credentials=True)
    db.init_app(app)

    with app.app_context():
        db.create_all()
        init_branches()
        init_users()
        init_profiles()


    for route in routes:
        app.register_blueprint(route)

    return app
