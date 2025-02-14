// 定义浏览器全屏API的不同实现方法映射
const methodMap = [
    // 标准方法
    [
        "requestFullscreen",
        "exitFullscreen",
        "fullscreenElement",
        "fullscreenEnabled",
        "fullscreenchange",
        "fullscreenerror"
    ],
    // 新版WebKit方法
    [
        "webkitRequestFullscreen",
        "webkitExitFullscreen",
        "webkitFullscreenElement",
        "webkitFullscreenEnabled",
        "webkitfullscreenchange",
        "webkitfullscreenerror"
    ],
    // 旧版WebKit方法
    [
        "webkitRequestFullScreen",
        "webkitCancelFullScreen",
        "webkitCurrentFullScreenElement",
        "webkitCancelFullScreen",
        "webkitfullscreenchange",
        "webkitfullscreenerror"
    ],
    // Firefox方法
    [
        "mozRequestFullScreen",
        "mozCancelFullScreen",
        "mozFullScreenElement",
        "mozFullScreenEnabled",
        "mozfullscreenchange",
        "mozfullscreenerror"
    ],
    // IE方法
    [
        "msRequestFullscreen",
        "msExitFullscreen",
        "msFullscreenElement",
        "msFullscreenEnabled",
        "MSFullscreenChange",
        "MSFullscreenError"
    ]
];

// 检测并返回当前浏览器支持的全屏API
const nativeAPI = (() => {
    if (typeof document === "undefined") {
        return false;
    }

    const unprefixedMethods = methodMap[0];
    const returnValue = {};

    for (const methodList of methodMap) {
        const exitFullscreenMethod = methodList?.[1];
        if (exitFullscreenMethod in document) {
            methodList.forEach((method, index) => {
                returnValue[unprefixedMethods[index]] = method;
            });
            return returnValue;
        }
    }

    return false;
})();

// 事件名称映射
const eventNameMap = {
    change: nativeAPI.fullscreenchange,
    error: nativeAPI.fullscreenerror
};

// 定义screenfull对象，提供全屏操作的接口
let screenfull = {
    // 请求全屏
    request(element = document.documentElement, options) {
        return new Promise((resolve, reject) => {
            const onFullScreenEntered = () => {
                screenfull.off("change", onFullScreenEntered);
                resolve();
            };

            screenfull.on("change", onFullScreenEntered);

            const returnPromise = element[nativeAPI.requestFullscreen](options);

            if (returnPromise instanceof Promise) {
                returnPromise.then(onFullScreenEntered).catch(reject);
            }
        });
    },
    // 退出全屏
    exit() {
        return new Promise((resolve, reject) => {
            if (!screenfull.isFullscreen) {
                resolve();
                return;
            }

            const onFullScreenExit = () => {
                screenfull.off("change", onFullScreenExit);
                resolve();
            };

            screenfull.on("change", onFullScreenExit);

            const returnPromise = document[nativeAPI.exitFullscreen]();

            if (returnPromise instanceof Promise) {
                returnPromise.then(onFullScreenExit).catch(reject);
            }
        });
    },
    // 切换全屏状态
    toggle(element, options) {
        return screenfull.isFullscreen ? screenfull.exit() : screenfull.request(element, options);
    },
    // 绑定全屏变化事件
    onchange(callback) {
        screenfull.on("change", callback);
    },
    // 绑定全屏错误事件
    onerror(callback) {
        screenfull.on("error", callback);
    },
    // 绑定事件
    on(event, callback) {
        const eventName = eventNameMap[event];
        if (eventName) {
            document.addEventListener(eventName, callback, false);
        }
    },
    // 解绑事件
    off(event, callback) {
        const eventName = eventNameMap[event];
        if (eventName) {
            document.removeEventListener(eventName, callback, false);
        }
    },
    // 原生API
    raw: nativeAPI
};

// 定义screenfull的属性
Object.defineProperties(screenfull, {
    isFullscreen: {
        get: () => Boolean(document[nativeAPI.fullscreenElement])
    },
    element: {
        enumerable: true,
        get: () => document[nativeAPI.fullscreenElement] ?? undefined
    },
    isEnabled: {
        enumerable: true,
        get: () => Boolean(document[nativeAPI.fullscreenEnabled])
    }
});

// 如果不支持全屏API，设置screenfull为不可用
if (!nativeAPI) {
    screenfull = { isEnabled: false };
}

export default screenfull;
