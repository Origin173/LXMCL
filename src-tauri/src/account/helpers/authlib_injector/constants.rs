pub static PRESET_AUTH_SERVERS: [&str; 2] =
  ["https://skin.mc.sjtu.cn", "https://skin.mualliance.ltd"];
pub static CLIENT_IDS: [(&str, &str); 2] = [("skin.mc.sjtu.cn", "6"), ("littleskin.cn", "1014")];
pub static SCOPE: &str =
  "openid offline_access Yggdrasil.PlayerProfiles.Select Yggdrasil.Server.Join";
pub static AUTHLIB_INJECTOR_JAR_NAME: &str = "authlib-injector.jar";
