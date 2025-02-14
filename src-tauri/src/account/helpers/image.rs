use crate::account::models::AccountError;
use crate::error::SJMCLResult;
use base64::Engine;
use image::codecs::png::PngEncoder;
use image::{DynamicImage, ImageBuffer, ImageEncoder, Rgba, RgbaImage};
use std::io::Cursor;

pub fn draw_avatar(size: u32, img: ImageBuffer<Rgba<u8>, Vec<u8>>) -> SJMCLResult<String> {
  let (skin_width, _) = img.dimensions();

  let scale = skin_width as f32 / 64.0;
  let face_offset = ((size as f32 / 18.0).round()) as u32;

  let mut avatar_img = DynamicImage::new_rgba8(size, size).to_rgba8(); // Create a new RGBA image with the same size

  // Draw face
  draw_image_section(
    &img,
    &[8.0 * scale, 8.0 * scale, 8.0 * scale, 8.0 * scale],
    &[
      face_offset,
      face_offset,
      size - 2 * face_offset,
      size - 2 * face_offset,
    ],
    &mut avatar_img,
  );

  // Draw hat
  draw_image_section(
    &img,
    &[40.0 * scale, 8.0 * scale, 8.0 * scale, 8.0 * scale],
    &[0, 0, size, size],
    &mut avatar_img,
  );

  image_to_base64(avatar_img)
}

fn draw_image_section(
  img: &RgbaImage,
  src_rect: &[f32; 4],
  dest_rect: &[u32; 4],
  avatar_img: &mut RgbaImage,
) {
  let x_scale = src_rect[2] / dest_rect[2] as f32;
  let y_scale = src_rect[3] / dest_rect[3] as f32;
  for x_offset in 0..dest_rect[2] {
    for y_offset in 0..dest_rect[3] {
      let pixel = img.get_pixel(
        (src_rect[0] + x_offset as f32 * x_scale) as u32,
        (src_rect[1] + y_offset as f32 * y_scale) as u32,
      );
      if pixel.0[0] == 0 && pixel.0[1] == 0 && pixel.0[2] == 0 && pixel.0[3] == 0 {
        continue;
      }
      avatar_img.put_pixel(dest_rect[0] + x_offset, dest_rect[1] + y_offset, *pixel);
    }
  }
}

pub fn image_to_base64(image: ImageBuffer<Rgba<u8>, Vec<u8>>) -> SJMCLResult<String> {
  let mut buffer = Cursor::new(Vec::new());
  let encoder = PngEncoder::new(&mut buffer);
  encoder
    .write_image(
      &image.clone().into_raw(),
      image.width(),
      image.height(),
      image::ColorType::Rgba8.into(),
    )
    .or(Err(AccountError::TextureError))?;

  Ok(base64::engine::general_purpose::STANDARD.encode(buffer.into_inner()))
}

pub fn base64_to_image(base64_string: String) -> SJMCLResult<ImageBuffer<Rgba<u8>, Vec<u8>>> {
  let decoded_bytes = base64::engine::general_purpose::STANDARD
    .decode(base64_string)
    .or(Err(AccountError::TextureError))?;

  let image = image::load_from_memory(&decoded_bytes).map_err(|_| AccountError::TextureError)?;

  Ok(image.into_rgba8())
}
