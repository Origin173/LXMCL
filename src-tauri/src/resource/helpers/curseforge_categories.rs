use lazy_static::lazy_static;
use std::collections::HashMap;

lazy_static! {
  static ref CATEGORY_MAP: HashMap<(String, u32), u32> = {
    let mut map = HashMap::new();

    // mods
    map.insert(("Food".to_string(), 6), 436);
    map.insert(("Ores and Resources".to_string(), 6), 408);
    map.insert(("Miscellaneous".to_string(), 6), 425);
    map.insert(("Thermal Expansion".to_string(), 6), 427);
    map.insert(("Cosmetic".to_string(), 6), 424);
    map.insert(("Education".to_string(), 6), 5299);
    map.insert(("Buildcraft".to_string(), 6), 432);
    map.insert(("Processing".to_string(), 6), 413);
    map.insert(("Map and Information".to_string(), 6), 423);
    map.insert(("Tinker's Construct".to_string(), 6), 428);
    map.insert(("Industrial Craft".to_string(), 6), 429);
    map.insert(("Technology".to_string(), 6), 412);
    map.insert(("Farming".to_string(), 6), 416);
    map.insert(("Structures".to_string(), 6), 409);
    map.insert(("Genetics".to_string(), 6), 418);
    map.insert(("Magic".to_string(), 6), 419);
    map.insert(("Addons".to_string(), 6), 426);
    map.insert(("Dimensions".to_string(), 6), 410);
    map.insert(("Mobs".to_string(), 6), 411);
    map.insert(("Armor, Tools, and Weapons".to_string(), 6), 434);
    map.insert(("Server Utility".to_string(), 6), 435);
    map.insert(("Energy, Fluid, and Item Transport".to_string(), 6), 415);
    map.insert(("World Gen".to_string(), 6), 406);
    map.insert(("Player Transport".to_string(), 6), 414);
    map.insert(("Forestry".to_string(), 6), 433);
    map.insert(("Applied Energistics 2".to_string(), 6), 4545);
    map.insert(("Energy".to_string(), 6), 417);
    map.insert(("Adventure and RPG".to_string(), 6), 422);
    map.insert(("Storage".to_string(), 6), 420);
    map.insert(("Biomes".to_string(), 6), 407);
    map.insert(("Redstone".to_string(), 6), 4558);
    map.insert(("Thaumcraft".to_string(), 6), 430);
    map.insert(("Blood Magic".to_string(), 6), 4485);
    map.insert(("API and Library".to_string(), 6), 421);
    map.insert(("Twitch Integration".to_string(), 6), 4671);
    map.insert(("Automation".to_string(), 6), 4843);
    map.insert(("CraftTweaker".to_string(), 6), 4773);
    map.insert(("MCreator".to_string(), 6), 4906);
    map.insert(("KubeJS".to_string(), 6), 5314);
    map.insert(("Utility & QoL".to_string(), 6), 5191);
    map.insert(("Galacticraft".to_string(), 6), 5232);
    map.insert(("Skyblock".to_string(), 6), 6145);
    map.insert(("Create".to_string(), 6), 6484);
    map.insert(("Integrated Dynamics".to_string(), 6), 6954);
    map.insert(("Performance".to_string(), 6), 6814);
    map.insert(("Bug Fixes".to_string(), 6), 6821);
    map.insert(("Twilight Forest".to_string(), 6), 7669);

    // resource packs
    map.insert(("Photo Realistic".to_string(), 12), 400);
    map.insert(("Steampunk".to_string(), 12), 399);
    map.insert(("Traditional".to_string(), 12), 403);
    map.insert(("512x and Higher".to_string(), 12), 398);
    map.insert(("128x".to_string(), 12), 396);
    map.insert(("256x".to_string(), 12), 397);
    map.insert(("64x".to_string(), 12), 395);
    map.insert(("Medieval".to_string(), 12), 402);
    map.insert(("Miscellaneous".to_string(), 12), 405);
    map.insert(("32x".to_string(), 12), 394);
    map.insert(("16x".to_string(), 12), 393);
    map.insert(("Animated".to_string(), 12), 404);
    map.insert(("Modern".to_string(), 12), 401);
    map.insert(("Mod Support".to_string(), 12), 4465);
    map.insert(("Data Packs".to_string(), 12), 5193);
    map.insert(("Font Packs".to_string(), 12), 5244);

    // worlds
    map.insert(("Parkour".to_string(), 17), 251);
    map.insert(("Survival".to_string(), 17), 253);
    map.insert(("Creation".to_string(), 17), 249);
    map.insert(("Game Map".to_string(), 17), 250);
    map.insert(("Adventure".to_string(), 17), 248);
    map.insert(("Modded World".to_string(), 17), 4464);
    map.insert(("Puzzle".to_string(), 17), 252);

    // shader packs
    map.insert(("Vanilla".to_string(), 6552), 6555);
    map.insert(("Fantasy".to_string(), 6552), 6554);
    map.insert(("Realistic".to_string(), 6552), 6553);

    // data packs
    map.insert(("Magic".to_string(), 6945), 6952);
    map.insert(("Miscellaneous".to_string(), 6945), 6947);
    map.insert(("Fantasy".to_string(), 6945), 6949);
    map.insert(("Mod Support".to_string(), 6945), 6946);
    map.insert(("Tech".to_string(), 6945), 6951);
    map.insert(("Library".to_string(), 6945), 6950);
    map.insert(("Utility".to_string(), 6945), 6953);
    map.insert(("Adventure".to_string(), 6945), 6948);
    map
  };
}

pub fn cvt_category_to_id(category: &str, class_id: u32) -> u32 {
  match CATEGORY_MAP.get(&(category.to_string(), class_id)) {
    Some(id) => *id,
    None => {
      println!(
        "Category not found: {} with class_id {}",
        category, class_id
      );
      0
    }
  }
}
