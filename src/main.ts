import { createApp } from 'vue'
import { components, plugins } from './plugins/element-plus-import'
import App from './App.vue'

const app = createApp(App)

components.forEach((component) => {
  app.component(component.name, component)
})

plugins.forEach((plugin) => {
  app.use(plugin)
})

app.mount('#app')
