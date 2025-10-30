use serde::Serialize;
use std::error::Error;

#[derive(Debug, Serialize, PartialEq, Eq)]
pub struct LXMCLError(pub String);

pub type LXMCLResult<T> = Result<T, LXMCLError>;

impl<T> From<T> for LXMCLError
where
  T: Error,
{
  fn from(err: T) -> Self {
    LXMCLError(err.to_string())
  }
}
