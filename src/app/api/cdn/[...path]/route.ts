import { NextRequest, NextResponse } from "next/server";

/**
 * CDN 代理路由
 * 用于代理外部 CDN 资源，避免 CORS 问题
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    // 从 URL 中提取路径（更可靠的方式）
    const url = new URL(request.url);
    const pathMatch = url.pathname.match(/^\/api\/cdn\/(.+)$/);
    
    let path: string;
    
    if (pathMatch && pathMatch[1]) {
      // 从 URL 直接提取路径
      // 尝试解码，如果失败则使用原始路径
      try {
        path = decodeURIComponent(pathMatch[1]);
      } catch (e) {
        // 如果解码失败，使用原始路径
        path = pathMatch[1];
      }
    } else {
      // 备用方案：从 params 获取
      try {
        const resolvedParams = await context.params;
        const pathArray = resolvedParams.path || [];
        // 对每个路径段进行解码
        path = pathArray.map(segment => {
          try {
            return decodeURIComponent(segment);
          } catch (e) {
            return segment;
          }
        }).join("/");
      } catch (e) {
        return new NextResponse("无法解析路径参数", { 
          status: 400,
          headers: { "Content-Type": "text/plain" },
        });
      }
    }
    
    console.log("CDN 代理请求路径:", path);
    console.log("请求 URL:", url.pathname);
    
    if (!path) {
      return new NextResponse("路径参数缺失", { 
        status: 400,
        headers: { "Content-Type": "text/plain" },
      });
    }
    
    // 支持的 CDN 源
    const cdnSources = [
      `https://unpkg.com/${path}`,
      `https://cdn.jsdelivr.net/npm/${path}`,
    ];
    
    console.log("尝试的 CDN 源:", cdnSources);
    
    // 尝试从各个 CDN 源获取资源
    const errors: string[] = [];
    for (const cdnUrl of cdnSources) {
      try {
        // 创建超时控制器
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 秒超时
        
        console.log(`尝试从 CDN 加载: ${cdnUrl}`);
        const response = await fetch(cdnUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const content = await response.text();
          
          // 检查内容是否有效
          if (!content || content.trim().length === 0) {
            const errorMsg = `CDN 源 ${cdnUrl} 返回空内容`;
            console.warn(errorMsg);
            errors.push(errorMsg);
            continue;
          }
          
          // 检查是否是错误页面（HTML 响应）
          if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) {
            const errorMsg = `CDN 源 ${cdnUrl} 返回 HTML 而不是 JavaScript（可能是 404 页面）`;
            console.warn(errorMsg);
            errors.push(errorMsg);
            continue;
          }
          
          const contentType = response.headers.get("content-type") || "application/javascript";
          
          console.log(`成功从 CDN 加载: ${cdnUrl}, 内容长度: ${content.length}, 类型: ${contentType}`);
          
          return new NextResponse(content, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET",
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        } else {
          const errorMsg = `CDN 源 ${cdnUrl} 返回状态码: ${response.status} ${response.statusText}`;
          console.warn(errorMsg);
          errors.push(errorMsg);
          
          // 尝试读取错误响应体
          try {
            const errorBody = await response.text();
            if (errorBody) {
              console.warn(`错误响应体: ${errorBody.substring(0, 200)}`);
            }
          } catch (e) {
            // 忽略读取错误体的错误
          }
        }
      } catch (error: any) {
        // 继续尝试下一个 CDN 源
        if (error.name !== "AbortError") {
          const errorMsg = `CDN 源 ${cdnUrl} 加载失败: ${error.message || String(error)}`;
          console.warn(errorMsg);
          errors.push(errorMsg);
        } else {
          const errorMsg = `CDN 源 ${cdnUrl} 请求超时（15秒）`;
          console.warn(errorMsg);
          errors.push(errorMsg);
        }
      }
    }
    
    // 返回详细的错误信息
    const errorMessage = `资源未找到\n路径: ${path}\n尝试的 CDN 源:\n${cdnSources.map((url, i) => `${i + 1}. ${url}`).join('\n')}\n\n错误详情:\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`;
    
    console.error("所有 CDN 源都失败:", errorMessage);
    
    return new NextResponse(errorMessage, { 
      status: 404,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error: any) {
    console.error("CDN 代理错误:", error);
    return new NextResponse(`服务器错误: ${error.message}`, { 
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}

