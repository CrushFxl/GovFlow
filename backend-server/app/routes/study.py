from flask import Blueprint, request, jsonify
from app.models.New import New
import requests
from app.models import db
import re
import random

study_bk = Blueprint('study', __name__)

def keep_chinese_chars(text):
    """保留字符串中的中文字符和中文标点 并限制长度为50"""
    pattern = re.compile(r'[\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f]')
    return ''.join(pattern.findall(text))[:50]


def get_news_by_api():
    """ 从API返回学习教育页面的新闻数据, 写入数据库后返回(API调用较贵, 仅有需要时调用)"""
    url = 'https://api.tanshuapi.com/api/toutiao/v1/index'
    params = {
        'key': "6610ea621d28462a1c1f31f070ee6e2f",
        'type': "政治",
        'num': 40,
        'start': random.randint(0, 350)
    }
    response = requests.get(url, params=params)
    data = response.json()['data']['list']
    # 将所有新闻写入数据库
    for item in data:
        raw = item['content']
        new = New(
            title=item['title'],
            time=item['time'],
            src=item['src'],
            category=item['category'],
            pic=item['pic'],
            url=item['url'],
            weburl=item['weburl'],
            raw=raw,
            content=keep_chinese_chars(raw)
        )
        if New.query.filter_by(url=new.url).first():
            continue
        db.session.add(new)
    db.session.commit()
    return {'code': 1000, 'msg': 'ok', 'data': data}


@study_bk.route('/get_news_by_database', methods=['GET'])
def get_news_by_database():
    """从数据库返回学习教育页面的新闻数据，包括标题、描述、图片、来源和链接"""
    channel = request.args.get('channel')
    date = request.args.get('date')
    option = request.args.get('option')
    if option == 'today':
        get_news_by_api()
    # 构建查询
    query = New.query
    # 渠道筛选
    if channel and channel != 'all':
        # 由于模型中是src字段，我们需要映射渠道参数到实际的来源名称
        channel_mapping = {
            'xinhua': ['新华社'],
            'xinlang': ['新浪新闻'],
            'cctv': ['央视新闻', '央视新闻客户端', '央视'],
            'people': ['人民日报']
        }
        # 安全地获取映射的来源列表
        src = channel_mapping.get(channel, [])
        if src:
            # 使用SQLAlchemy正确的in_方法进行查询
            query = query.filter(New.src.in_(src))
    # 日期筛选
    if date:
        if date == 'latest':
            # 最新新闻，按时间倒序
            query = query.order_by(New.time.desc())
        elif date == 'oneday':
            # 近一天
            from datetime import datetime, timedelta
            one_day_ago = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
            query = query.filter(New.time >= one_day_ago)
        elif date == 'threedays':
            # 近三天
            from datetime import datetime, timedelta
            three_days_ago = (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d')
            query = query.filter(New.time >= three_days_ago)
        elif date == 'sevendays':
            # 近七天
            from datetime import datetime, timedelta
            seven_days_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
            query = query.filter(New.time >= seven_days_ago)
    if option == 'random':
        query = query.order_by(db.func.random())
    news = query.limit(50).all()
    news_data = []
    for item in news:        
        news_data.append({
            'title': item.title,
            'time': item.time,
            'url': item.weburl,
            'poster': item.pic,
            'description': item.content,
            'keywords': item.category,
            'channel': item.src
        })
    return {'code': 1000, 'msg': 'ok', 'data': news_data}