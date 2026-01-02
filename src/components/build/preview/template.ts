const generateHtmlContent = (apiOrigin: string, escapedCode: string) => {
  const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Preview</title>
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- React & ReactDOM -->
  <script crossorigin src="https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js"></script>
  <script crossorigin src="https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
  
  <!-- Babel Standalone for JSX/TSX transformation -->
  <script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.24.7/babel.min.js"></script>
  
  <!-- Ant Design CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/antd@5.21.6/dist/reset.css">
  <style>
    /* Ant Design 5.x 使用 CSS-in-JS，但需要一些基础样式 */
    :root {
      --ant-primary-color: #1677ff;
      --ant-success-color: #52c41a;
      --ant-warning-color: #faad14;
      --ant-error-color: #ff4d4f;
    }
  </style>
  
  <!-- 不再需要 SystemJS，使用原生动态 import -->
  
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    #root {
      width: 100%;
      min-height: 100vh;
    }
    
    .error-container {
      padding: 16px;
      margin: 16px;
      background-color: #fff1f0;
      border: 1px solid #ffccc7;
      border-radius: 4px;
      color: #cf1322;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="error-container" class="error-container" style="display: none;"></div>

  <script>
    (function() {
      // 标记依赖加载状态
      window.dependenciesLoaded = false;
      window.antdLoaded = false;
      
      // 显示错误信息
      function showError(message, error) {
        const errorContainer = document.getElementById('error-container');
        const root = document.getElementById('root');
        
        if (errorContainer) {
          errorContainer.style.display = 'block';
          let errorMessage = message;
          
          if (error) {
            errorMessage += '\\n\\n' + error.toString();
            if (error.stack) {
              errorMessage += '\\n\\n堆栈跟踪:\\n' + error.stack;
            }
          }
          
          errorContainer.textContent = errorMessage;
        }
        
        if (root) {
          root.innerHTML = '';
        }
        
        console.error('Preview Error:', message, error);
      }
      
      // 等待所有依赖加载完成
      function checkDependencies() {
        if (
          typeof React !== 'undefined' &&
          typeof ReactDOM !== 'undefined' &&
          typeof Babel !== 'undefined'
        ) {
          window.dependenciesLoaded = true;
          loadAntd();
        } else {
          setTimeout(checkDependencies, 100);
        }
      }
      
      // 加载 Ant Design 和 Icons
      function loadAntd() {
        if (window.antdLoaded) {
          executeUserCode();
          return;
        }
        
        // 使用 esm.sh 的 bundle 模式，打包所有依赖（包括 @ant-design/colors 等）
        // 这样就不需要处理依赖解析问题
        const antdUrl = 'https://esm.sh/antd@5.17.3?bundle&external=react,react-dom';
        const iconsUrl = 'https://esm.sh/@ant-design/icons@5.4.0?bundle&external=react';
        
        // 创建 import map 来映射 react 和 react-dom 到全局变量
        if (!window.importMapCreated) {
          const reactModuleCode = \`export default window.React;export const{useState,useEffect,useLayoutEffect,useCallback,useMemo,useRef,useContext,useReducer,useImperativeHandle,createContext,createElement,cloneElement,forwardRef,memo,StrictMode,Fragment,isValidElement,version,Component,PureComponent,Children,createRef}=window.React;\`;
          const reactDomModuleCode = \`export default window.ReactDOM;export const{createRoot,render,createPortal,unstable_batchedUpdates,flushSync}=window.ReactDOM;\`;
          
          const reactModuleBlob = new Blob([reactModuleCode], { type: 'application/javascript' });
          const reactDomModuleBlob = new Blob([reactDomModuleCode], { type: 'application/javascript' });
          const reactModuleUrl = URL.createObjectURL(reactModuleBlob);
          const reactDomModuleUrl = URL.createObjectURL(reactDomModuleBlob);
          
          const importMap = document.createElement('script');
          importMap.type = 'importmap';
          importMap.textContent = JSON.stringify({
            imports: {
              'react': reactModuleUrl,
              'react-dom': reactDomModuleUrl
            }
          });
          document.head.appendChild(importMap);
          
          window.importMapCreated = true;
          
          // 等待 import map 生效
          setTimeout(function() {
            loadAntdModules();
          }, 100);
        } else {
          loadAntdModules();
        }
        
        function loadAntdModules() {
          // 使用 script type="module" 来执行动态 import
          const loadScript = document.createElement('script');
          loadScript.type = 'module';
          loadScript.textContent = \`
            (async function() {
              try {
                const [antdModule, iconsModule] = await Promise.all([
                  import('\${antdUrl}'),
                  import('\${iconsUrl}')
                ]);
                window.antd = antdModule.default || antdModule;
                window.antdIcons = iconsModule;
                window.antdLoaded = true;
                if (window.executeUserCodeCallback) {
                  window.executeUserCodeCallback();
                }
              } catch (error) {
                if (window.showErrorCallback) {
                  window.showErrorCallback('加载 Ant Design 失败', error);
                }
              }
            })();
          \`;
          document.head.appendChild(loadScript);
          
          // 设置回调
          window.executeUserCodeCallback = executeUserCode;
          window.showErrorCallback = showError;
        }
      }
      
      // 执行用户代码
      function executeUserCode() {
        const root = document.getElementById('root');
        const errorContainer = document.getElementById('error-container');
        
        if (!root) {
          showError('无法找到 root 元素');
          return;
        }
        
        // 隐藏之前的错误
        if (errorContainer) {
          errorContainer.style.display = 'none';
        }
        
        try {
          // 用户代码（已经转义）
          const userCode = \`${escapedCode}\`;
          
          // 预处理：移除 import 语句并在执行环境中提供模块
          let codeToTransform = userCode;
          
          // 提取并移除 import 语句，我们会在执行环境中直接提供这些模块
          const importStatements = [];
          
          // 匹配多种 import 格式
          const importPatterns = [
            /^import\\s+\\*\\s+as\\s+([\\w]+)\\s+from\\s+['"]([^'"]+)['"];?$/gm,  // import * as X from 'module'
            /^import\\s+{([^}]+)}\\s+from\\s+['"]([^'"]+)['"];?$/gm,              // import { A, B } from 'module'
            /^import\\s+([\\w]+)\\s+from\\s+['"]([^'"]+)['"];?$/gm                 // import X from 'module'
          ];
          
          importPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(codeToTransform)) !== null) {
              if (match[0].includes('* as')) {
                importStatements.push({
                  type: 'namespace',
                  name: match[1],
                  source: match[2]
                });
              } else if (match[0].includes('{')) {
                importStatements.push({
                  type: 'named',
                  specifiers: match[1],
                  source: match[2]
                });
              } else {
                importStatements.push({
                  type: 'default',
                  name: match[1],
                  source: match[2]
                });
              }
            }
          });
          
          // 移除所有 import 语句（处理各种格式）
          codeToTransform = codeToTransform
            .replace(/^import\\s+\\*\\s+as\\s+[\\w]+\\s+from\\s+['"][^'"]+['"];?\\s*$/gm, '')
            .replace(/^import\\s+{[^}]+}\\s+from\\s+['"][^'"]+['"];?\\s*$/gm, '')
            .replace(/^import\\s+[\\w]+\\s+from\\s+['"][^'"]+['"];?\\s*$/gm, '')
            .replace(/^import\\s+.*?from\\s+['"][^'"]+['"];?\\s*$/gm, '');
          
          // 在转译前预处理 export 语句，避免 Babel 转译后仍有 export
          // 记录需要导出的组件名
          const exportInfo = {
            defaultExport: null,
            namedExports: []
          };
          
          // 提取 export default ComponentName
          const defaultExportMatch = codeToTransform.match(/^export\\s+default\\s+([\\w]+)\\s*;?$/m);
          if (defaultExportMatch) {
            exportInfo.defaultExport = defaultExportMatch[1];
            codeToTransform = codeToTransform.replace(/^export\\s+default\\s+[\\w]+\\s*;?$/m, '');
          }
          
          // 处理 export const/function/class，移除 export 关键字
          codeToTransform = codeToTransform.replace(
            /^export\\s+(const|function|class|let|var)\\s+([A-Z]\\w+)/gm,
            function(match, keyword, name) {
              exportInfo.namedExports.push(name);
              if (exportInfo.defaultExport === null && name) {
                exportInfo.defaultExport = name;
              }
              return keyword + ' ' + name;
            }
          );
          
          // 处理 export { ... }
          codeToTransform = codeToTransform.replace(
            /^export\\s*{\\s*([^}]+)\\s*}\\s*;?$/gm,
            function(match, exports) {
              const items = exports.split(',').map(e => {
                const trimmed = e.trim();
                const parts = trimmed.split(' as ');
                return parts[parts.length - 1].trim();
              });
              exportInfo.namedExports.push(...items);
              if (exportInfo.defaultExport === null && items.length > 0) {
                exportInfo.defaultExport = items[items.length - 1];
              }
              return '';
            }
          );
          
          // 移除剩余的 export 关键字
          codeToTransform = codeToTransform.replace(/^export\\s+/gm, '');
          
          // 转译 JSX/TSX 代码
          let transformedCode;
          try {
            transformedCode = Babel.transform(codeToTransform, {
              filename: 'component.tsx',
              presets: ['react', 'typescript'],
              plugins: []
            }).code;
          } catch (transformError) {
            showError('代码转译失败', transformError);
            return;
          }
          
          // 在转译后的代码末尾添加导出逻辑
          let exportCode = '';
          
          // 查找转译后代码中定义的组件（通常是大写开头的变量/函数/类）
          const definedComponents = [];
          const componentPattern = /(?:const|function|class|let|var)\\s+([A-Z]\\w+)\\s*[=:(]/g;
          let compMatch;
          while ((compMatch = componentPattern.exec(transformedCode)) !== null) {
            definedComponents.push(compMatch[1]);
          }
          
          // 添加默认导出
          const componentToExport = exportInfo.defaultExport || definedComponents[definedComponents.length - 1];
          if (componentToExport && definedComponents.includes(componentToExport)) {
            exportCode += \`module.exports.default = \${componentToExport};\\n\`;
          } else if (componentToExport) {
            exportCode += \`if (typeof \${componentToExport} !== 'undefined') module.exports.default = \${componentToExport};\\n\`;
          }
          
          // 添加命名导出
          exportInfo.namedExports.forEach(name => {
            if (definedComponents.includes(name)) {
              exportCode += \`module.exports.\${name} = \${name};\\n\`;
            }
          });
          
          // 如果没有找到导出信息，导出最后一个定义的组件
          if (!exportCode && definedComponents.length > 0) {
            exportCode += \`module.exports.default = \${definedComponents[definedComponents.length - 1]};\\n\`;
          }
          
          transformedCode += '\\n' + exportCode;
          
          // 创建执行环境
          const React = window.React;
          const ReactDOM = window.ReactDOM;
          // 处理 antd 的默认导出
          const antdModule = window.antd || {};
          const antd = antdModule.default || antdModule;
          const antdIcons = window.antdIcons || {};
          
          // 创建模块环境
          const moduleWrapper = {
            exports: {}
          };
          const exportsWrapper = moduleWrapper.exports;
          
          // 构建 import 变量绑定代码
          let importBindings = '';
          const importMap = {
            'react': 'React',
            'react-dom': 'ReactDOM',
            'antd': 'antd',
            '@ant-design/icons': 'antdIcons'
          };
          
          // Function 参数名列表，这些不需要重新声明
          const functionParams = ['React', 'ReactDOM', 'antd', 'antdIcons'];
          
          importStatements.forEach(imp => {
            const moduleVar = importMap[imp.source] || null;
            if (!moduleVar) return;
            
            if (imp.type === 'namespace') {
              // import * as X from 'module'
              // 如果导入的名称与 Function 参数名相同，跳过声明（因为已经在参数中可用）
              if (!functionParams.includes(imp.name)) {
                importBindings += \`const \${imp.name} = \${moduleVar};\\n\`;
              }
            } else if (imp.type === 'named') {
              // import { A, B } from 'module'
              const specifiers = imp.specifiers.split(',').map(s => s.trim());
              specifiers.forEach(desc => {
                const parts = desc.split(' as ').map(p => p.trim());
                const original = parts[0];
                const alias = parts[1] || original;
                
                // 如果别名与 Function 参数名相同，跳过声明
                if (functionParams.includes(alias)) {
                  return;
                }
                
                if (moduleVar === 'React') {
                  importBindings += \`const \${alias} = React.\${original};\\n\`;
                } else if (moduleVar === 'ReactDOM') {
                  importBindings += \`const \${alias} = ReactDOM.\${original};\\n\`;
                } else if (moduleVar === 'antd') {
                  // antd 可能是默认导出或命名导出
                  importBindings += \`const \${alias} = (antd.default && antd.default.\${original}) || antd.\${original} || (() => null);\\n\`;
                } else if (moduleVar === 'antdIcons') {
                  // @ant-design/icons 通常是命名导出
                  importBindings += \`const \${alias} = antdIcons.\${original} || (() => null);\\n\`;
                }
              });
            } else if (imp.type === 'default') {
              // import X from 'module'
              // 如果导入的名称与 Function 参数名相同，跳过声明
              if (functionParams.includes(imp.name)) {
                return;
              }
              
              if (moduleVar === 'antd') {
                importBindings += \`const \${imp.name} = antd;\\n\`;
              } else {
                importBindings += \`const \${imp.name} = \${moduleVar};\\n\`;
              }
            }
          });
          
          // 包装代码以支持 import 和 export
          // 使用 Function 构造器来创建执行环境
          const executeCodeSource = \`
            const { useState, useEffect, useCallback, useMemo, useRef, useContext, useReducer, createContext } = React;
            
            // 模拟 require 函数
            function require(name) {
              if (name === 'react') return React;
              if (name === 'react-dom') return ReactDOM;
              if (name === 'antd') return antd.default || antd;
              if (name === '@ant-design/icons') return antdIcons;
              throw new Error('Cannot find module: ' + name);
            }
            
            // 注入 import 变量绑定
            \${importBindings}
            
            // 执行转译后的代码
            \${transformedCode}
            
            // 返回默认导出，如果没有则返回整个 exports 对象
            return module.exports.default !== undefined ? module.exports.default : module.exports;
          \`;
          
          const executeCode = new Function(
            'React',
            'ReactDOM',
            'antd',
            'antdIcons',
            'module',
            'exports',
            executeCodeSource
          );
          
          // 执行代码
          let ComponentToRender;
          try {
            ComponentToRender = executeCode(
              React,
              ReactDOM,
              antd,
              antdIcons,
              moduleWrapper,
              exportsWrapper
            );
            
            // 如果没有找到默认导出，尝试从命名导出中查找
            if (!ComponentToRender || (typeof ComponentToRender === 'object' && ComponentToRender !== null && Object.keys(ComponentToRender).length > 0 && !ComponentToRender.$$typeof)) {
              // 检查是否有命名导出的组件
              const exportKeys = Object.keys(exportsWrapper);
              for (let key of exportKeys) {
                const value = exportsWrapper[key];
                if (value && (typeof value === 'function' || (typeof value === 'object' && value !== null && value.$$typeof))) {
                  ComponentToRender = value;
                  break;
                }
              }
              
              // 如果还是找不到，尝试从 module.exports 中查找
              if ((!ComponentToRender || typeof ComponentToRender !== 'function') && moduleWrapper.exports) {
                const moduleExportKeys = Object.keys(moduleWrapper.exports);
                for (let key of moduleExportKeys) {
                  const value = moduleWrapper.exports[key];
                  if (value && (typeof value === 'function' || (typeof value === 'object' && value !== null && value.$$typeof))) {
                    ComponentToRender = value;
                    break;
                  }
                }
              }
            }
          } catch (execError) {
            // 如果模块方式失败，尝试直接执行
            try {
              // 直接执行代码，不依赖模块系统
              const directExecSource = \`
                const { useState, useEffect, useCallback, useMemo, useRef, useContext, useReducer, createContext } = React;
                \${transformedCode}
              \`;
              
              const directExec = new Function(
                'React',
                'ReactDOM',
                'antd',
                'antdIcons',
                directExecSource
              );
              
              directExec(React, ReactDOM, antd, antdIcons);
              
              // 从全局作用域查找最后定义的组件
              const windowKeys = Object.keys(window);
              for (let i = windowKeys.length - 1; i >= 0; i--) {
                const key = windowKeys[i];
                const value = window[key];
                // 检查是否是 React 组件
                if (value && (
                  typeof value === 'function' && 
                  (value.prototype && value.prototype.isReactComponent || value.$$typeof) ||
                  (typeof value === 'object' && value !== null && value.$$typeof)
                )) {
                  ComponentToRender = value;
                  break;
                }
              }
            } catch (directError) {
              throw execError;
            }
          }
          
          // 验证组件
          if (!ComponentToRender) {
            throw new Error('无法找到要渲染的组件。请确保代码中有默认导出的 React 组件（export default ComponentName）。');
          }
          
          // 检查是否是空对象
          if (typeof ComponentToRender === 'object' && ComponentToRender !== null && !ComponentToRender.$$typeof && Object.keys(ComponentToRender).length === 0) {
            throw new Error('无法找到要渲染的组件。请确保代码中有默认导出的 React 组件（export default ComponentName）。');
          }
          
          // 验证组件是否有效（函数组件或类组件）
          if (typeof ComponentToRender !== 'function' && (!ComponentToRender || !ComponentToRender.$$typeof)) {
            throw new Error('导出的内容不是一个有效的 React 组件。期望函数组件或类组件，但得到了: ' + typeof ComponentToRender);
          }
          
          // 渲染组件
          const reactRoot = ReactDOM.createRoot(root);
          reactRoot.render(React.createElement(ComponentToRender));
          
        } catch (error) {
          showError('代码执行失败', error);
        }
      }
      
      // 开始检查依赖
      checkDependencies();
      
      // 设置超时保护
      setTimeout(function() {
        if (!window.dependenciesLoaded) {
          showError('依赖加载超时，请检查网络连接');
        }
      }, 30000);
    })();
  </script>
</body>
</html>`;

  return htmlContent;
};

export default generateHtmlContent;
