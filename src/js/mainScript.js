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
import {localStorageService} from "./service/data/localStorageService";
import VueMain from "../vue-components/vue-main.vue";

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
            let user = localStorageService.getDbUser();
            let promise = null;
            if (user && password) {
                promise = databaseService.loginWithUser(user, password, true);
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
        router: router,
        data: function () {
            return {
                linkList: [
                    {name: 'Einträge', to: '/entries'},
                    {name: 'Begriffe', to: '/tree'},
                    {name: 'Begriffe bearbeiten', to: '/tree/edit'},
                    {name: 'Login', to: '/login'},
                ]
            }
        },
        components: {VueMain}
    }).$mount('#app');
    initMatomoAnalytics();
}

init();

function initMatomoAnalytics() {
    var _paq = window._paq = window._paq || [];
    /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
    _paq.push(["setDoNotTrack", true]);
    _paq.push(["disableCookies"]);
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {
        var u="//analytics.wbt.wien/";
        _paq.push(['setTrackerUrl', u+'matomo.php']);
        _paq.push(['setSiteId', '2']);
        var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
        g.type='text/javascript'; g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
    })();
}