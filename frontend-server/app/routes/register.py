from flask import Blueprint, render_template


register_ft = Blueprint('register', __name__)


@register_ft.get('/register/')
def register():
    return render_template("register.html")
