from flask import Blueprint, render_template, current_app

from .filters import login_required
from app.config import config
import os

home_ft = Blueprint('home', __name__)


@home_ft.get('/home/')
@login_required
def home():
    # 获取当前环境配置
    env = os.getenv('ENV', 'production')
    current_config = config[env]
    # 传递iframe URL参数给模板
    if env == 'development':
        iframe_url = 'http://127.0.0.1/chatbot/' + current_config.IFRAME_URL_PARAM
    else:
        domain = current_config.BACKEND_SERVER_DOMAIN[:-6] + '/chatbot/'
        iframe_url = domain + current_config.IFRAME_URL_PARAM
    return render_template("home.html", iframe_url_param=iframe_url)


@home_ft.get('/login/')
def login():
    return render_template("login.html")