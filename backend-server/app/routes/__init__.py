from .auth import auth_bk
from .user import user_bk
from .auth import register_bk
from .activity import activity_bk
from .profile import profile_bk
from .query import query_bk
from .form import form_bk
from .excel import excel_bk
from .create_todos import create_todos_bk
from .solve_todos import solve_todos_bk
from .development import development_bk

routes = [
    auth_bk,
    user_bk,
    register_bk,
    activity_bk,
    profile_bk,
    query_bk,
    form_bk,
    excel_bk,
    create_todos_bk,
    solve_todos_bk,
    development_bk
]