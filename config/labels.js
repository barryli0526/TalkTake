

exports.labels = {
    recordState:{ //文章各个状态
        pending:{
            name:'待审批',
            value:0
        },
        draft:{
            name:'草稿',
            value:1
        },
        deleted:{
            name:'已删除',
            value:2
        },
        unPassed:{
            name:'审批为通过',
            value:3
        },
        Approved:{
            name:'已通过',
            value:4
        }
    },

    role:{
        admin:0, //管理员
        user:1,  //登陆用户
        visitor:2 //游客
    },

    homeNavigator:{
        index:{
            name:'首页',
            url:'/'
        },
        article:{
            name:'文章',
            url:'/articles'
        },
        about:{
            name:'关于',
            url:'/about'
        }
    },

    default_avatar_url : 'http://www.gravatar.com/avatar?size=48'


}