import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@fortawesome/fontawesome-free/css/all.min.css';
import {createRouter, createWebHashHistory} from "vue-router";

const route = [
    {
        path:"/",
        component:()=>import("./page/index.vue"),
        redirect:"/home",
        children:[
            {
                path:'/home',
                component:()=>import("./page/home.vue"),
            },
            {
                path:'/user',
                component:()=>import('./page/user/user.vue')
            },
            {
                path:'/reward',
                component:()=>import("./page/reward/reward.vue"),
            },
            {
                path:'/class',
                component:()=>import('./page/class/class.vue'),
            },
            {
                path:'/permission',
                component:()=>import('./page/permission/permission.vue'),
            },
            {
                path:'/classall',
                component:()=>import('./page/classall/classall.vue'),
            },
            {
                path:'/self_info',
                component:()=>import('./page/selfInfo/selfInfo.vue'),
            }
        ]
    },
    {
        path:'/login',
        component:()=>import('./page/login/login.vue'),
    }
]
const router = createRouter({
    routes:route,
    history:createWebHashHistory(),
})

createApp(App).use(router).use(ElementPlus).mount('#app')
