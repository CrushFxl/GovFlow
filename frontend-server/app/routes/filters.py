import functools
from flask import request, redirect


def login_required(func):
    @functools.wraps(func)
    def inner():
        session = request.cookies.get("session")
        if session:
            return func()
        else:
            return redirect('/login')
    return inner
