/**
 * 配置节流函数
 * @param  {[Function]}  fn     [要执行的函数]
 * @param  {[Number]}  delay    [延迟执行的毫秒数]
 * @param  {[Number]}  mustRun  [至少多久执行一次]
 * @return {[Function]}         [节流函数]
 */
var throttle = function(fn, wait, mustRun) {
    var timeout;
    var startTime = new Date();
    return function() {
        var context = this;
        var args = arguments;
        var curTime = new Date();

        clearTimeout(timeout);
        // 如果达到了规定的触发时间间隔，触发 handler
        if (curTime - startTime >= mustRun) {
            fn.apply(context, args);
            startTime = curTime;
            // 没达到触发间隔，重新设定定时器
        } else {
            timeout = setTimeout(fn, wait);
        }
    };
};


// 列表组件
Vue.component('list-block', {
    props: ['items', 'msg'],
    template: `
        <ul class="topic-list">
            <li class="list-wrapper" v-for="item in items">
                <h3 :class="getThemeClass(item)">
                    <span>{{ getTheme(item) }}</span>{{ item.title }}
                </h3>
                <div class="content">
                    <img :src="item.author.avatar_url">
                    <div>
                        <p>
                            <span class="name">{{ item.author.loginname }}</span>
                            <span><i style="color: red">{{ item.reply_count }}</i> <em style="color: #999">/ {{ item.visit_count }}</em></span>
                        </p>
                        <p><span class="topicTime">{{ item.create_at | formatTime }}</span><span>{{ item.last_reply_at | formatTime}}</span></p>
                    </div>
                </div>
            </li>
        </ul>
    `,
    filters: {
        formatTime: function (time) {
            var timeagoInstance = timeago();
            var x = timeagoInstance.format(time, 'zh_CN')
            return x
        }
    },
    methods: {
        getThemeClass: function (item) {
            var theme = item.top ? 'top'
                        : item.good ? 'good'
                        : item.tab ? item.tab
                        : 'err'
            return theme
        },
        getTheme: function (item) {
            var theme = item.top ? 'top'
                        : item.good ? 'good'
                        : item.tab ? item.tab
                        : 'err'
            return this.msg[theme]
        }
    }
})



var Topic = { template: '<div class="markdown-body"><span v-html="$route.query.content"></span></div>'}
var TopicList = {
    props: ['items', 'msg'],
    template: `
        <ul class="topic-list">
            <li class="list-wrapper" v-for="item in items">
                <router-link :to="{path:'/topic',query:item}">
                    <h3 :class="getThemeClass(item)">
                        <span>{{ getTheme(item) }}</span>{{ item.title }}
                    </h3>
                    <div class="content">
                        <img :src="item.author.avatar_url">
                        <div>
                            <p>
                                <span class="name">{{ item.author.loginname }}</span>
                                <span><i style="color: red">{{ item.reply_count }}</i> <em style="color: #999">/ {{ item.visit_count }}</em></span>
                            </p>
                            <p><span class="topicTime">{{ item.create_at | formatTime }}</span><span>{{ item.last_reply_at | formatTime}}</span></p>
                        </div>
                    </div>
                </router-link>
            </li>
        </ul>
    `,
    filters: {
        formatTime: function (time) {
            var timeagoInstance = timeago();
            var x = timeagoInstance.format(time, 'zh_CN')
            return x
        }
    },
    methods: {
        getThemeClass: function (item) {
            var theme = item.top ? 'top'
                        : item.good ? 'good'
                        : item.tab ? item.tab
                        : 'err'
            return theme
        },
        getTheme: function (item) {
            var theme = item.top ? 'top'
                        : item.good ? 'good'
                        : item.tab ? item.tab
                        : 'err'
            return this.msg[theme]
        }
    }
}




var routes = [
    { path: '/', redirect: '/topiclist' },
    { path: '/topiclist', component: TopicList },
    { path: '/topic', component: Topic }
]


var router = new VueRouter({
    routes: routes
})
var vm = new Vue({
    router,
    data: {
        topicList: [],
        msg: {
            share: '分享',
            job: '招聘',
            ask: '问答',
            good: '精华',
            top: '置顶',
            err: '暂无'
        },
        scroll: true,
        params:{
            page: 1,
            limit: 20,
            tab: 'all',
            mdrender: true
        }
    },
    methods: {
        // 页面滚动到底部触发函数
        getScrollData() {
            if (this.scroll) {
                var totalheight = parseInt($(window).height()) + parseInt($(window).scrollTop());
                // 当页面滚动到屏幕的4分之3
                var getDateLimit = parseInt($(document).height()*.25)
                if ($(document).height() - totalheight < getDateLimit ) {
                    this.scroll = false;
                    this.params.page += 1;
                    this.getTopics();
                }
            }
        },
        getTopics() {
            this.$http.get('https://cnodejs.org/api/v1/topics',{params: this.params}).then(function (res) {
                this.scroll = true;
                if(this.topicList[0] === undefined){
                    this.topicList = res.body.data
                    console.log(res.body.data)
                }else{
                    res.body.data.forEach(function (n) {
                        this.topicList.push(n)
                    }.bind(this))
                }
            })
        },
    },
    beforeCreate: function () {
        console.log('beforeCreate')
        // ?page=1&limit=20&tab=all&mdrender=true
    },
    created: function () {
        console.log('created')
        // 当实例创建完后开始请求数据
        this.getTopics()
    },
    beforeMount: function () {
        console.log('beforeMount')
    },
    mounted: function () {
        console.log('mounted')
        window.onscroll = throttle(this.getScrollData, 300, 1000)
    },
    filters: {
        formatTime: function (time) {
            var timeagoInstance = timeago();
            var x = timeagoInstance.format(time, 'zh_CN')
            return x
        }
    },
    computed: {

    }
}).$mount('#app')
