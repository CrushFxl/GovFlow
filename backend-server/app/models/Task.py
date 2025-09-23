from . import db
from datetime import datetime


def task_description():
    text = """【表格名称】tasks
    【表格描述】用于存储用户下发的任务信息。
    【字段描述】
    - uuid, str, 任务的唯一标识符
    - title, str, 任务标题
    - description, str, 任务描述
    - start_date, str, 任务开始日期, 格式为YYYY-MM-DD
    - start_time, str, 任务开始时间, 格式为HH:MM
    - end_date, str, 任务结束日期, 格式为YYYY-MM-DD
    - end_time, str, 任务结束时间, 格式为HH:MM
    - location, str, 任务地点
    - frequency, int, 任务频率, 0表示一次性任务, 1表示每周任务, 2表示每月任务, 3表示每季度任务, 4表示每年任务
    - partners, json, 参与该任务的党员，列表，每个元素为参与者的真实姓名
    - organizations, json, 参与该任务的党组织，列表，每个元素为党组织的名称
    - created_uid, int, 创建任务的用户UID
    - created_time, str, 创建任务的时间
    - next_uid, int, 需要审核该任务的用户UID
    - status, int, 任务状态, 0: 待发布, 1: 待审核, 2: 审核通过, 3: 已完成, 4:审核拒绝
    - need_attachment, str, 'true'或'false', 表示是否关联了表格, 关联表格后, 所有参与该任务的组织成员或个人都须填写
    - attachment_id, int, 关联的表格ID
    """
    return text


class Task(db.Model):
    __tablename__ = 'tasks'

    uuid = db.Column('uuid', db.Text, primary_key=True, unique=True, index=True, nullable=False)
    title = db.Column('title', db.Text, nullable=False)
    description = db.Column('description', db.Text, nullable=False)
    start_date = db.Column('start_date', db.Text, nullable=False)
    start_time = db.Column('start_time', db.Text, nullable=False, default='00:00')
    end_date = db.Column('end_date', db.Text, nullable=False)
    end_time = db.Column('end_time', db.Text, nullable=False, default='23:59')
    location = db.Column('location', db.Text, nullable=True, default='不限')
    frequency = db.Column('frequency', db.Integer, nullable=False, default=0)
    partners = db.Column('partners_real_name', db.JSON, nullable=False)
    organizations = db.Column('organizations', db.JSON, nullable=False)
    created_uid = db.Column('created_uid', db.Integer, nullable=False)
    created_time = db.Column('created_time', db.Text, nullable=False)
    next_uid = db.Column('next_uid', db.Integer, nullable=False)
    status = db.Column('status', db.Integer, nullable=False, default=0)

    need_attachment = db.Column('need_attachment', db.Text, nullable=False, default='false')
    attachment_id = db.Column('attachment_id', db.Integer, nullable=True)


def init_tasks():
    if not Task.query.first():
        default_task = [
            Task(uuid="TEST-UUID-1", title='召开主题廉政教育大会',
                 description='明天下午三点在活动中心125召开主题廉政教育大会，受邀各级党组织和党员需要按时参加，会议期间手机保持静音，从侧门入，不要迟到。',
                 location='活动中心125',
                 start_date=datetime.now().strftime('%Y-%m-%d'),
                 end_date=datetime.now().strftime('%Y-%m-%d'),
                 end_time='15:00',
                 created_uid=1,
                 created_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                 next_uid=1,
                 partners=['冯小二', '杨小二'],
                 organizations=['灵创大学党委'],
                 status=2),
            Task(uuid="TEST-UUID-2", title='关于九月份党费收缴的通知',
                 description='请各党组织和党员及时完成九月份党费收缴工作，务必于本月底前将党费足额上缴至党费专用账户。上缴时请备注好党组织名称或党员姓名，如有疑问请联系冯小二。',
                 location='线上',
                 start_date=datetime.now().strftime('%Y-%m-%d'),
                 end_date=datetime.now().strftime('%Y-%m-%d'),
                 end_time='15:00',
                 created_uid=1,
                 created_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                 next_uid=1,
                 partners=['冯小二', '杨小二'],
                 organizations=['灵创大学党委'],
                 status=2),
            Task(uuid="TEST-UUID-3", title='关于确定冯小二同志为预备党员的决定',
                 description='请孔小二做好冯小二同志确定为预备党员的发展记录。',
                 location='行政楼302会议室',
                 start_date=datetime.now().strftime('%Y-%m-%d'),
                 end_date=datetime.now().strftime('%Y-%m-%d'),
                 end_time='16:00',
                 created_uid=1,
                 created_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                 next_uid=1,
                 partners=['孔小二'],
                 organizations=['灵创大学各二级学院党委'],
                 status=2),
            Task(uuid="TEST-UUID-4", title='关于开展冯小二同志年度民主评议的通知',
                 description='请各党员针对冯小二同志进行民主评议，从政治素质、工作能力、作风表现等方面给出客观评价。评议结果需在规定时间内提交。',
                 location='线上',
                 start_date=datetime.now().strftime('%Y-%m-%d'),
                 end_date=datetime.now().strftime('%Y-%m-%d'),
                 end_time='23:59',
                 created_uid=1,
                 created_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                 next_uid=1,
                 partners=['孔小二', '杨小二'],
                 organizations=['灵创大学党委'],
                 status=2),
        ]
        db.session.bulk_save_objects(default_task)
        db.session.commit()
        print("初始化测试任务完成.")
