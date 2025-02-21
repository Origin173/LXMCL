use crate::error::{SJMCLError, SJMCLResult};
use crate::instance::models::{LocalModInfo, ModLoaderType};
use crate::utils::image::image_to_base64;
use image::ImageReader;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::File;
use std::io::{Cursor, Read, Seek};
use std::path::PathBuf;
use zip::ZipArchive;

pub fn load_mod_from_file(path: &PathBuf) -> SJMCLResult<LocalModInfo> {
  let file;
  match File::open(&path) {
    Ok(val) => file = val,
    Err(e) => return Err(SJMCLError::from(e)),
  }
  let file_name = path.file_name().unwrap().to_string_lossy().to_string();
  let enabled = !file_name.ends_with(".disabled");
  let mut jar = match ZipArchive::new(file) {
    Ok(val) => val,
    Err(e) => return Err(SJMCLError::from(e)),
  };
  match load_fabric_from_jar(&mut jar) {
    Ok(meta) => {
      return Ok(LocalModInfo {
        icon_src: meta.icon,
        enabled: enabled,
        name: meta.name,
        translated_name: None,
        version: meta.version,
        file_name: file_name,
        description: meta.description,
        potential_incompatibility: false,
        loader_type: ModLoaderType::Fabric,
      })
    }
    Err(_) => {}
  }
  Err(SJMCLError(format!(
    "{} cannot be recognized as known",
    file_name
  )))
}

// Implementations for FabricModMetadata
#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct FabricModMetadata {
  id: String,
  name: String,
  version: String,
  description: String,
  icon: String,
  authors: Vec<String>,
  contact: HashMap<String, String>,
}

pub fn load_fabric_from_jar<R: Read + Seek>(
  jar: &mut ZipArchive<R>,
) -> SJMCLResult<FabricModMetadata> {
  let mut meta: FabricModMetadata = match jar.by_name("fabric.mod.json") {
    Ok(val) => match serde_json::from_reader(val) {
      Ok(val) => val,
      Err(e) => return Err(SJMCLError::from(e)),
    },
    Err(e) => return Err(SJMCLError::from(e)),
  };
  if meta.icon.len() > 0 {
    if let Ok(mut img_file) = jar.by_name(&meta.icon) {
      // Use `image` crate to decode the image
      let mut buffer = Vec::new();
      if let Ok(_) = img_file.read_to_end(&mut buffer) {
        if let Ok(image_reader) = ImageReader::new(Cursor::new(buffer)).with_guessed_format() {
          if let Ok(img) = image_reader.decode() {
            if let Ok(b64) = image_to_base64(img.to_rgba8()) {
              meta.icon = b64;
            }
          }
        }
      }
    }
  }
  Ok(meta)
}

// Implementations for ForgeNewModMetadata
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ForgeNewModMetadata {
  mod_loader: String,
  loader_version: String,
  logo_file: String,
  license: String,
  mods: Vec<ForgeNewModSubItem>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ForgeNewModSubItem {
  mod_id: String,
  version: String,
  display_name: String,
  side: String,
  display_url: String,
  authors: String,
  description: String,
}

pub fn load_fabric_from_forge<R: Read + Seek>(
  mut jar: ZipArchive<R>,
) -> SJMCLResult<FabricModMetadata> {
  todo!()
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ForgeOldModMetadata {
  #[serde(rename = "modid")]
  mod_id: String,
  name: String,
  description: String,
  author: String,
  version: String,
  logo_file: String,
  mcversion: String,
  url: String,
  update_url: String,
  credits: String,
  author_list: Vec<String>,
  authors: Vec<String>,
}

// Implementations for LiteModMetadata
#[derive(Serialize, Deserialize)]
pub struct LiteModMetadata {
  name: String,
  version: String,
  mcversion: String,
  revision: String,
  author: String,
  class_transformer_classes: Vec<String>,
  description: String,
  modpack_name: String,
  modpack_version: String,
  check_update_url: String,
  update_uri: String,
}

// Implementations for QuiltModMetadata
#[derive(Serialize, Deserialize)]
pub struct QuiltModMetadata {
  schema_version: i32,
  quilt_loader: QuiltLoader,
}

#[derive(Serialize, Deserialize)]
pub struct QuiltLoader {
  id: String,
  version: String,
  metadata: Metadata,
}

#[derive(Serialize, Deserialize)]
pub struct Metadata {
  name: String,
  description: String,
  contributors: HashMap<String, String>,
  icon: String,
  contact: HashMap<String, String>,
}
