
import renders from "./renders";
import screenfull from "./screenfull";
import load from "./load";

/**
 * 读取文件内容为ArrayBuffer
 * @param {File} file - 要读取的文件对象
 * @returns {Promise<ArrayBuffer>} - 返回一个Promise，成功时包含文件的ArrayBuffer内容
 */
export async function readBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        // 当文件读取成功时，返回结果
        reader.onload = loadEvent => resolve(loadEvent.target.result);
        // 当文件读取失败时，返回错误
        reader.onerror = e => reject(e);
        // 以ArrayBuffer格式读取文件
        reader.readAsArrayBuffer(file);
    });
}

/**
 * 将ArrayBuffer转换为Data URL字符串
 * @param {ArrayBuffer} buffer - 要转换的ArrayBuffer
 * @returns {Promise<string>} - 返回一个Promise，成功时包含Data URL字符串
 */
export async function readDataURL(buffer) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        // 当转换成功时，返回Data URL字符串
        reader.onload = loadEvent => resolve(loadEvent.target.result);
        // 当转换失败时，返回错误
        reader.onerror = e => reject(e);
        // 将ArrayBuffer转换为Data URL
        reader.readAsDataURL(new Blob([buffer]));
    });
}

/**
 * 将ArrayBuffer转换为文本字符串
 * @param {ArrayBuffer} buffer - 要转换的ArrayBuffer
 * @returns {Promise<string>} - 返回一个Promise，成功时包含文本字符串
 */
export async function readText(buffer) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        // 当转换成功时，返回文本字符串
        reader.onload = loadEvent => resolve(loadEvent.target.result);
        // 当转换失败时，返回错误
        reader.onerror = e => reject(e);
        // 将ArrayBuffer转换为文本字符串，使用UTF-8编码
        reader.readAsText(new Blob([buffer]), "utf-8");
    });
}

/**
 * 获取文件扩展名
 * @param {string} name - 文件名
 * @returns {string} - 文件的扩展名
 */
export function getExtend(name) {
    // 找到最后一个点的位置
    const dot = name.lastIndexOf(".");
    // 返回从最后一个点之后的字符串，即文件扩展名
    return name.substring(dot + 1);
}

/**
 * 渲染文件内容
 * @param {ArrayBuffer} buffer - 文件的ArrayBuffer内容
 * @param {string} type - 文件类型
 * @param {HTMLElement} target - 渲染目标元素
 * @returns {Promise} - 渲染操作的Promise
 */
export async function render(buffer, type, target) {
    // 根据文件类型获取对应的渲染处理器
    const handler = renders[type];
    if (handler) {
        // 如果存在处理器，使用处理器渲染内容
        return handler(buffer, target);
    }
    // 如果没有对应的处理器，使用错误处理器
    return renders.error(buffer, target, type);
}

/**
 * 切换全屏状态
 * @param {HTMLElement} ref - 要切换全屏的元素，如果未提供，则使用当前文档
 */
export function fullScreen(ref) {
    // 如果提供了元素引用，则切换该元素的全屏状态
    if (ref) {
        screenfull.toggle(ref);
    } else {
        // 否则，切换整个文档的全屏状态
        screenfull.toggle();
    }
}

// 导出load模块，以便外部使用
export { load };
