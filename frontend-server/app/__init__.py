from flask import Flask
from flask_cors import CORS

from .config import config
from .routes import routes


def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    CORS(app, supports_credentials=True)
    for route in routes:    # 批量注册蓝图
        app.register_blueprint(route)
    return app
