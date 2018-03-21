import Vue from 'vue';
import App from './App.vue';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap';

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// import './scss';

if (!__DEV__) console.log = () => {};
window.log = console.log.bind(this, `%c LOG `, 'background: #FF7818; color: white');

Vue.use(BootstrapVue);

new Vue({
  components: { App },
  template: '<App/>',
}).$mount('#app');
