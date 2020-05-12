// 使用axios（本身是属于第三方库，与vue没有任何关系）封装成vue插件
import axios from 'axios'

// 单独引用 message
import { Message } from 'element-ui'

// 1.定义插件
const MyPlugin = {}

// 2.开发插件
MyPlugin.install = function (Vue, options) {
  // 基准地址设置
  axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'
  // axios初始化只加载一次
  // let AUTH_TOKEN = localStorage.getItem('token')
  // axios.defaults.headers.common['Authorization'] = AUTH_TOKEN

  // 添加请求拦截器 （每一次请求）
  axios.interceptors.request.use(function (config) {
    if(config.url !== 'login'){
      let AUTH_TOKEN = localStorage.getItem('token')
      // 在当前请求下加入Authorization
      config.headers['Authorization'] = AUTH_TOKEN 
      // axios.defaults.headers.common['Authorization'] = AUTH_TOKEN

    }

    // 在发送请求之前做些什么
    return config;
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  });

  // 需求：对所有网络失败的请求统一处理
  axios.interceptors.response.use(function (response){
    // 对响应数据做点什么
    let {meta:{status,msg}} = response.data
    // 表示服务器返回失败
    if(status!==200 && status!==201){
      Message.error(msg)
    }
    return response
  },function (error){
    // 对响应错误做点什么
    Message.error('服务器正在维护中...')
    return Promise.reject(error)
  })

  // 添加实例属性
  Vue.prototype.$http = axios
}
// 3.导出插件
export default MyPlugin
