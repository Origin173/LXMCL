// CAUC登录测试工具 - 用于测试221440114未注册用户
import { invoke } from "@tauri-apps/api/core";

async function testCAUC221440114() {
  console.log("=== 测试CAUC登录: 221440114 ===");

  try {
    // 步骤1: eduroam登录
    console.log("[1] 调用 cauc_eduroam_login...");
    const loginResult = await invoke("cauc_eduroam_login", {
      studentId: "221440114",
      oaPassword: "301215@vbg",
    });

    console.log("登录结果:", loginResult);

    const { requires_bind } = loginResult as { requires_bind: boolean };

    if (requires_bind) {
      console.log("[2] 需要绑定昵称,调用 cauc_bind_player_name...");

      await invoke("cauc_bind_player_name", {
        playerName: "TestUser114",
      });

      console.log("✓ 昵称绑定成功");
    } else {
      console.log("[2] 无需绑定,直接完成认证");
    }

    // 步骤3: 完成认证
    console.log("[3] 调用 cauc_complete_login...");
    const players = await invoke("cauc_complete_login", {
      studentId: "221440114",
      oaPassword: "301215@vbg",
    });

    console.log("✓ 认证成功! 玩家信息:", players);
    return players;
  } catch (error) {
    console.error("✗ 测试失败:", error);
    throw error;
  }
}

// 导出到全局供浏览器控制台使用
if (typeof window !== "undefined") {
  (window as any).testCAUC221440114 = testCAUC221440114;
  console.log("CAUC测试函数已加载,在控制台运行: testCAUC221440114()");
}

export { testCAUC221440114 };
