import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
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
            }
        ]
    }
]
const router = createRouter({
    routes:route,
    history:createWebHashHistory(),
})

createApp(App).use(router).use(ElementPlus).mount('#app')
