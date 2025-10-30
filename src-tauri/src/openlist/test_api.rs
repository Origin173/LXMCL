use serde_json::json;
use tauri_plugin_http::reqwest;

/// OpenList 服务器地址（从环境变量读取）
const OPENLIST_BASE_URL: &str = env!("LXMCL_OPENLIST_BASE_URL");

/// 测试 OpenList API 连接性
#[tauri::command]
pub async fn test_openlist_connection() -> Result<String, String> {
  let url = format!("{}/api/fs/list", OPENLIST_BASE_URL);
  let client = reqwest::Client::new();

  let body = json!({
    "path": "/",
    "page": 1,
    "per_page": 20
  });

  match client
    .post(url)
    .header("Content-Type", "application/json")
    .json(&body)
    .send()
    .await
  {
    Ok(response) => {
      let status = response.status();
      let text = response
        .text()
        .await
        .unwrap_or_else(|_| "Failed to read body".to_string());
      Ok(format!("Status: {}\nBody: {}", status, text))
    }
    Err(e) => Err(format!("Request failed: {}", e)),
  }
}
