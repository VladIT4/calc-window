import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false;

(<any>window)['base'] = new Vue;

fetch('./data.json').then(response => {
  return response.json();
}, (response) => {
  console.error(response); 
  alert("Ошибка. Недоступен файл конфигурации");
}).then(json => {
  if(json.length >= 0) {

    var app = new Vue({
      render: h => h(App, { props: { 
          groups: json[0].groups, 
          prices: json[0].prices,
          other: json[0].other
        }
      })
    }).$mount('#app');

    (<any>window)['base'].$emit('created');
  }
})