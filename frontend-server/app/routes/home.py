from flask import Blueprint, render_template

from .filters import login_required

home_ft = Blueprint('home', __name__)


@home_ft.get('/home/')
@login_required
def home():
    return render_template("home.html")


@home_ft.get('/login/')
def login():
    return render_template("login.html")
