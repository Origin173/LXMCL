/**
 * OpenList API 客户端服务
 * 提供与 OpenList API 的所有交互接口
 *
 * 通过 Rust 后端代理所有请求以避免 CORS 和 HTTP 插件问题
 */
import { invoke } from "@tauri-apps/api/core";
import type { FsListRequest, FsListResponse, FsObject } from "@/types/openlist";

// OpenList 服务器地址（从环境变量读取）
const OPENLIST_BASE_URL =
  process.env.NEXT_PUBLIC_OPENLIST_BASE_URL || "https://shindobaddo.cauc.fun";

/**
 * OpenList API 客户端类
 */
export class OpenListAPI {
  /**
   * 列出目录内容（通过 Rust 后端代理）
   */
  async list(request: FsListRequest): Promise<FsListResponse> {
    console.log("[OpenList API] Calling Rust backend:", request);

    try {
      const response = await invoke<FsListResponse>("openlist_browse", {
        request: {
          path: request.path || "/",
          page: request.page || 1,
          perPage: request.per_page || 100,
        },
      });

      console.log("[OpenList API] Rust backend response:", response);
      console.log(
        "[OpenList API] Items count:",
        response.data?.content?.length || 0
      );

      return response;
    } catch (error) {
      console.error("[OpenList API] Rust backend call failed:", error);
      throw new Error(`OpenList API 调用失败: ${error}`);
    }
  }

  /**
   * 浏览指定路径(简化版)
   * @param path 路径
   * @param page 页码
   * @param perPage 每页数量
   * @returns 目录内容
   */
  async browse(
    path: string = "/",
    page: number = 1,
    perPage: number = 100
  ): Promise<FsListResponse> {
    return this.list({
      path,
      page,
      per_page: perPage,
    });
  }

  /**
   * 搜索文件/文件夹
   * @param basePath 搜索的基础路径
   * @param query 搜索关键词
   * @returns 搜索结果(FsObject 数组)
   */
  async search(basePath: string, query: string): Promise<FsObject[]> {
    console.log(`[OpenList API] Searching in ${basePath} for: ${query}`);

    try {
      // 获取当前路径的所有内容
      const response = await this.browse(basePath);

      if (response.code !== 200 || !response.data) {
        console.error("[OpenList API] Search failed: invalid response");
        return [];
      }

      // 在前端进行简单的名称过滤
      const filtered = response.data.content.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );

      console.log(
        `[OpenList API] Search found ${filtered.length} items matching "${query}"`
      );
      return filtered;
    } catch (error) {
      console.error("[OpenList API] Search error:", error);
      throw error;
    }
  }

  /**
   * 下载文件到临时目录（支持断点续传）
   * @param fileName 文件名
   * @param filePath 文件的完整相对路径（如 "/周目模组服/xxx.zip"）
   * @param sign 下载签名
   * @param size 文件大小
   * @returns 下载后的本地文件路径
   */
  async downloadFile(
    fileName: string,
    filePath: string,
    sign: string,
    size: number
  ): Promise<string> {
    console.log(`[OpenList API] Downloading file:`);
    console.log(`  - Name: ${fileName}`);
    console.log(`  - Path: ${filePath}`);
    console.log(`  - Sign: ${sign}`);
    console.log(`  - Size: ${size}`);

    try {
      const downloadedPath = await invoke<string>("openlist_download_modpack", {
        fileName,
        filePath,
        sign,
        size,
      });

      console.log(`[OpenList API] File downloaded to: ${downloadedPath}`);
      return downloadedPath;
    } catch (error) {
      console.error("[OpenList API] Download failed:", error);
      throw new Error(`下载失败: ${error}`);
    }
  }

  /**
   * 暂停下载
   * @param filePath 文件路径
   */
  async pauseDownload(filePath: string): Promise<void> {
    console.log(`[OpenList API] Pausing download: ${filePath}`);
    await invoke("openlist_pause_download", { filePath });
  }

  /**
   * 恢复下载
   * @param filePath 文件路径
   */
  async resumeDownload(filePath: string): Promise<void> {
    console.log(`[OpenList API] Resuming download: ${filePath}`);
    await invoke("openlist_resume_download", { filePath });
  }

  /**
   * 取消下载
   * @param filePath 文件路径
   */
  async cancelDownload(filePath: string): Promise<void> {
    console.log(`[OpenList API] Cancelling download: ${filePath}`);
    await invoke("openlist_cancel_download", { filePath });
  }

  /**
   * 获取下载状态
   * @param filePath 文件路径
   */
  async getDownloadStatus(filePath: string): Promise<any> {
    return await invoke("openlist_get_download_status", { filePath });
  }

  /**
   * 添加离线下载任务
   * 使用服务器端离线下载功能，适合大文件或网络不稳定的情况
   * @param filePath 文件的完整相对路径（如 "/周目模组服/xxx.zip"）
   * @param sign 下载签名
   * @param destinationPath 目标保存路径（服务器上的路径，如 "/downloads"）
   * @returns API响应
   */
  async addOfflineDownload(
    filePath: string,
    sign: string,
    destinationPath: string = "/downloads"
  ): Promise<{ code: number; message: string; data?: any }> {
    console.log(`[OpenList API] Adding offline download task:`);
    console.log(`  - File Path: ${filePath}`);
    console.log(`  - Sign: ${sign}`);
    console.log(`  - Destination: ${destinationPath}`);

    // 构建下载 URL
    const downloadUrl = sign
      ? `${OPENLIST_BASE_URL}/d${filePath}?sign=${sign}`
      : `${OPENLIST_BASE_URL}/d${filePath}`;

    console.log(`  - Download URL: ${downloadUrl}`);

    try {
      const response = await invoke<{
        code: number;
        message: string;
        data?: any;
      }>("openlist_add_offline_download", {
        path: destinationPath,
        urls: [downloadUrl],
        tool: "aria2", // 使用 aria2 作为默认下载工具
      });

      console.log(`[OpenList API] Offline download task created:`, response);
      return response;
    } catch (error) {
      console.error("[OpenList API] Failed to create offline download:", error);
      throw new Error(`创建离线下载任务失败: ${error}`);
    }
  }
}

// 导出单例实例
export const openlistAPI = new OpenListAPI();

// 导出默认实例
export default openlistAPI;
