<template>
  <div>
    <div ref="container" class="container">
      <!-- PDF Viewer 容器 -->
      <div id="viewer" class="pdfViewer" />
      <!-- PDF 缩放控件 -->
      <div class="pdf_scale">
        <el-input-number
          v-model="scaleNumber"
          @change="handleChange"
          :min="50"
          :max="150"
          size="mini"
          :step="10"
          label="描述文字"
        ></el-input-number>
      </div>
    </div>
  </div>
</template>

<script>
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import {
  EventBus,
  PDFViewer,
  PDFLinkService,
  PDFFindController
} from "pdfjs-dist/legacy/web/pdf_viewer";
import PdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker";
import "./pdf.css";

export default {
  name: "PdfView",
  props: {
    data: ArrayBuffer // 接收PDF数据
  },
  data() {
    return {
      search: "", // 搜索关键词
      pdf_scale: 1.0, // PDF放大系数
      scaleNumber: 100 // 缩放百分比
    };
  },
  created() {
    // 初始化PDF.js的Worker
    if (!GlobalWorkerOptions.workerPort && typeof window !== "undefined" && "Worker" in window) {
      GlobalWorkerOptions.workerPort = new PdfjsWorker();
    }
  },
  mounted() {
    this.loadFile(); // 加载PDF文件
  },
  methods: {
    handleChange(e) {
      // 处理缩放变化
      if (!this.viewer) return;
      this.viewer.currentScale = e / 100;
    },
    async loadFile() {
      const container = this.$refs.container; // 获取PDF容器
      const eventBus = new EventBus(); // 初始化事件总线

      // 初始化PDF链接服务
      const pdfLinkService = new PDFLinkService({ eventBus });

      // 初始化PDF查找控制器
      const pdfFindController = new PDFFindController({
        eventBus,
        linkService: pdfLinkService
      });

      // 初始化PDF查看器
      const pdfViewer = new PDFViewer({
        container,
        eventBus,
        linkService: pdfLinkService,
        findController: pdfFindController,
        enableScripting: true // 仅在PDF.js版本2.10.377及以下需要
      });
      pdfLinkService.setViewer(pdfViewer);

      // 页面初始化事件
      eventBus.on("pagesinit", () => {
        pdfViewer.currentScaleValue = 1; // 设置默认缩放比例

        // 如果有搜索关键词，执行搜索
        if (this.search) {
          eventBus.dispatch("find", { type: "", query: this.search });
        }
      });

      // 加载PDF文档
      const loadingTask = getDocument({
        data: this.data,
        cMapPacked: true,
        enableXfa: true
      });

      // 等待文档加载完成
      const pdfDocument = await loadingTask.promise;
      pdfViewer.setDocument(pdfDocument); // 设置文档到查看器
      pdfLinkService.setDocument(pdfDocument, window.MINIO_IP); // 设置文档到链接服务
      this.viewer = pdfViewer; // 保存查看器实例
    }
  }
};
</script>

<style scoped>
.container {
  position: absolute;
  width: calc(100% - 5px);
  height: calc(100% - 0px);
  overflow-y: auto;
}
.pdfViewer {

  margin: 0 auto;
  padding-bottom: 50px;
}
.container .pdf_scale {
  position: fixed;
  display: flex;
  z-index: 20;
  right: 50px;
  bottom: 5%;
}
</style>
