use serde::{Deserialize, Serialize};

#[derive(Debug, PartialEq, Eq, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Player {
  pub name: String,
  pub uuid: String,
  pub avatar_url: String,
  pub server_type: String,
  #[serde(default)]
  pub auth_account: String,
  #[serde(default)]
  pub password: String,
  #[serde(default)]
  pub auth_server: AuthServer,
}

#[derive(Debug, PartialEq, Eq, Clone, Deserialize, Serialize, Default)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct AuthServer {
  pub name: String,
  pub auth_url: String,
}
