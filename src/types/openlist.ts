/**
 * OpenList API 类型定义
 * 基于 OpenList API 文档: https://fox.oplist.org.cn/364155732e0.md
 */

/**
 * 文件类型枚举
 */
export enum FileType {
  Unknown = 0,
  Folder = 1,
  Video = 2,
  Audio = 3,
  Text = 4,
  Image = 5,
}

/**
 * 存储详情
 */
export interface StorageDetails {
  /** 存储驱动名称 */
  driver_name: string;
  /** 总存储空间（字节） */
  total_space: number;
  /** 可用存储空间（字节） */
  free_space: number;
}

/**
 * 文件/目录对象
 */
export interface FsObject {
  /** 对象 ID（本地存储可能为空） */
  id: string;
  /** 完整系统路径 */
  path: string;
  /** 文件或目录名称 */
  name: string;
  /** 文件大小（字节），目录为 0 */
  size: number;
  /** 是否为目录 */
  is_dir: boolean;
  /** 最后修改时间 */
  modified: string;
  /** 创建时间 */
  created: string;
  /** 下载认证签名 */
  sign: string;
  /** 缩略图 URL（如果可用） */
  thumb: string;
  /** 文件类型 */
  type: FileType;
  /** 哈希信息（JSON 字符串或 "null"） */
  hashinfo: string;
  /** 解析后的哈希信息 */
  hash_info: Record<string, string> | null;
  /** 挂载详情 */
  mount_details: StorageDetails | null;
}

/**
 * API 响应基础结构
 */
export interface ApiResponse<T = any> {
  /** HTTP 状态码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data: T;
}

/**
 * 错误响应
 */
export interface ErrorResponse {
  /** 错误代码 */
  code: number;
  /** 错误消息 */
  message: string;
  /** 错误详情数据 */
  data: any | null;
}

/**
 * 列表请求参数
 */
export interface FsListRequest {
  /** 要列出的路径 */
  path: string;
  /** 受保护路径的密码 */
  password?: string;
  /** 强制刷新缓存 */
  refresh?: boolean;
  /** 页码（从 1 开始） */
  page?: number;
  /** 每页数量（1-100） */
  per_page?: number;
}

/**
 * 列表响应数据
 */
export interface FsListData {
  /** 文件/目录列表 */
  content: FsObject[];
  /** 总项目数 */
  total: number;
  /** README 内容（如果存在） */
  readme: string;
  /** 头部内容 */
  header: string;
  /** 当前用户是否有写权限 */
  write: boolean;
  /** 存储提供商名称 */
  provider: string;
}

/**
 * 列表响应
 */
export type FsListResponse = ApiResponse<FsListData>;

/**
 * 获取文件信息请求参数
 */
export interface FsGetRequest {
  /** 文件/目录路径 */
  path: string;
  /** 受保护路径的密码 */
  password?: string;
  /** 强制刷新缓存 */
  refresh?: boolean;
}

/**
 * 获取文件信息响应
 */
export type FsGetResponse = ApiResponse<FsObject>;

/**
 * 整合包元数据(从后端解析)
 */
export interface ModpackMetadata {
  /** 整合包名称 */
  name: string;
  /** 版本 */
  version: string;
  /** 描述 */
  description?: string;
  /** 作者 */
  author?: string;
  /** 整合包来源 */
  modpackSource: string;
  /** 客户端版本(Minecraft 版本) */
  clientVersion: string;
  /** Mod Loader 信息 */
  modLoader: {
    /** Loader 类型 */
    loaderType: string;
    /** Loader 版本 */
    version: string;
    /** 状态 */
    status?: string;
    /** 分支 */
    branch?: string;
  };
}
