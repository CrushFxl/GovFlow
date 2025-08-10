from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def to_json(model_list):
    if isinstance(model_list, list):  # 如果传入的参数是一个list类型的，说明是使用的all()的方式查询的
        if isinstance(model_list[0], db.Model):  # 这种方式是获得的整个对象  相当于 select * from table
            lst = []
            for model in model_list:
                dic = {}
                for col in model.__table__.columns:
                    dic[col.name] = getattr(model, col.name)
                lst.append(dic)
            return lst
        else:  # 这种方式获得了数据库中的个别字段  相当于select id,name from table
            lst = []
            for result in model_list:  # 当以这种方式返回的时候，result中会有一个keys()的属性
                lst.append([dict(zip(result.keys, r)) for r in result])
            return lst
    else:
        if isinstance(model_list, db.Model):  # 这种方式是获得的整个对象  相当于 select * from table limit=1
            dic = {}
            for col in model_list.__table__.columns:
                dic[col.name] = getattr(model_list, col.name)
            return dic
        else:  # 这种方式获得了数据库中的个别字段  相当于select id,name from table limit = 1
            return dict(zip(model_list.keys(), model_list))
