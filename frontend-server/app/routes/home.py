from flask import Blueprint, render_template, request

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
    res1 = request.user_agent.string.find('Mobile')
    res2 = request.user_agent.string.find('Android')
    if res1 != -1 or res2 != -1:
        return render_template("mobile/home.html",
            iframe_url_param=iframe_url,
            iframe_url_llm_manage_param=current_config.IFRAME_URL_LLM_MANAGE_PARAM,
            iframe_url_knowledge_manage_param=current_config.IFRAME_URL_KNOWLEDGE_MANAGE_PARAM,
            q1="帮我整理一份灵创大学全体党员的电话",
            q2="通知全体党员明早八点在19-215开会",
            q3="党中央的八项规定是什么"
        )
    else:
        return render_template("home.html",
            iframe_url_param=iframe_url,
            iframe_url_llm_manage_param=current_config.IFRAME_URL_LLM_MANAGE_PARAM,
            iframe_url_knowledge_manage_param=current_config.IFRAME_URL_KNOWLEDGE_MANAGE_PARAM,
        )


@home_ft.get('/login/')
def login():
    return render_template("login.html")

@home_ft.get('/mobile_login/')
def mobile_login():
    return render_template("mobile/login.html")

@home_ft.get('/setting/')
def setting():
    return render_template("mobile/setting.html")

# shortcut link
@home_ft.get('/task_manage/')
def task_manage():
    return render_template("mobile/task_manage.html")
@home_ft.get('/party_day/')
def party_day():
    return render_template("mobile/party_day.html")
@home_ft.get('/san_and_one/')
def san_and_one():
    return render_template("mobile/san_and_one.html")
@home_ft.get('/party_fee/')
def party_fee():
    return render_template("mobile/party_fee.html")
@home_ft.get('/party_development/')
def party_development():
    return render_template("mobile/party_development.html")
@home_ft.get('/party_judge/')
def party_judge():
    return render_template("mobile/party_judge.html")