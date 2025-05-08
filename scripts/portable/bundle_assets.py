# By default, the assets folder is not bundled into the executable. This crashes the portable app when it tries to load the assets.
# This script bundles the assets folder into the executable and adds flags, so that when the portable executable is run, it will extract the assets folder.

import os
import io
import sys
import struct
import zipfile

basepath = sys.argv[1] if len(sys.argv) > 1 else "."

assets_path = os.path.join(basepath, "assets")
executable_path = os.path.join(basepath, "SJMCL.exe")
output_executable_path = os.path.join(basepath, "SJMCL-patched.exe")

zip_stream = io.BytesIO()

with zipfile.ZipFile(zip_stream, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(assets_path):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, basepath)
            zipf.write(file_path, arcname)
zip_stream.seek(0)

with open(executable_path,'rb') as f:
    exe_file = f.read()
assets_file = zip_stream.read()

assets_offset = struct.pack("<I", len(exe_file))
assets_length = struct.pack("<I", len(assets_file))

with open(output_executable_path,'wb') as f:
    f.write(exe_file + assets_file + b"PORT" + assets_offset + assets_length)

print(f"Patched executable created at: {output_executable_path}")