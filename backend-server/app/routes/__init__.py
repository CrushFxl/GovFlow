from .auth import auth_bk
from .user import user_bk
from .auth import register_bk
from .activity import activity_bk
from .profile import profile_bk
from .query import query_bk
from .form import form_bk
from .sql_query import sql_bk
from .create_todos import create_todos_bk
from .solve_todos import solve_todos_bk
from .development import development_bk
from .fee import fee_bk
from .review import review_bk
from .meeting import meeting_bk
from .study import study_bk
from .statistics import statistics_bk
from .party_day import partyday_bk

routes = [
    auth_bk,
    user_bk,
    register_bk,
    activity_bk,
    profile_bk,
    query_bk,
    form_bk,
    sql_bk,
    create_todos_bk,
    solve_todos_bk,
    development_bk,
    fee_bk,
    review_bk,
    meeting_bk,
    study_bk,
    statistics_bk,
    partyday_bk
]