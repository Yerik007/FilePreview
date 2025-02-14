import { defaultOptions, renderAsync } from "docx-preview";
import renderPptx from "@/components/FliesView/vendors/pptx";
import renderSheet from "@/components/FliesView/vendors/xlsx";
import renderPdf from "@/components/FliesView/vendors/pdf";
import renderImage from "@/components/FliesView/vendors/image";
import renderText from "@/components/FliesView/vendors/text";
import renderMp4 from "@/components/FliesView/vendors/mp4";

// 构造一个Vue的包装对象，便于统一处理销毁和替换节点
const VueWrapper = el => ({
    $el: el,
    $destroy() {
        // 目前不需要执行任何销毁操作
    }
});

// 定义文件类型处理器列表
const handlers = [
    // DOCX文件渲染器，使用docx-preview库
    {
        accepts: ["docx"],
        handler: async (buffer, target) => {
            const docxOptions = { ...defaultOptions, debug: true, experimental: true };
            await renderAsync(buffer, target, null, docxOptions);
            return VueWrapper(target);
        }
    },
    // PPTX文件渲染器，使用自定义的PPTX渲染库
    {
        accepts: ["pptx"],
        handler: async (buffer, target) => {
            await renderPptx(buffer, target, null);
            window.dispatchEvent(new Event("resize")); // 触发窗口调整事件
            return VueWrapper(target);
        }
    },
    // XLSX和XLS文件渲染器，使用自定义的表格渲染库
    {
        accepts: ["xlsx", "xls"],
        handler: async (buffer, target) => {
          try {
            return await renderSheet(buffer, target);
          } catch (error) {
            target.innerHTML = `
                      <div style="text-align: center; margin-top: 80px;color: #0a1425">
                          Excel文件渲染失败，请下载后尝试打开
                      </div>`;
            return VueWrapper(target);
          }
        }
    },
    // PDF文件渲染器，使用pdfjs库
    {
        accepts: ["pdf"],
        handler: async (buffer, target) => renderPdf(buffer, target)
    },
    // 图片文件渲染器，支持多种图片格式
    {
        accepts: ["gif", "jpg", "jpeg", "bmp", "tiff", "tif", "png", "svg"],
        handler: async (buffer, target) => renderImage(buffer, target)
    },
    // 纯文本文件渲染器，支持多种文本格式
    {
        accepts: [
            "txt", "json", "js", "css", "java", "py", "html", "jsx", "ts", "tsx", "xml", "md", "log"
        ],
        handler: async (buffer, target) => renderText(buffer, target)
    },
    // MP4视频文件渲染器
    {
        accepts: ["mp4"],
        handler: async (buffer, target) => {
            renderMp4(buffer, target);
            return VueWrapper(target);
        }
    },
    // 错误处理器，用于不支持的文件格式
    {
        accepts: ["error"],
        handler: async (buffer, target, type) => {
            target.innerHTML = `<div style="text-align: center; margin-top: 80px;color: #0a1425">不支持.${type}格式的在线预览，请下载后预览或转换为支持的格式</div>
<div style="text-align: center;color: #0a1425">支持docx, xlsx, pptx, pdf, 以及纯文本格式和各种图片格式的在线预览</div>`;
            return VueWrapper(target);
        }
    }
];

// 将文件类型与对应的处理器匹配并导出
export default handlers.reduce((result, { accepts, handler }) => {
    accepts.forEach(type => (result[type] = handler));
    return result;
}, {});
