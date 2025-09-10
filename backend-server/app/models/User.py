from . import db


class User(db.Model):
    __tablename__ = 'users'
    uid = db.Column('uid', db.Integer, primary_key=True, unique=True, index=True, nullable=False)
    nick = db.Column('nick', db.Text, nullable=True, default='无名小卒')
    status = db.Column('status', db.Integer, nullable=False, default=0)
    mob = db.Column('mob', db.Text, unique=True, nullable=False)
    pwd = db.Column('pwd', db.Text, nullable=False)


def init_users():
    if not User.query.first():
        default_users = [
            User(uid=101, nick='杨天化', mob='1', pwd='1'),
            User(uid=102, nick='朱晓峰', mob='2', pwd='2'),
            User(uid=103, nick='和铁行', mob='3', pwd='3'),
            User(uid=104, nick='邵祝燕', mob='4', pwd='4'),
            User(uid=105, nick='何寒晖', mob='5', pwd='5'),
            User(uid=106, nick='王伟', mob='6', pwd='6'),
            User(uid=107, nick='董静静', mob='7', pwd='7'),
            User(uid=108, nick='叶寒锋', mob='8', pwd='8'),
            User(uid=109, nick='郑乐一', mob='9', pwd='9'),
            User(uid=110, nick='孙冠群', mob='10', pwd='10'),
            User(uid=111, nick='刘亚茹', mob='11', pwd='11'),
            User(uid=112, nick='吴峻', mob='12', pwd='12'),
            User(uid=113, nick='马林', mob='13', pwd='13'),
            User(uid=114, nick='游录超', mob='14', pwd='14'),
            User(uid=115, nick='杨鹏', mob='15', pwd='15'),
            User(uid=116, nick='姚乐', mob='16', pwd='16'),
            User(uid=117, nick='席宁丽', mob='17', pwd='17'),
            User(uid=118, nick='陶英', mob='18', pwd='18'),
            User(uid=119, nick='辛均益', mob='19', pwd='19'),
            User(uid=120, nick='李凯', mob='20', pwd='20'),
            User(uid=121, nick='周亨', mob='21', pwd='21'),
            User(uid=122, nick='钟方榕', mob='22', pwd='22'),
            User(uid=123, nick='孔瑜', mob='23', pwd='23'),
            User(uid=124, nick='王帆', mob='24', pwd='24'),
            User(uid=125, nick='肖霞', mob='25', pwd='25'),
            User(uid=126, nick='张菲露', mob='26', pwd='26'),
            User(uid=127, nick='张一帆', mob='27', pwd='27'),
            User(uid=128, nick='张鹏鹏', mob='28', pwd='28'),
            User(uid=129, nick='方晨晨', mob='29', pwd='29'),
            User(uid=130, nick='刘敏慧', mob='30', pwd='30'),
            User(uid=131, nick='郭晓璇', mob='31', pwd='31'),
            User(uid=132, nick='唐佳良', mob='32', pwd='32'),
            User(uid=133, nick='王郁懿', mob='33', pwd='33'),
            User(uid=134, nick='袁培熠', mob='34', pwd='34'),
            User(uid=135, nick='胡海翔', mob='35', pwd='35'),
            User(uid=136, nick='许明星', mob='36', pwd='36'),
            User(uid=137, nick='蒋伟祺', mob='37', pwd='37'),
            User(uid=138, nick='王语佳', mob='38', pwd='38'),
            User(uid=139, nick='索海瑞', mob='39', pwd='39'),
            User(uid=140, nick='王雨晨', mob='40', pwd='40'),
            User(uid=141, nick='李书五', mob='41', pwd='41'),
            User(uid=142, nick='黄海芸', mob='42', pwd='42'),
            User(uid=143, nick='冯洋一', mob='43', pwd='43')
        ]
        db.session.bulk_save_objects(default_users)
        db.session.commit()
        print("初始化测试用户完成.")
