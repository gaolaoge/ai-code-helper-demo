// 声明 .txt 文件模块类型，允许将 .txt 文件作为字符串导入
declare module "*.txt" {
  const content: string;
  export default content;
}

