import "core-js/stable";
import "regenerator-runtime/runtime";
import Vue from 'vue'
import VueRouter from 'vue-router'
import TreeView from '../vue-components/treeView.vue'
import TreeEditView from '../vue-components/treeEditView.vue'
import LoginView from '../vue-components/loginView.vue'
import TagEditView from '../vue-components/tagEditView.vue'
import TagAddView from '../vue-components/tagAddView.vue'
import EntryEditView from '../vue-components/entryEditView.vue'
import EntriesView from '../vue-components/entriesView.vue'
import * as log from 'loglevel';
import {databaseService} from "./service/data/databaseService";
import 'mini.css';
import {localStorageService} from "./service/data/localStorageService";

function init() {
    window.log = log;

    let routes = [
        {path: '/tree', component: TreeView},
        {path: '/tree/edit', component: TreeEditView},
        {path: '/login', component: LoginView},
        {path: '/tag/edit/:tagid', component: TagEditView},
        {path: '/tag/add/:parentid', component: TagAddView},
        {path: '/entry/edit/:editid', component: EntryEditView},
        {path: '/entry/edit', component: EntryEditView},
        {path: '/entries', component: EntriesView},
        {path: '/entries/search/:searchtext', component: EntriesView},
        {path: '/entries/search/tag/:searchtags', component: EntriesView},
        {path: '*', redirect: '/entries'}
    ];

    let router = new VueRouter({
        routes
    });
    router.beforeEach((to, from, next) => {
        if (!databaseService.isLoggedIn()) {
            let password = localStorageService.getPassword();
            let promise = null;
            if (password) {
                promise = databaseService.loginReadWrite(password, true);
            } else {
                promise = databaseService.loginReadonly();
            }
            promise.then(() => {
                next();
            });
        } else {
            next();
        }
    });

    Vue.directive('focus', {
        inserted: function (el) {
            el.focus()
        }
    });

    Vue.use(VueRouter);
    let app = new Vue({
        router
    }).$mount('#app');
}

init();