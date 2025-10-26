/**
 * OpenList 下载站主页面
 * 使用原生 Chakra UI 组件 + OpenList API
 */
import {
  Box,
  Button,
  Grid,
  GridItem,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { invoke } from "@tauri-apps/api/core";
import React, { useCallback, useEffect, useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import { Section } from "@/components/common/section";
import { ModpackDetail } from "@/components/openlist/modpack-detail";
import { ModpackList } from "@/components/openlist/modpack-list";
import { useLauncherConfig } from "@/contexts/config";
import { useSharedModals } from "@/contexts/shared-modal";
import type { FsObject } from "@/types/openlist";

export default function OpenListPage() {
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [items, setItems] = useState<FsObject[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<FsObject | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDetailPanel, setShowDetailPanel] = useState<boolean>(false);

  const toast = useToast();
  const { openSharedModal } = useSharedModals();
  const { config } = useLauncherConfig();
  const primaryColor = config.appearance.theme.primaryColor;

  /**
   * 加载目录内容
   */
  const loadDirectory = useCallback(
    async (path: string) => {
      console.log(`[loadDirectory] Starting to load: ${path}`);
      setLoading(true);
      try {
        console.log(`[loadDirectory] Calling API browse...`);
        const response = await invoke<any>("openlist_browse", {
          request: {
            path: path || "/",
            page: 1,
            perPage: 100,
          },
        });
        console.log(`[loadDirectory] API Response:`, response);
        console.log(`[loadDirectory] Response code: ${response.code}`);
        console.log(
          `[loadDirectory] Response data:`,
          response.data ? response.data.content : "no data"
        );

        if (response.code === 200 && response.data) {
          const items = response.data.content || [];
          console.log(`[loadDirectory] Setting items (count: ${items.length})`);
          if (items.length > 0) {
            console.log(
              `[loadDirectory] First item example:`,
              JSON.stringify(items[0], null, 2)
            );
          } else {
            console.log(`[loadDirectory] Directory is empty`);
          }
          setItems(items);
          setCurrentPath(path);
          console.log(`[loadDirectory] Successfully loaded: ${path}`);
        } else {
          console.error(`[loadDirectory] API returned non-200 code or no data`);
          toast({
            title: "加载失败",
            description: response.message || "无法加载目录内容",
            status: "error",
            duration: 3000,
          });
        }
      } catch (error) {
        console.error("[loadDirectory] Error caught:", error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        toast({
          title: "加载失败",
          description: `网络错误: ${errorMessage}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
        console.log(`[loadDirectory] Finished loading`);
      }
    },
    [toast]
  );

  /**
   * 查看详情
   */
  const handleViewDetails = useCallback((item: FsObject) => {
    setSelectedItem(item);
    setShowDetailPanel(true);
  }, []);

  /**
   * 选择项目 - 如果是文件夹直接进入
   */
  const handleSelectItem = useCallback(
    async (item: FsObject) => {
      console.log(`[handleSelectItem] ========== ITEM CLICKED ==========`);
      console.log(
        `[handleSelectItem] Full item object:`,
        JSON.stringify(item, null, 2)
      );
      console.log(`[handleSelectItem] Item name: ${item.name}`);
      console.log(`[handleSelectItem] Item path (system path): ${item.path}`);
      console.log(`[handleSelectItem] Is directory: ${item.is_dir}`);

      if (item.is_dir) {
        const newPath =
          currentPath === "/" ? `/${item.name}` : `${currentPath}/${item.name}`;

        console.log(
          `[handleSelectItem] ========== ENTERING DIRECTORY ==========`
        );
        console.log(`[handleSelectItem] Current path: ${currentPath}`);
        console.log(`[handleSelectItem] Item name: ${item.name}`);
        console.log(`[handleSelectItem] Constructed new path: ${newPath}`);
        console.log(
          `[handleSelectItem] Calling loadDirectory with: "${newPath}"`
        );
        await loadDirectory(newPath);
        console.log(
          `[handleSelectItem] ========== NAVIGATION COMPLETE ==========`
        );
        return;
      }

      console.log(`[handleSelectItem] File clicked, no action`);
    },
    [loadDirectory, currentPath]
  );

  /**
   * 浏览目录（已废弃，保留向后兼容）
   */
  const handleBrowseDirectory = useCallback(() => {
    if (selectedItem && selectedItem.is_dir) {
      loadDirectory(selectedItem.path);
      setSelectedItem(null);
    }
  }, [selectedItem, loadDirectory]);

  /**
   * 返回上级目录
   */
  const handleGoUp = useCallback(() => {
    if (currentPath === "/") return;
    const parentPath = currentPath.split("/").slice(0, -1).join("/") || "/";
    loadDirectory(parentPath);
    setSelectedItem(null);
  }, [currentPath, loadDirectory]);

  /**
   * 跳转到指定路径
   */
  const handleNavigateTo = useCallback(
    (path: string) => {
      loadDirectory(path);
      setSelectedItem(null);
    },
    [loadDirectory]
  );

  /**
   * 搜索
   */
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        loadDirectory(currentPath);
        return;
      }

      setLoading(true);
      try {
        const response = await invoke<any>("openlist_browse", {
          request: {
            path: currentPath || "/",
            page: 1,
            perPage: 100,
          },
        });

        if (response.code === 200 && response.data) {
          const filtered = response.data.content.filter((item: any) =>
            item.name.toLowerCase().includes(query.toLowerCase())
          );
          setItems(filtered);
        } else {
          setItems([]);
        }
      } catch (error) {
        console.error("Search failed:", error);
        toast({
          title: "搜索失败",
          description: "无法执行搜索",
          status: "error",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    },
    [currentPath, loadDirectory, toast]
  );

  /**
   * 下载并安装整合包（使用任务系统）
   */
  const handleDownload = useCallback(
    async (item: FsObject) => {
      if (!item) return;

      const fullFilePath =
        currentPath === "/" ? `/${item.name}` : `${currentPath}/${item.name}`;

      console.log("[handleDownload] Starting download");
      console.log("  - File name:", item.name);
      console.log("  - Full path:", fullFilePath);
      console.log("  - Sign:", item.sign);
      console.log("  - Size:", item.size);

      try {
        const response = await invoke<string>("openlist_download_modpack", {
          fileName: item.name,
          filePath: fullFilePath,
          sign: item.sign || "",
          size: item.size,
        });

        console.log("[handleDownload] Download response:", response);

        // 解析返回的 JSON（包含 path 和 taskGroupPrefix）
        const result = JSON.parse(response);
        const downloadedPath = result.path;
        const taskGroupPrefix = result.taskGroupPrefix;

        console.log(
          "[handleDownload] Download task created:",
          "path=",
          downloadedPath,
          "taskGroupPrefix=",
          taskGroupPrefix
        );

        // 如果文件已存在(taskGroupPrefix 为 null),直接打开导入向导
        if (taskGroupPrefix === null) {
          console.log(
            "[handleDownload] File already exists, opening import wizard directly"
          );
          openSharedModal("import-modpack", {
            path: downloadedPath,
          });
          toast({
            title: "文件已存在",
            description: "已为您打开导入向导",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: "下载已开始",
            description: "文件正在后台下载,下载完成后将自动打开导入向导",
            status: "info",
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error("[handleDownload] Download failed:", error);

        toast({
          title: "下载失败",
          description: String(error),
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [currentPath, toast, openSharedModal]
  );

  /**
   * 测试 API 连接
   */
  const testConnection = useCallback(async () => {
    try {
      console.log("Testing API connection...");
      const result = await invoke<string>("test_openlist_connection");
      console.log("Test result:", result);
      toast({
        title: "连接测试成功",
        description: result,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Connection test failed:", error);
      toast({
        title: "连接测试失败",
        description: String(error),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  /**
   * 初始加载
   */
  useEffect(() => {
    loadDirectory("/");
  }, [loadDirectory]);

  /**
   * 生成面包屑路径
   */
  const breadcrumbPaths = React.useMemo(() => {
    const parts = currentPath.split("/").filter(Boolean);
    const paths: Array<{ name: string; path: string }> = [
      { name: "主页", path: "/" },
    ];

    let accumulatedPath = "";
    parts.forEach((part) => {
      accumulatedPath += `/${part}`;
      paths.push({ name: part, path: accumulatedPath });
    });

    return paths;
  }, [currentPath]);

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* 标题和返回按钮 */}
        <Section
          title="CAUCraft 下载站"
          description="浏览和下载 Minecraft 整合包"
          headExtra={
            currentPath !== "/" ? (
              <Button
                onClick={handleGoUp}
                variant="outline"
                colorScheme={primaryColor}
                leftIcon={<FiChevronLeft />}
                size="sm"
              >
                返回上级
              </Button>
            ) : undefined
          }
        />

        {/* 主内容区域 */}
        <Grid templateColumns="repeat(12, 1fr)" gap={6}>
          {/* 文件列表 */}
          <GridItem colSpan={showDetailPanel && selectedItem ? 7 : 12}>
            <Section title={currentPath === "/" ? "文件列表" : currentPath}>
              <ModpackList
                items={items}
                loading={loading}
                selectedItem={selectedItem}
                onSelect={handleSelectItem}
                onDownload={handleDownload}
                onViewDetails={handleViewDetails}
                primaryColor={primaryColor}
              />
            </Section>
          </GridItem>

          {/* 文件详情 */}
          {showDetailPanel && selectedItem && (
            <GridItem colSpan={5}>
              <ModpackDetail
                item={selectedItem}
                onDownload={handleDownload}
                onBrowse={handleBrowseDirectory}
                primaryColor={primaryColor}
              />
            </GridItem>
          )}
        </Grid>
      </VStack>
    </Box>
  );
}
