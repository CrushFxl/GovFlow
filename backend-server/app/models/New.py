from . import db
from datetime import datetime, timedelta
import re


def new_description():
    text = """【表格名称】news
    【表格描述】用于存储新闻信息。
    【字段描述】
    - title, str, 新闻标题
    - time, str, 新闻发布时间
    - src, str, 新闻来源
    - category, str, 新闻分类
    - pic, str, 新闻图片
    - url, str, 新闻URL
    - weburl, str, 新闻网页URL
    - raw, str, 新闻原始内容（此字段已弃用）
    - content, str, 新闻内容
    
    """
    return text


class New(db.Model):
    __tablename__ = 'news'
    
    title = db.Column('title', db.Text, nullable=False, primary_key=True)
    time = db.Column('time', db.Text, nullable=False)
    src = db.Column('src', db.Text, nullable=False)
    category = db.Column('category', db.Text, nullable=False)
    pic = db.Column('pic', db.Text, nullable=False)
    url = db.Column('url', db.Text, nullable=False)
    weburl = db.Column('weburl', db.Text, nullable=False)
    raw = db.Column('raw', db.Text, nullable=False)
    content = db.Column('content', db.Text, nullable=True)


def keep_chinese_chars(text):
    """保留字符串中的中文字符和中文标点 并限制长度为50"""
    pattern = re.compile(r'[\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f]')
    return ''.join(pattern.findall(text))[:50]

def init_news():
    """初始化新闻表"""
    if not New.query.first():
        primary_news = [
            {
                "title": "学习·故事丨习近平：“要做到全村最好的房子是学校”",
                "time": "2025-09-13",
                "src": "新浪新闻",
                "category": "news",
                "pic": "https://n.sinaimg.cn/default/feedbackpics/transform/116/w550h366/20180326/Rr85-fysqfnf9556405.png",
                "url": "https://news.sina.cn/gn/2025-09-13/detail-infqirkm1896041.d.html",
                "weburl": "https://news.sina.com.cn/c/xl/2025-09-13/doc-infqirkm1896041.shtml",
                "raw": "来源人民网中国共产党新闻网"
            },
            {
                "title": "壹视界 | 以人民之心为心 以天下之利为利",
                "time": "2025-09-13",
                "src": "人民日报",
                "category": "news",
                "pic": "https://n.sinaimg.cn/front20250911ac/200/w640h360/20250911/c9e7-1320be57d76e08e799f9a6727eeb1f7c.jpg",
                "url": "https://news.sina.cn/gn/2025-09-13/detail-infqirks3747944.d.html",
                "weburl": "https://news.sina.com.cn/c/xl/2025-09-13/doc-infqirks3747944.shtml",
                "raw": "年初秋，中国以一场主场外交和一场盛大阅兵向世界昭示中国不仅有保卫人民和平生活、维护世界和平发展的坚定意"
            },
            {
                "title": "【新思想引领新征程】中国服务贸易创新升级步伐加快",
                "time": "2025-09-13",
                "src": "央视",
                "category": "news",
                "pic": "https://n.sinaimg.cn/default/crawl/59/w550h309/20250913/5255-8488255ebb4fa2f494dd10d4adfdff63.jpg",
                "url": "https://news.sina.cn/gn/2025-09-13/detail-infqhynu8783097.d.html",
                "weburl": "https://news.sina.com.cn/c/xl/2025-09-13/doc-infqhynu8783097.shtml",
                "raw": "央视网消息，新闻联播：习近平总书记指出，要创新提升服务贸易、主动对接国际高标准经贸规则推动服务领域规则、规制"
            },
            {
                "title": "胜利之师迈向世界一流——中国人民抗日战争暨世界反法西斯战争胜利80周年纪念活动启示录（三）",
                "time": "2025-09-13",
                "src": "新华社",
                "category": "news",
                "pic": "https://n.sinaimg.cn/default/2fb77759/20151125/320X320.png",
                "url": "https://news.sina.cn/gn/2025-09-13/detail-infqhynr6939774.d.html",
                "weburl": "https://news.sina.com.cn/c/xl/2025-09-13/doc-infqhynr6939774.shtml",
                "raw": "新华社题：胜利之师迈向世界一流中国人民抗日战争暨世界反法西斯战争胜利周年纪念活动启示录三新华"
            },
            {
                "title": "【讲习所·中国与世界】习近平：以“三个坚持”推进“大金砖合作”",
                "time": "2025-09-11",
                "src": "新浪新闻",
                "category": "党建",
                "pic": "https://n.sinaimg.cn/news/456/w285h171/20250911/77bd-79f7bf18bdb3fd75b7cf45ab72262bdd.png",
                "url": "https://news.sina.cn/gn/2025-09-11/detail-infqctzz1436086.d.html",
                "weburl": "https://news.sina.com.cn/c/xl/2025-09-11/doc-infqctzz1436086.shtml",
                "raw": "来源中央广电总台国际在线本期导读月日晚中国国家主席习近平在北京以视频方式出席金砖国家领导人线上峰会并"
            },
            {
                "title": "永远做中华民族文明成果与人类和平事业的捍卫者",
                "time": "2025-09-12",
                "src": "新华社",
                "category": "news",
                "pic": "https://n.sinaimg.cn/default/feedbackpics/transform/116/w550h366/20180418/sAXi-fzihnep5214947.png",
                "url": "https://news.sina.cn/gn/2025-09-12/detail-infqhchx0459635.d.html",
                "weburl": "https://news.sina.com.cn/c/xl/2025-09-12/doc-infqhchx0459635.shtml",
                "raw": "有声剧版新华社月日播发《新华社政论永远做中华民族文明成果与人类和平事业的捍卫者写在中国人民抗日战争暨"
            }
            
        ]
        # 将所有初始化新闻写入数据库
        for item in primary_news:
            raw = item['raw']
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
            db.session.add(new)
        print("初始化新闻完成.")
        db.session.commit()
    