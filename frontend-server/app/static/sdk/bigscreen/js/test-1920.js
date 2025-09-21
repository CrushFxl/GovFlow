/****** PLACE YOUR CUSTOM STYLES HERE ******/

// 党费缴纳数据
var party_fee_data = {"uploadData":[{"count":48},{"count":42},{"count":50},{"count":45},{"count":52},{"count":46}
			,{"count":49},{"count":43},{"count":47},{"count":51},{"count":44},{"count":50}],
		"updateData":[{"count":12},{"count":15},{"count":13},{"count":14},{"count":16},{"count":11}
			,{"count":14},{"count":13},{"count":12},{"count":15},{"count":11},{"count":16}],
		"viewData":[{"count":35},{"count":32},{"count":38},{"count":36},{"count":39},{"count":34}
			,{"count":37},{"count":33},{"count":36},{"count":39},{"count":32},{"count":38}]};
// 党员发展数据
var party_member_development_data = {"uploadData":[{"count":52},{"count":47},{"count":53},{"count":49},{"count":55},{"count":48}
		,{"count":51},{"count":46},{"count":50},{"count":54},{"count":47},{"count":52}],
	"updateData":[{"count":15},{"count":13},{"count":16},{"count":14},{"count":17},{"count":13}
		,{"count":15},{"count":12},{"count":14},{"count":16},{"count":13},{"count":17}],
	"viewData":[{"count":38},{"count":35},{"count":40},{"count":37},{"count":42},{"count":36}
		,{"count":39},{"count":34},{"count":38},{"count":41},{"count":35},{"count":40}]};
// 民主评议数据
var democratic_evaluation_data = {"uploadData":[{"count":46},{"count":43},{"count":49},{"count":44},{"count":51},{"count":45}
		,{"count":48},{"count":42},{"count":46},{"count":50},{"count":43},{"count":49}],
	"updateData":[{"count":13},{"count":12},{"count":14},{"count":13},{"count":15},{"count":12}
		,{"count":14},{"count":11},{"count":13},{"count":15},{"count":12},{"count":14}],
	"viewData":[{"count":34},{"count":32},{"count":37},{"count":33},{"count":39},{"count":34}
		,{"count":36},{"count":32},{"count":35},{"count":38},{"count":32},{"count":37}]};
		
// 三会一课统计模板
var Tpl1 = '<li>' +
			'<p class="data-count">18</p>' +
			'<span class="data-name">党员支部大会</span>' +
			'</li>' +
			'<li>' +
			'<p class="data-count">15</p>' +
			'<span class="data-name">党员组委会</span>' +
			'</li>' +
			'<li>' +
			'<p class="data-count">17</p>' +
			'<span class="data-name">党小组会</span>' +
			'</li>' ;		
var Tpl2 = '<li>' +
			'<p class="data-count">20</p>' +
			'<span class="data-name">党员支部大会</span>' +
			'</li>' +
			'<li>' +
			'<p class="data-count">14</p>' +
			'<span class="data-name">党员组委会</span>' +
			'</li>' +
			'<li>' +
			'<p class="data-count">16</p>' +
			'<span class="data-name">党小组会</span>' +
			'</li>' ;
var Tpl3 = '<li>' +
			'<p class="data-count">19</p>' +
			'<span class="data-name">党员支部大会</span>' +
			'</li>' +
			'<li>' +
			'<p class="data-count">16</p>' +
			'<span class="data-name">党员组委会</span>' +
			'</li>' +
			'<li>' +
			'<p class="data-count">15</p>' +
			'<span class="data-name">党小组会</span>' +
			'</li>' ;		
$('.com-screen-content .use-data').html(Tpl1);			
// 基于准备好的dom，初始化echarts实例
var myChart1= echarts.init(document.getElementById('main1'));
var myChart2 = echarts.init(document.getElementById('main2'));
var myChart3 = echarts.init(document.getElementById('main3'));
//var myChart4 = echarts.init(document.getElementById('main4'));
var myChart5 = echarts.init(document.getElementById('main5'));
var myChart6 = echarts.init(document.getElementById('main6'));
var myChart7 = echarts.init(document.getElementById('main7'));

getNowFormatDate();
init_myChart1();
init_myChart2();
init_myChart3(party_fee_data); // 使用党费缴纳数据初始化
init_myChart5();
init_myChart6();
init_myChart7();

// 初始化完成后立即调用resize，确保图表撑满父容器
function resizeCharts() {
    myChart1.resize();
    myChart2.resize();
    myChart3.resize();
    myChart5.resize();
    myChart6.resize();
    myChart7.resize();
}

// 确保DOM加载完成后调用resize
setTimeout(resizeCharts, 100);


function init_myChart3(data) {

	var uploadCnt = [];
	var updateCnt = [];

	var viewCnt = [];
	if (data.uploadData != null) {
		for (var i = 0; i < data.uploadData.length; i++) {
			uploadCnt.push(data.uploadData[i].count);
		}
	}
	if (data.updateData != null) {
		for (var i = 0; i < data.updateData.length; i++) {
			updateCnt.push(data.updateData[i].count);
		}
	}

	if (data.viewData != null) {
		for (var i = 0; i < data.viewData.length; i++) {
			viewCnt.push(data.viewData[i].count);
		}
	}
	option = {

		tooltip: {
			trigger: 'axis',
			formatter: function (params, ticket, callback) {
				var res = '';
				for (var i = 0, l = params.length; i < l; i++) {
					res += '' + params[i].seriesName + ' : ' + params[i].value + '<br>';
				}
				return res;
			},
			transitionDuration: 0,
			backgroundColor: 'rgba(83,93,105,0.8)',
			borderColor: '#535b69',
			borderRadius: 8,
			borderWidth: 2,
			padding: [5, 10],
			axisPointer: {
				type: 'line',
				lineStyle: {
					type: 'dashed',
					color: '#ffff00'
				}
			}
		},
		legend: {
			icon: 'circle',
			itemWidth: 8,
			itemHeight: 8,
			itemGap: 10,
			top: '16',
			right: '10',
			data: ['数据总量','共享次数','更新量'],
			textStyle: {
				fontSize: 14,
				color: '#a0a8b9'
			}
		},
		grid: {
			top: '46',
			left: '13%',
			right: '10',
			bottom: '10%',
			containLabel: true
		},
		xAxis: [{
			type: 'category',
			boundaryGap: false,
			axisLabel: {
				interval: 0,
				fontSize:14
			},
			axisLine: {
				show: false,
				lineStyle: {
					color: '#a0a8b9'
				}
			},
			axisTick: {
				show: false
			},
			data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月'],
			offset: 10
		}],
		yAxis: [{
			type: 'value',
			axisLine: {
				show: false,
				lineStyle: {
					color: '#a0a8b9'
				}
			},
			axisLabel: {
				margin: 10,
				textStyle: {
					fontSize: 14
				}
			},
			splitLine: {
				lineStyle: {
					color: '#2b3646'
				}
			},
			axisTick: {
				show: false
			}
		}],
		series: [{
			name: '数据总量',
			type: 'line',
			smooth: true,
			showSymbol: false,
			lineStyle: {
				normal: {
					width: 2
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(137, 189, 27, 0.3)'
					}, {
						offset: 0.8,
						color: 'rgba(137, 189, 27, 0)'
					}], false),
					shadowColor: 'rgba(0, 0, 0, 0.1)',
					shadowBlur: 10
				}
			},
			itemStyle: {
				normal: {
					color: '#1cc840'
				}
			},
			data: uploadCnt
		}, {
			name: '共享次数',
			type: 'line',
			smooth: true,
			showSymbol: false,
			lineStyle: {
				normal: {
					width: 2
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(219, 50, 51, 0.3)'
					}, {
						offset: 0.8,
						color: 'rgba(219, 50, 51, 0)'
					}], false),
					shadowColor: 'rgba(0, 0, 0, 0.1)',
					shadowBlur: 10
				}
			},
			itemStyle: {
				normal: {
					color: '#eb5690'
				}
			},
			data: viewCnt
		},  {
			name: '更新量',
			type: 'line',
			smooth: true,
			showSymbol: false,
			lineStyle: {
				normal: {
					width: 2
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(0, 136, 212, 0.3)'
					}, {
						offset: 0.8,
						color: 'rgba(0, 136, 212, 0)'
					}], false),
					shadowColor: 'rgba(0, 0, 0, 0.1)',
					shadowBlur: 10
				}
			},
			itemStyle: {
				normal: {
					color: '#43bbfb'
				}
			},
			data: updateCnt
		}
		]
	};
	myChart3.setOption(option);
}
function init_myChart2() {
	var data = {"uploadData":[{"count":3230},{"count":2986},{"count":3392},{"count":2642},{"count":3521},{"count":2573}
							,{"count":3132},{"count":3147},{"count":3283},{"count":3336},{"count":3831},{"count":3633}],
				"updateData":[{"count":310},{"count":281},{"count":123},{"count":97},{"count":323},{"count":373}
							,{"count":423},{"count":451},{"count":501},{"count":452},{"count":201},{"count":177}],
				"viewData":[{"count":1651},{"count":1842},{"count":2223},{"count":2123},{"count":2021},{"count":1812}
							,{"count":1928},{"count":2019},{"count":2613},{"count":2754},{"count":2981},{"count":3001}]};
	var uploadCnt = [];
	var updateCnt = [];

	var viewCnt = [];
	if (data.uploadData != null) {
		for (var i = 0; i < data.uploadData.length; i++) {
			uploadCnt.push(data.uploadData[i].count);
		}
	}
	if (data.updateData != null) {
		for (var i = 0; i < data.updateData.length; i++) {
			updateCnt.push(data.updateData[i].count);
		}
	}

	if (data.viewData != null) {
		for (var i = 0; i < data.viewData.length; i++) {
			viewCnt.push(data.viewData[i].count);
		}
	}
	option = {
	
		tooltip: {
			trigger: 'axis',
			formatter: function (params, ticket, callback) {
				var res = '';
				for (var i = 0, l = params.length; i < l; i++) {
					res += '' + params[i].seriesName + ' : ' + params[i].value + '<br>';
				}
				return res;
			},
			transitionDuration: 0,
			backgroundColor: 'rgba(83,93,105,0.8)',
			borderColor: '#535b69',
			borderRadius: 8,
			borderWidth: 2,
			padding: [5, 10],
			axisPointer: {
				type: 'line',
				lineStyle: {
					type: 'dashed',
					color: '#ffff00'
				}
			}
		},
		legend: {
			icon: 'circle',
			itemWidth: 8,
			itemHeight: 8,
			itemGap: 10,
			top: '16',
			right: '10',
			data: ['数据总量','共享次数','更新量'],
			textStyle: {
				fontSize: 14,
				color: '#a0a8b9'
			}
		},
		grid: {
			top:'46',
			left: '13%',
			right: '10',
			bottom: '10%',
			containLabel: true
		},
		xAxis: [{
			type: 'category',
			boundaryGap: false,
			axisLabel: {
				interval: 0,
				fontSize:14
			},
			axisLine: {
				show: false,
				lineStyle: {
					color: '#a0a8b9'
				}
			},
			axisTick: {
				show: false
			},
			data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月'],
			offset: 10
		}],
		yAxis: [{
			type: 'value',
			axisLine: {
				show: false,
				lineStyle: {
					color: '#a0a8b9'
				}
			},
			axisLabel: {
				margin: 10,
				textStyle: {
					fontSize: 14
				}
			},
			splitLine: {
				lineStyle: {
					color: '#2b3646'
				}
			},
			axisTick: {
				show: false
			}
		}],
		series: [{
			name: '数据总量',
			type: 'line',
			smooth: true,
			showSymbol: false,
			lineStyle: {
				normal: {
					width: 2
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(137, 189, 27, 0.3)'
					}, {
						offset: 0.8,
						color: 'rgba(137, 189, 27, 0)'
					}], false),
					shadowColor: 'rgba(0, 0, 0, 0.1)',
					shadowBlur: 10
				}
			},
			itemStyle: {
				normal: {
					color: '#1cc840'
				}
			},
			data: uploadCnt
		}, {
			name: '共享次数',
			type: 'line',
			smooth: true,
			showSymbol: false,
			lineStyle: {
				normal: {
					width: 2
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(219, 50, 51, 0.3)'
					}, {
						offset: 0.8,
						color: 'rgba(219, 50, 51, 0)'
					}], false),
					shadowColor: 'rgba(0, 0, 0, 0.1)',
					shadowBlur: 10
				}
			},
			itemStyle: {
				normal: {
					color: '#eb5690'
				}
			},
			data: viewCnt
		},  {
			name: '更新量',
			type: 'line',
			smooth: true,
			showSymbol: false,
			lineStyle: {
				normal: {
					width: 2
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
						offset: 0,
						color: 'rgba(0, 136, 212, 0.3)'
					}, {
						offset: 0.8,
						color: 'rgba(0, 136, 212, 0)'
					}], false),
					shadowColor: 'rgba(0, 0, 0, 0.1)',
					shadowBlur: 10
				}
			},
			itemStyle: {
				normal: {
					color: '#43bbfb'
				}
			},
			data: updateCnt
		}
		]
	};
	myChart2.setOption(option);
}
function init_myChart1(){
	option = {
			tooltip : {
				trigger: 'item',
				formatter: "{a} <br/>{b} : {c} ({d}%)"
			},
			color:['#8fc31f','#f35833','#00ccff','#ffcc00'],
		   
			series : [
				{
					name: '党员发展阶段构成',
					type: 'pie',
					radius : '40%',
					center: ['50%', '50%'],
					data:[
						{value:45, name:'递交入党申请书'},
						{value:30, name:'入党积极分子'},
						{value:15, name:'发展对象'},
						{value:10, name:'预备党员'}
					],
					itemStyle: {
						emphasis: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)'
						}
					},
					itemStyle: {
						normal: {
							label:{ 
								show: true, 
								formatter: '{b}:{c} ({d}%)' ,
								fontSize : 14
							}
						},
						labelLine :{show:true}
					}
				}
			]
			};
// 使用刚指定的配置项和数据显示图表。
	myChart1.setOption(option);
}

function init_myChart5(){
	var XData=["一月","二月","三月","四月","五月","六月","七月","八月","九月"];
	var yData=[42,48,45,52,47,50,46,49,51]; // 党费收缴数据，总和约430
	option = {
		backgroundColor:"",
		grid: {
			top: '40',
			left: '30',
			right: '10',
			bottom: '40',
			containLabel: true
		},
		xAxis: {
			axisTick: {
				show: false
			},
			splitLine: {
				show: false
			},
			splitArea: {
				show: false
			},
			data: XData,
			axisLabel: {
				formatter: function(value) {
					var ret = ""; //拼接加\n返回的类目项
					var maxLength = 1; //每项显示文字个数
					var valLength = value.length; //X轴类目项的文字个数
					var rowN = Math.ceil(valLength / maxLength); //类目项需要换行的行数
					if (rowN > 1) //如果类目项的文字大于3,
					{
						for (var i = 0; i < rowN; i++) {
							var temp = ""; //每次截取的字符串
							var start = i * maxLength; //开始截取的位置
							var end = start + maxLength; //结束截取的位置
							temp = value.substring(start, end) + "\n";
							ret += temp; //凭借最终的字符串
						}
						return ret;
					} else {
						return value;
					}
				},
				interval: 0,
				fontSize: 14,
				fontWeight: 100,
				textStyle: {
					color: '#9faeb5',

				}
			},
			axisLine: {
				lineStyle: {
					color: '#4d4d4d'
				}
			}
		},
		yAxis: {
			axisTick: {
				show: false
			},
			splitLine: {
				show: false
			},
			splitArea: {
				show: false
			},
			
			axisLabel: {
				textStyle: {
					color: '#9faeb5',
					fontSize: 16,
				}
			},
			axisLine: {
				lineStyle: {
					color: '#4d4d4d'
				}
			}
		},
		"tooltip": {
			"trigger": "axis",
			transitionDuration: 0,
			backgroundColor: 'rgba(83,93,105,0.8)',
			borderColor: '#535b69',
			borderRadius: 8,
			borderWidth: 2,
			padding: [5, 10],
			formatter: function (params, ticket, callback) {
				var res = '';
				for (var i = 0, l = params.length; i < l; i++) {
					res += '' + params[i].seriesName + ' : ' + params[i].value + '<br>';
				}
				return res;
			},
			axisPointer: {
				type: 'line',
				lineStyle: {
					type: 'dashed',
					color: '#ffff00'
				}
			}
		},
		series: [{
			name:'党费收缴',
			type:"bar",
			itemStyle: {
				normal: {
					color: {
						type: 'linear',
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [{
							offset: 0,
							color: '#c12c1f' // 0% 处的颜色
						}, {
							offset: 1,
							color: '#f8e6e5' // 100% 处的颜色
						}],
						globalCoord: false // 缺省为 false
					},
					barBorderRadius: 15,
				}
			},
			 label: {
					normal: {
						show: true,
						position: "top",
						textStyle: {
							color: "#ffc72b",
							fontSize: 10
						}
					}
			},
			data: yData,
			barWidth: 16,
		},{
			name:'折线',
			type:'line',
			itemStyle : {  /*设置折线颜色*/
				normal : {
				   /* color:'#c4cddc'*/
				}
			},
			data:yData
		}]
	};
	myChart5.setOption(option);
}
//刷新myChart5数据



function init_myChart6(){
	// 会议纪要数据
	var meeting_data = [
		{"count":12,"meetingName":"第一季度支部大会"},
		{"count":8,"meetingName":"组织生活会"},
		{"count":10,"meetingName":"民主评议党员会"},
		{"count":7,"meetingName":"党小组学习会"},
		{"count":9,"meetingName":"第二季度支部大会"},
		{"count":6,"meetingName":"党课学习会"},
		{"count":8,"meetingName":"第三季度支部大会"},
		{"count":7,"meetingName":"主题党日活动"},
		{"count":10,"meetingName":"年度总结大会"}
	];
	var counts = [];
	var meetingNames = [];
	for (var i = 0; i < meeting_data.length; i++) {
		counts.push(meeting_data[i].count);
		meetingNames.push(meeting_data[i].meetingName);
	}
	option = {
		"tooltip": {
			"trigger": "axis",
			transitionDuration: 0,
			backgroundColor: 'rgba(83,93,105,0.8)',
			borderColor: '#535b69',
			borderRadius: 8,
			borderWidth: 2,
			padding: [5, 10],
			formatter: function (params, ticket, callback) {
				var res = '';
				// 根据会议名称显示对应的会议内容和时间
				var meetingContents = {
					"第一季度支部大会": "学习贯彻党的二十大精神，讨论年度工作计划",
					"组织生活会": "开展批评与自我批评，查找问题并制定整改措施",
					"民主评议党员会": "对党员进行民主评议，评选优秀党员",
					"党小组学习会": "学习党的理论知识，交流学习心得",
					"第二季度支部大会": "总结上半年工作，部署下半年任务",
					"党课学习会": "专题学习党史，传承红色基因",
					"第三季度支部大会": "学习最新政策文件，讨论支部建设",
					"主题党日活动": "开展志愿服务活动，践行初心使命",
					"年度总结大会": "总结全年工作，表彰先进典型"
				};
				var meetingDates = {
					"第一季度支部大会": "2023-03-15",
					"组织生活会": "2023-04-20",
					"民主评议党员会": "2023-05-10",
					"党小组学习会": "2023-05-25",
					"第二季度支部大会": "2023-06-20",
					"党课学习会": "2023-07-15",
					"第三季度支部大会": "2023-09-20",
					"主题党日活动": "2023-10-10",
					"年度总结大会": "2023-12-25"
				};
				var meetingName = params[0].name;
				res += '会议名称: ' + meetingName + '<br>';
				res += '会议时间: ' + meetingDates[meetingName] + '<br>';
				res += '会议内容: ' + meetingContents[meetingName] + '<br>';
				res += '参与人数: ' + params[0].value + '人<br>';
				return res;
			},
			axisPointer: {
				type: 'line',
				lineStyle: {
					type: 'dashed',
					color: '#ffff00'
				}
			}
		},
		"grid": {
			"top": '40',
			"left": '30',
			"right": '10',
			"bottom": '40',
			containLabel: true,
			textStyle: {
				color: "#fff"
			}
		},
		"legend": {
			right: '24',
			top: "24",
			itemWidth: 12,
			itemHeight: 16,
			textStyle: {
				color: '#fff',
				fontSize:14
			},
			"data": ['会议纪要'],
		
		},
		"calculable": true,
		xAxis: [{
			'type': 'category',
			"axisTick": {
				"show": false
			},
			"axisLine": {
				"show": false,
				lineStyle: {
					color: '#868c96'
				}
			},
			"axisLabel": {
				"interval": 0,
				fontSize:14,
				formatter:function(value)
				{
					var ret = "";//拼接加\n返回的类目项
					var maxLength = 3;//每项显示文字个数
					var valLength = value.length;//X轴类目项的文字个数
					var rowN = Math.ceil(valLength / maxLength); //类目项需要换行的行数
					if (rowN > 1)//如果类目项的文字大于3,
					{
						for (var i = 0; i < rowN; i++) {
							var temp = "";//每次截取的字符串
							var start = i * maxLength;//开始截取的位置
							var end = start + maxLength;//结束截取的位置
							//这里也可以加一个是否是最后一行的判断，但是不加也没有影响，那就不加吧
							temp = value.substring(start, end) + "\n";
							ret += temp; //凭借最终的字符串
						}
						return ret;
					}
					else {
						return value;
					}
				}

				

			},
			"splitArea": {
				"show": false
			},
			'data': meetingNames,
			splitLine: {
				show: false
			}
		}],
		"yAxis": [
			{
				"type": "value",
				offset: -14,
				"splitLine": {
					"show": false
				},
				"axisLine": {
					"show": false,
					lineStyle: {
						color: '#868c96'
					}
				},
				"axisTick": {
					"show": false
				},
				"axisLabel": {
					"interval": 0,
					fontSize:14

				},
				"splitArea": {
					"show": false
				}
			}],
		
		"series": [
			{
				"name": "会议纪要",
				"type": "bar",
				
				"barGap": "10%",
				itemStyle: {//图形样式
					normal: {
						"color": '#00ad4e'
					}
				},
				label: {
					normal: {
						show: true,
						position: "top",
						textStyle: {
							color: "#ffc72b",
							fontSize: 10
						}
					}
				},
				"data": counts,
				barWidth: 14,
			},{
			name:'折线',
			type:'line',
			itemStyle : {  /*设置折线颜色*/
				normal : {
				  color:'#c7b198'
				}
			},
			data:[5421, 6512, 4621, 2842,6427, 4422,1020,1421,1776,2428],

		}
		]
	};

// 使用刚指定的配置项和数据显示图表。
	myChart6.setOption(option);
}

function init_myChart7(){

	
var colorList = [
    '#ff2600',
    '#ffc000',
    '#00ad4e',
    '#0073c2',
    '#165868',
    '#e76f00',
    '#316194',
    '#723761',
    '#00b2f1',
    '#4d6022',
    '#4b83bf',
    '#f9c813',
    '#0176c0'
];
var xData = ['公共服务','健康保障','安全生产','价格监督','能源安全','信用体系', '城乡建设', '社区治理', '生态环保','应急维稳'];
var yData = [2912,3991,4621,3941,3313,6631,5543,4463,6541,3381];
option = {
    color:colorList,
    "tooltip": {
			"trigger": "axis",
			transitionDuration: 0,
			backgroundColor: 'rgba(83,93,105,0.8)',
			borderColor: '#535b69',
			borderRadius: 8,
			borderWidth: 2,
			padding: [5, 10],
			formatter: function (params, ticket, callback) {
				var res = '';
				for (var i = 0, l = params.length; i < l; i++) {
					res += '' + params[i].seriesName + ' : ' + params[i].value + '<br>';
				}
				return res;
			},
			axisPointer: {
				type: 'line',
				lineStyle: {
					type: 'dashed',
					color: '#ffff00'
				}
			}
		},
    toolbox: {
        show : true,
        feature : {
            mark : {
                show: true
            },

        }
    },
    grid: {
       "borderWidth": 0,
		"top": '40',
		"left": '30',
		"right": '10',
		"bottom": '40',
		containLabel: true,
		textStyle: {
			color: "#fff"
		}
    },
    xAxis : [
       {
			'type': 'category',
			"axisTick": {
				"show": false
			},
			"axisLine": {
				"show": false,
				lineStyle: {
					color: '#868c96'
				}
			},
			"axisLabel": {
				"interval": 0,
				fontSize:14,
				formatter:function(value)
				{
					var ret = "";//拼接加\n返回的类目项
					var maxLength = 2;//每项显示文字个数
					var valLength = value.length;//X轴类目项的文字个数
					var rowN = Math.ceil(valLength / maxLength); //类目项需要换行的行数
					if (rowN > 1)//如果类目项的文字大于3,
					{
						for (var i = 0; i < rowN; i++) {
							var temp = "";//每次截取的字符串
							var start = i * maxLength;//开始截取的位置
							var end = start + maxLength;//结束截取的位置
							//这里也可以加一个是否是最后一行的判断，但是不加也没有影响，那就不加吧
							temp = value.substring(start, end) + "\n";
							ret += temp; //凭借最终的字符串
						}
						return ret;
					}
					else {
						return value;
					}
				}
			},
			"splitArea": {
				"show": false
			},
			'data': xData,
			splitLine: {
				show: false
			},
		
		}
    ],
    yAxis : [
      {
				"type": "value",
				offset: -14,
				"splitLine": {
					"show": false
				},
				"axisLine": {
					"show": false,
					lineStyle: {
						color: '#868c96'
					}
				},
				"axisTick": {
					"show": false
				},
				"axisLabel": {
					"interval": 0,
					fontSize:14

				},
				"splitArea": {
					"show": false
				}
			}

    ],
    series : [
        {
            name:'共享次数',
            type:'bar',
            data:yData,
            itemStyle: {
                normal: {
                    color: function(params) {
                        // build a color map as your need.
                        var colorList = [
                            '#ff2600',
                            '#ffc000',
                            '#00ad4e',
                            '#0073c2',
                            '#165868',
                            '#e76f00',
                            '#316194',
                            '#723761',
                            '#00b2f1',
                            '#4d6022',
                            '#4b83bf',
                            '#f9c813',
                            '#0176c0'
                        ];
                        return colorList[params.dataIndex]
                    },
                   
                }
            },
			 barWidth: 14,
			 label: {
					normal: {
						show: true,
						position: "top",
						textStyle: {
							color: "#ffc72b",
							fontSize: 10
						}
					}
				},
        },
		{
			name:'折线',
			type:'line',
			itemStyle : {  /*设置折线颜色*/
				normal : {
				  color:'#d3d5fd'
				}
			},
			data:yData
		}
     
    ]
};


// 使用刚指定的配置项和数据显示图表。
	myChart7.setOption(option);
}
//获取当前时间
function getNowFormatDate() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    var Hour =  date.getHours();       // 获取当前小时数(0-23)
    var Minute =  date.getMinutes();     // 获取当前分钟数(0-59)
    var Second = date.getSeconds();     // 获取当前秒数(0-59)
    var show_day=new Array('星期日','星期一','星期二','星期三','星期四','星期五','星期六');
    var day=date.getDay();
    if (Hour<10) {
        Hour = "0" + Hour;
    }
    if (Minute <10) {
        Minute = "0" + Minute;
    }
    if (Second <10) {
        Second = "0" + Second;
    }
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = '<div><p>'+year + '年' + month +'月' + strDate+'号</p><p>'+show_day[day]+'</p></div>';
    var HMS = Hour + ':' + Minute +':' + Second;
	var temp_time = year+'-'+month+'-'+strDate+' '+HMS;
    $('.nowTime li:nth-child(1)').html(HMS);
    $('.nowTime li:nth-child(2)').html(currentdate);
	//$('.topRec_List li div:nth-child(3)').html(temp_time);
    setTimeout(getNowFormatDate,1000);//每隔1秒重新调用一次该函数
}
var resourceDataType = $('.data-label li.active').data('type');//用于切换基础库
function urlType() {
    resourceDataType = $('.data-label li.active').data('type');
    if (resourceDataType == 1) {
        init_myChart3(party_fee_data);
		$('.com-screen-content .use-data').html(Tpl1);
    } else if (resourceDataType == 2) {
        init_myChart3(party_member_development_data);
		$('.com-screen-content .use-data').html(Tpl2);
    } else if (resourceDataType == 3) {
        init_myChart3(democratic_evaluation_data);
		$('.com-screen-content .use-data').html(Tpl3);
    }
}
var num =0 ;
//    资源类型定时器
function resourceType() {
    $('.data-label li').eq(num).addClass('active').siblings().removeClass('active');
    //$('.active-data-label').html($('.canvas-pic-two .data-label li.active').html());
    urlType();
    num++;
    if (num >= 3) {
        num = 0;
    }
}

//    资源类型点击切换
$('.data-label').on('click', 'li', function () {
    $(this).addClass('active').siblings().removeClass('active');
    $('.active-data-label').html($('.data-label li.active').html());
    urlType();
});
var oTimer = setInterval(resourceType, 3000);
//    hover清除定时器
$('.data-label').hover(function () {
    clearInterval(oTimer);
}, function () {
    oTimer = setInterval(resourceType, 3000);
});

// 监听窗口大小变化，正确调用resize方法以确保图表撑满父容器
window.onresize = function() {
    // 使用防抖函数优化窗口大小变化处理
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(function() {
        myChart1.resize();
        myChart2.resize();
        myChart3.resize();
        myChart5.resize();
        myChart6.resize();
        myChart7.resize();
    }, 50);
};
