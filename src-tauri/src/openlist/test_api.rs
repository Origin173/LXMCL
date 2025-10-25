use serde_json::json;
use tauri_plugin_http::reqwest;

/// 测试 OpenList API 连接性
#[tauri::command]
pub async fn test_openlist_connection() -> Result<String, String> {
  let url = "https://shindobaddo.cauc.fun/api/fs/list";
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
