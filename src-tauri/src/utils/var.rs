pub fn snake_to_camel_case(key_path: &str) -> String {
  let mut camel_key_path = String::new();
  let mut capitalize_next = false;

  for (i, ch) in key_path.char_indices() {
    if i > 0 && ch == '_' {
      capitalize_next = true;
    } else if capitalize_next {
      camel_key_path.push(ch.to_uppercase().next().unwrap_or(ch));
      capitalize_next = false;
    } else {
      camel_key_path.push(ch);
    }
  }
  camel_key_path
}

pub fn camel_to_snake_case(key_path: &str) -> String {
  let mut snake = String::new();
  for (i, ch) in key_path.char_indices() {
    if i > 0 && ch.is_uppercase() {
      snake.push('_');
    }
    snake.push(ch.to_ascii_lowercase());
  }
  snake
}
