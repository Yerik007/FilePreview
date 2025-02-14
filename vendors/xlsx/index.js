import ExcelJS from "exceljs";
import Vue from "vue";
import Table from "./Table";
import "handsontable/dist/handsontable.full.min.css";

/**
 * 渲染excel
 */
export default async function render(buffer, target) {

  let workbook;
  try {
    workbook = await new ExcelJS.Workbook().xlsx.load(buffer);
  } catch (error) {
    return Promise.reject(new Error('Excel文件加载失败：' + error.message));
  }

  if (!workbook || !workbook.worksheets || !workbook.worksheets.length) {
    return Promise.reject(new Error('Excel文件格式错误或不包含任何工作表'));
  }

  return new Promise((resolve, reject) => {
    const vm = new Vue({
      render: h => h(Table, {
        props: {
          workbook
        }
      }),
      errorCaptured(err, vm, info) {
        reject(err);
        return false; // 防止错误继续传播
      }
    });

    try {
      resolve(vm.$mount(target));
    } catch (error) {
    //   console.log(error);
    //   reject(new Error('Excel渲染失败：' + error.message));
    }
  });
}
