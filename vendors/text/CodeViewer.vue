<!--
 * @Author: C.
 * @Date: 2022-08-19 17:00:14
-->
<template>
  <div class="code-content" ref="myedit">
    <div class="func-bar">
      <div class="circles">
        <div
          v-for="item in colorList"
          :style="{ background: item }"
          :key="item"
          class="circle-style"
        ></div>
      </div>
      <div class="func-button">
        <!--                <i :class="readonly ? 'el-icon-view' : 'el-icon-edit'" @click="changeMode"></i>-->
        <i class="el-icon-full-screen" @click="toFullScreen"></i>
        <!-- <i class="el-icon-edit"></i>
        <i class="el-icon-edit"></i> -->
      </div>
    </div>
    <prism-editor
      class="my-editor"
      v-model="value"
      :highlight="highlighter"
      :line-numbers="lineNumbers"
      :readonly="readonly"
    ></prism-editor>
  </div>
</template>

<script>
import {PrismEditor} from "vue-prism-editor";
import "vue-prism-editor/dist/prismeditor.min.css"; // import the styles somewhere
import {highlight, languages} from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";
import {fullScreen} from "../../utils/index";

export default {
  props: {
    value: {
      type: String,
      default: ""
    }
  },
  components: {
    PrismEditor
  },
  data: () => ({
    // true为编辑模式， false只展示不可编辑
    readonly: false,
    lineNumbers: true,
    colorList: ["#fd635b", "#ffc130", "#29d045"]
  }),
  methods: {
    highlighter(code) {
      return highlight(code, languages.js); //returns html
    },
    changeMode() {
      this.readonly = !this.readonly;
      this.$message.success(`已切换成${this.readonly ? "只读模式" : "编辑模式"}`);
    },
    toFullScreen() {
      console.log(11111111111)
      fullScreen(this.$refs.myedit);
    }
  }
};
</script>

<style scoped lang="scss">
.code-content {
  //background: #2d2d2d;
  background: transparent;
}

.func-bar {
  width: 100%;
  height: 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .circles {
    width: 100px;
    display: flex;
    padding-top: 5px;
    margin: 0px 0 0 10px;

    .circle-style {
      width: 15px;
      height: 15px;
      border-radius: 50%;
      margin-left: 5px;
      margin-bottom: 5px;
    }
  }

  .func-button {
    padding-right: 10px;

    i {
      margin: 5px 10px 0 0;
      font-size: 20px;
      color: #e6a23c;
    }
  }
}

.my-editor {
  //background: #2d2d2d;
  background: transparent !important;
  color: #ccc;
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 18px;
  line-height: 1.5;
  padding: 5px;
  //height: calc(100vh - 92px);
  width: 99%;
}

/* optional */
.prism-editor__textarea:focus {
  outline: none !important;
}
</style>
