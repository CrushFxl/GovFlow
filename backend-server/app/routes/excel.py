from flask import Blueprint, request, jsonify, session
from sqlalchemy import text
from app.models import db
from app.models.Branch import Branch
from app.models.Profile import Profile
from app.models.Todo import Todo
from app.models.Activity import Activity
from app.models.Notice import Notice


excel_bk = Blueprint('excel', __name__)


@excel_bk.route('/excel_prompt', methods=['GET'])
def get_sql_sentence():
    try:
        sql_sentence = request.args.get('sql_sentence')
        # 执行原生SQL语句，使用text()函数显式声明文本SQL表达式
        result = db.session.execute(text(sql_sentence))
        # 获取查询结果的列名
        columns = result.keys()
        # 构建结果字符串
        result_str = ''
        # 添加列名
        result_str += '\t'.join(columns) + '\n'
        # 添加数据行
        for row in result.fetchall():
            # 将每行数据转换为字符串并以制表符分隔
            row_str = '\t'.join(str(value) if value is not None else 'None' for value in row)
            result_str += row_str + '\n'
        # 提交事务
        db.session.commit()
        prompt = '以下是查询结果：\n\n' + result_str + '\n\n已将其导出为data.csv: http://test.excel/2nbgG.csv'
        return jsonify({'code': '1000', 'msg': 'ok', 'data': prompt})
        
    except Exception as e:
        # 发生异常时回滚事务
        db.session.rollback()
        print(e)
        return jsonify({'code': -1, 'msg': f'执行SQL语句失败: {str(e)}'})