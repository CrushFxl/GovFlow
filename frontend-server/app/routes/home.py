from flask import Blueprint, render_template, current_app

from .filters import login_required
from app.config import config

home_ft = Blueprint('home', __name__)


@home_ft.get('/home/')
@login_required
def home():
    # 获取当前环境配置
    env = current_app.config.get('ENV', 'production')
    current_config = config[env]
    # 传递iframe URL参数给模板
    return render_template("home.html", iframe_url_param=current_config.IFRAME_URL_PARAM)


@home_ft.get('/login/')
def login():
    return render_template("login.html")