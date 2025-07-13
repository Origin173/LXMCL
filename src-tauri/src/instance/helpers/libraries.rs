// Helper function to construct library path for legacy versions
pub fn construct_legacy_library_path(library_name: &str) -> Option<String> {
  // Library name format: group:name:version
  // Example: "net.minecraft:launchwrapper:1.12"
  // Should become: "net/minecraft/launchwrapper/1.12/launchwrapper-1.12.jar"
  let parts: Vec<&str> = library_name.split(':').collect();
  if parts.len() >= 3 {
    let group = parts[0].replace('.', "/");
    let name = parts[1];
    let version = parts[2];
    Some(format!(
      "{}/{}/{}/{}-{}.jar",
      group, name, version, name, version
    ))
  } else {
    None
  }
}
