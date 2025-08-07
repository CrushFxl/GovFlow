from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def to_json(model_list):
    if isinstance(model_list, list):  # �������Ĳ�����һ��list���͵ģ�˵����ʹ�õ�all()�ķ�ʽ��ѯ��
        if isinstance(model_list[0], db.Model):  # ���ַ�ʽ�ǻ�õ���������  �൱�� select * from table
            lst = []
            for model in model_list:
                dic = {}
                for col in model.__table__.columns:
                    dic[col.name] = getattr(model, col.name)
                lst.append(dic)
            return lst
        else:  # ���ַ�ʽ��������ݿ��еĸ����ֶ�  �൱��select id,name from table
            lst = []
            for result in model_list:  # �������ַ�ʽ���ص�ʱ��result�л���һ��keys()������
                lst.append([dict(zip(result.keys, r)) for r in result])
            return lst
    else:
        if isinstance(model_list, db.Model):  # ���ַ�ʽ�ǻ�õ���������  �൱�� select * from table limit=1
            dic = {}
            for col in model_list.__table__.columns:
                dic[col.name] = getattr(model_list, col.name)
            return dic
        else:  # ���ַ�ʽ��������ݿ��еĸ����ֶ�  �൱��select id,name from table limit = 1
            return dict(zip(model_list.keys(), model_list))
