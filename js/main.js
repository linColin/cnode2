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

// 头部与菜单组件
Vue.component('nav-header',{
    data: function () {
        return {
            sideBar: false,
            msg: {
                share: '分享',
                job: '招聘',
                ask: '问答',
                good: '精华',
                top: '置顶',
                err: '暂无',
                all: '全部'
            }
        }
    },
    template:`
        <header>
            <div class="nav-bar" :class="{show:sideBar}">
                <i class="iconfontyyy menuBtn" @click="openMenu"></i>
                <span>{{ msg[$route.query.tab] || '全部' }}</span>
            </div>
            <div class="menu" :class="{show:sideBar}">
                <router-link class="iconfontyyy" :to="{name:'topiclist',query:{tab:'all'}}"><i style="margin-right: 10px;">&#xe71a;</i>全部</router-link>
                <router-link class="iconfontyyy" :to="{name:'topiclist',query:{tab:'good'}}"><i style="margin-right: 10px;">&#xe71a;</i>精华</router-link>
                <router-link class="iconfontyyy" :to="{name:'topiclist',query:{tab:'share'}}"><i style="margin-right: 10px;">&#xe729;</i>分享</router-link>
                <router-link class="iconfontyyy" :to="{name:'topiclist',query:{tab:'ask'}}"><i style="margin-right: 10px;">&#xe704;</i>问答</router-link>
                <router-link class="iconfontyyy" :to="{name:'topiclist',query:{tab:'job'}}"><i style="margin-right: 10px;">&#xe6ff;</i>招聘</router-link>
                <router-link class="iconfontyyy" :to="{name:'about'}"><i style="margin-right: 10px;">&#xe71b;</i>关于</router-link>
            </div>
            <section v-if="sideBar" class="side-bar" @click="openMenu"></section>
        </header>
    `,
    methods: {
        openMenu() {
            this.sideBar = !this.sideBar;
            if(this.sideBar){
                $('html, body').addClass('scroll-hide');
            }else{
                $('html, body').removeClass('scroll-hide');
            }
        }
    },
    watch: {
        '$route' (to, from) {
            if (to.query && to.query.tab) {
                this.title = this.msg[to.query.tab]
            }
            $('html, body').removeClass('scroll-hide');
            this.sideBar = false
        }
    }
})

// 主题列表组件
Vue.component('list-block',{
    props:['query'],
    data:function () {
        return {
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
        }
    },
    template: `
        <div>
            <ul class="topic-list">
                <li class="list-wrapper" v-for="item in topicList">
                    <router-link :to="{name:'topic', params:{id:item.id}}">
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
        </div>
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
        },
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
                }else{
                    res.body.data.forEach(function (n) {
                        this.topicList.push(n)
                    }.bind(this))
                }
            })
        }
    },
    mounted(){
        if (this.$route.query && this.$route.query.tab) {
            this.params.tab = this.$route.query.tab;
        }
        this.getTopics()
        $(window).on('scroll', throttle(this.getScrollData, 300, 1000))
    },
    beforeRouteLeave(to, from, next) {

        next();
    },
    beforeRouteEnter(to, from, next) {

        next();
    },
    watch: {
        '$route' (to, from) {
            if (to.query && to.query.tab) {
                this.params.tab = to.query.tab
                this.topicList = [];
            }
            this.params.page = 1
            this.getTopics()
        }
    }
})


// 路由组件
var Topic = {
    data:function () {
        return {
            topic: {},
            topicId: '',
            msg: {
                share: '分享',
                job: '招聘',
                ask: '问答',
                good: '精华',
                top: '置顶',
                err: '暂无'
            },
        }
    },
    template: ` <div class="markdown-body" style="padding:0">
                    <div class="topic-list">
                        <div class="list-wrapper">
                            <h3 :class="getThemeClass(topic)">
                                <span>{{ getTheme(topic) }}</span>{{ topic.title }}
                            </h3>
                            <div class="content">
                                <img :src="topic.author && topic.author.avatar_url">
                                <div>
                                    <p>
                                        <span class="name">{{ topic.author&&topic.author.loginname }}</span>
                                        <span><i style="color: red">{{ topic.reply_count }}</i> <em style="color: #999">/ {{ topic.visit_count }}</em></span>
                                    </p>
                                    <p><span class="topicTime">{{ topic.create_at | formatTime }}</span><span>{{ topic.last_reply_at | formatTime}}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <section v-html="topic.content" style="padding:.5rem .6rem;"></section>
                </div>`,
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
        },
    },
    filters: {
        formatTime: function (time) {
            var timeagoInstance = timeago();
            var x = timeagoInstance.format(time, 'zh_CN')
            return x
        }
    },
    mounted(){
        this.topicId = this.$route.params.id
        this.$http.get('https://cnodejs.org/api/v1/topic/' + this.topicId).then(function (res) {
            if(res && res.data){
                this.topic = res.data.data;
            }
        })
        $(window).scrollTop(0);
    }
}
var TopicList = {
    template: `
        <div>
            <nav-header ref="head"></nav-header>
            <list-block :query="$route.query"></list-block>
        </div>
    `
}

var Home = {
    template:'<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);-webkit-transform:translate(-50%,-50%);">正在加载中....</div>',
    mounted() {
        setTimeout(() => {
            this.$router.push({
                name: 'topiclist'
            });
        }, 2000);
    }
}
var About = {
    template:`
        <section>
            <div style="padding:.5rem 0 .6rem 1rem;">
                <h3 style="font-size:.8rem;margin-bottom:.3rem;">关于项目</h3>
                <p style="font-size:.6rem;">该项目是基于Cnodejs的api，采用vue开发</p>
            </div>
            <div style="padding:.5rem 0 .6rem 1rem;">
                <h3 style="font-size:.8rem;margin-bottom:.3rem;">github 地址</h3>
                <p style="font-size:.6rem;">https://github.com/linColin/vue-cnode</p>
            </div>
            <div style="padding:.5rem 0 .6rem 1rem;">
                <h3 style="font-size:.8rem;margin-bottom:.3rem;">当前版本</h3>
                <p style="font-size:.6rem;">Vue2.0</p>
            </div>
        </section>
    `,
}

var routes = [
    // { path: '/', redirect: '/topiclist' },
    { path: '/', name: 'home', component: Home },
    { path: '/topiclist', name: 'topiclist', component: TopicList },
    { path: '/topic/:id', name: 'topic', component: Topic },
    { path: '/about', name: 'about', component: About }
]


var router = new VueRouter({
    routes: routes
})
var vm = new Vue({
    router,
    beforeCreate: function () {
        console.log('beforeCreate')
        // ?page=1&limit=20&tab=all&mdrender=true
    },
    created: function () {
        console.log('created')
        // 当实例创建完后开始请求数据
        // this.getTopics()
    },
    beforeMount: function () {
        console.log('beforeMount')
    },
    mounted: function () {
        console.log('mounted')
    },
    computed: {

    }
}).$mount('#app')
