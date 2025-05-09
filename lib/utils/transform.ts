/**
 * 用于执行数据转换函数字符串的工具函数
 */

/**
 * 执行数据转换函数
 * @param transformFunctionString 由DataTransform组件生成的转换函数字符串
 * @param data 要转换的数据
 * @returns 转换后的数据
 */
export function executeTransformFunction<T = any, R = any>(
  transformFunctionString: string,
  data: T
): R {
  // 检查是否为空
  if (!transformFunctionString) {
    return data as unknown as R;
  }

  try {
    // 提取函数体
    let functionBody = transformFunctionString;
    const functionPrefix = 'function transformData(data) {';
    const functionSuffix = '}';

    // 如果传入的是完整函数，则提取函数体
    if (functionBody.startsWith(functionPrefix) && functionBody.endsWith(functionSuffix)) {
      functionBody = functionBody
        .substring(functionPrefix.length, functionBody.length - functionSuffix.length)
        .trim();
    }

    // 创建新函数并执行
    const transformFn = new Function('data', functionBody);
    return transformFn(data) as R;
  } catch (error) {
    console.error('执行数据转换函数失败:', error);
    // 发生错误时返回原始数据
    return data as unknown as R;
  }
}

/**
 * 检查数据转换函数字符串的有效性
 * @param transformFunctionString 由DataTransform组件生成的转换函数字符串
 * @returns 是否是有效的转换函数
 */
export function validateTransformFunction(transformFunctionString: string): boolean {
  if (!transformFunctionString) {
    return false;
  }

  try {
    // 提取函数体
    let functionBody = transformFunctionString;
    const functionPrefix = 'function transformData(data) {';
    const functionSuffix = '}';

    // 如果传入的是完整函数，则提取函数体
    if (functionBody.startsWith(functionPrefix) && functionBody.endsWith(functionSuffix)) {
      functionBody = functionBody
        .substring(functionPrefix.length, functionBody.length - functionSuffix.length)
        .trim();
    }

    // 尝试创建函数但不执行，只检查语法
    new Function('data', functionBody);
    return true;
  } catch (error) {
    console.error('数据转换函数无效:', error);
    return false;
  }
}
