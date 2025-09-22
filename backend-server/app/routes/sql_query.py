from flask import Blueprint, request, jsonify, session
from sqlalchemy import text
from app.models import db
from app.models.Branch import Branch
from app.models.Profile import Profile
from app.models.Todo import Todo
from app.models.Notice import Notice
from app.models.Form import Form, FormControl, FormSubmission
from app.models.Task import Task
from app.models.User import User
from app.models.New import New

from app.models.Branch import branch_description
from app.models.Form import form_description, form_submission_description, from_contorl_description
from app.models.New import new_description
from app.models.Task import task_description
from app.models.User import user_description
from app.models.Notice import notice_description
from app.models.Todo import todo_description
from app.models.Profile import profile_description


sql_bk = Blueprint('sql', __name__)


@sql_bk.route('/sql', methods=['GET'])
def get_sql_sentence():
    sql_sentence = request.args.get('sql_sentence')
    # 执行原生SQL语句，使用text()函数显式声明文本SQL表达式
    result = db.session.execute(text(sql_sentence))
    # 获取查询结果的列名
    columns = result.keys()
    # 以Markdown格式返回查询结果
    result_str = '\n\n'
    # 添加列名
    result_str += '| ' + ' | '.join(columns) + ' |\n'
    # 添加分隔线
    result_str += '| ' + ' | '.join(['---'] * len(columns)) + ' |\n'
    # 添加数据行
    for row in result.fetchall():
        # 将每行数据转换为字符串并以管道符分隔
        row_str = '| ' + ' | '.join(str(value) if value is not None else 'None' for value in row) + ' |\n'
        result_str += row_str
    result_str += '\n'
    return jsonify({'code': '1000', 'msg': 'ok', 'prompt': result_str})


@sql_bk.route('/table_description', methods=['GET'])
def get_table_description():
    prompt_str = (branch_description() + form_description() + form_submission_description()
                  + from_contorl_description() + new_description() + task_description()
                 + notice_description() + todo_description() + profile_description())
    return {'code': 1000, 'msg': 'ok', 'prompt': prompt_str}
