use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, PartialEq, Eq, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Player {
  pub name: String,
  pub uuid: Uuid,
  pub avatar_url: String,
  pub server_type: String,
  pub auth_account: String,
  pub password: String,
}
