
export default function download({ fileName = "", file = null } = {}) {
    return new Promise(resolve => {
        // 检查浏览器是否支持<a>标签的download属性
        if ("download" in document.createElement("a")) {
            // 创建一个隐藏的<a>标签用于下载
            const link = document.createElement("a");
            link.download = fileName; // 设置下载文件名
            link.style.display = "none"; // 隐藏<a>标签
            link.href = URL.createObjectURL(file); // 创建文件的URL
            document.body.appendChild(link); // 将<a>标签添加到文档中
            link.click(); // 触发下载
            URL.revokeObjectURL(link.href); // 释放URL对象
            document.body.removeChild(link); // 从文档中移除<a>标签
            resolve(true); // 下载完成，返回成功
        } else {
            // 如果不支持<a>标签的download属性，使用msSaveBlob方法
            navigator.msSaveBlob(file, fileName);
            resolve(true); // 下载完成，返回成功
        }
    });
}
