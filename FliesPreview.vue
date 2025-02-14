<template>
  <!-- 主要的应用界面，根据show属性控制显示 -->
  <div class="preview-wrapper" v-if="show">
    <!-- 顶部横幅区域 -->
    <div class="preview-banner">
      <!-- 显示文件名 -->
      <div class="preview-banner-file" v-if="fileName"
        :title="fileName||''"
      >
        <i
          class="el-icon-folder-opened"
          style="font-size: 25px; margin-right: 5px; color: #e6a23c"
        ></i>
        {{ fileName }}
      </div>


      <!-- 右侧操作区域 -->
      <div class="preview-banner-right">
        <!-- 下载按钮 -->
        <el-button type="primary" round size="mini" @click="download">下载</el-button>
        <!-- 全屏按钮 -->
        <i class="el-icon-full-screen screenfull-style" @click.stop="toFullScreen"></i>
        <!-- 文件选择输入框，隐藏 -->
        <input v-show="false" type="file" ref="fileButton" @change="handleChange"/>
      </div>
    </div>
    <!-- 内容区域，用于显示文档 -->
    <div
      class="preview-content"
      ref="screenFullContent"
      v-loading="loading"
      element-loading-text="正在加载中，请耐心等待..."
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.8)"
    >
      <!-- 文件输出区域 -->
      <div ref="output" class="output"></div>
    </div>
  </div>
</template>

<script>
// 导入所需工具函数和库
import {getExtend, readBuffer, render, fullScreen, load} from "./utils/index";
import {parse} from "qs";
import axios from "axios";

/**
 * 支持嵌入式显示，基于postMessage支持跨域
 * 示例代码：
 *
 */
export default {
  name: "filePreview",
  // 定义组件属性
  props: {
    //{filePath}
    preWatchItem: {
      type: Object,
      default: () => {
        return {
          filePath:null,
          fileName:null
        };
      }
    }
  },
  // 组件数据
  data() {
    return {
      //界面加载
      show: false,
      // 加载状态跟踪
      loading: false,
      // 上个渲染实例
      last: null,
      // 隐藏头部，当基于消息机制渲染，将隐藏
      hidden: false,
      // 使用输入框
      input: false,
      // 浮层显示
      overlay: true,
      // 文件名
      fileName: "",
      // 网址
      url: "",
      currentFileContent: null,
    };
  },
  // 组件创建时的操作
  created() {

  },
  mounted() {
    this.loadFromUrl(this.preWatchItem)
  },
  // 组件方法
  methods: {
    // 关闭界面
    close(){
      this.show = false
      this.$emit('close',false)
    },
    // 从url加载文件进行预览
    loadFromUrl(item) {
      this.show = true

      this.loading = true;
      // 要预览的文件地址
      const url = window.MINIO_IP + item.filePath;
      console.log('文件预览axios 地址' , url)
      // 获取文件名
      const fileName = item.fileName
      this.fileName = fileName

      // 发起请求获取文件数据
      axios({
        url,
        method: "get",
        responseType: "blob"
      })
        .then(({data}) => {
          if (!data) {
            console.error("文件下载失败");
          }
          console.log(data);
          const file = new File([data], fileName, {});
          this.handleChange({target: {files: [file]}});
        })
        .finally((res) => {

          this.loading = false;
        });
    },
    // 处理文件选择事件
    async handleChange(e) {
      this.loading = true;
      try {
        const [file] = e.target.files;
        this.currentFileContent = file;
        console.log("-> file", file);
        // 解码文件名
        this.fileName = (file.name && decodeURIComponent(file.name)) || "";
        console.log("-> fileName", this.fileName);
        const arrayBuffer = await readBuffer(file);
        console.log("-> arrayBuffer", arrayBuffer);
        this.loading = false;
        this.last = await this.displayResult(arrayBuffer, file);
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    // 渲染文件到界面
    displayResult(buffer, file) {
      // 取得文件名
      const {name} = file;
      // 取得扩展名
      const extend = getExtend(name);
      // 输出目的地
      const {output} = this.$refs;
      // 生成新的dom
      const node = document.createElement("div");
      // 添加子元素，防止vue实例替换dom元素,销毁上一个渲染的dom
      if (this.last) {
        console.log(111)
        this.last.$destroy();
        output.removeChild(output.lastChild);

      }
      const child = output.appendChild(node);
      console.log(buffer, extend);
      // 调用渲染方法进行渲染
      return new Promise((resolve, reject) =>
        render(buffer, extend, child).then(resolve).catch(reject)
      )
    },
    // 触发文件选择
    handleupload() {
      this.$refs.fileButton?.click();
    },
    // 下载附件
    download() {
      load({
        fileName: this.fileName,
        file: this.currentFileContent
      }).then(res => {
        console.log(res);
      });
    },
    // 进入全屏模式
    toFullScreen() {
      fullScreen(this.$refs.screenFullContent);
    }
  },
  // 监听属性变化
  watch: {
    preWatchItem: {
      handler(newVal, oldVal) {
        // filePath & fileName
        console.log('preWatchItem'  , newVal)
        // if (newVal && newVal.fileName || newVal && newVal.filePath) {
          this.loadFromUrl(newVal)
        // }
      },
      deep: true, // 深度监听
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* 定义应用界面样式 */
.preview-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
  z-index: 100;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

/* 定义顶部横幅样式 */
.preview-banner {
  padding: 10px;
  height: 50px;
  width: 100%;
  /* padding: 0 30px; */
  background-color: #323639;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #f2ffff;
  position: relative;

  /* box-shadow: 0 6px 8px 4px #76767614; */
  /* background: white;
background: linear-gradient(
  to right bottom,
  rgba(255, 255, 255, 0.7),
  rgba(255, 255, 255, 0.3)
);
z-index: 2;
backdrop-filter: blur($blur); */
}

/* 文件名样式 */
.preview-banner-file {
  /*超出宽度部分用省略号代替*/
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  margin-right: 10px;
  /*鼠标移入时候提示全称*/


}

/* 网站标题样式 */
.preview-banner-title {
  text-decoration: none;
  color: #ededed;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 2px;
  display: flex;
  align-items: center;

  font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande", "Lucida Sans Unicode",
  Geneva, Verdana, sans-serif;
}

/* 右侧操作区域样式 */
.preview-banner-right {
  right: 15px;
  top: 15px;
  display: flex;
  align-items: center;
}

/* 内容区域样式 */
.preview-content {
  height: calc(100% - 50px);
  width: 100%;
  overflow-y: auto;
  background-color: #525659;
  color: #f2ffff;
}

/* .content-box::after{
  content:'https://gitee.com/cj6209577';
  position: absolute;
  left: 45%;
  top: 97%;
} */
/* 链接样式 */
.link-style {
  position: fixed;
  left: 50%;
  bottom: 5px;
  transform: translate(-50%);
  z-index: 99;
  text-decoration: none;
  color: #f2ffff;
  background-color: #525659;
}

/* 全屏按钮样式 */
.screenfull-style {
  margin-left: 10px;
  font-size: 25px;
}
.output{
  width: 100%;
  height: 100%
}
</style>
