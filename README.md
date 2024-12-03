## SJMC Launcher

SJMCL is an open-source Minecraft launcher from [Shanghai Jiao Tong University Minecraft Club (SJMC)](https://mc.sjtu.cn/welcome/content/3/).

### Devlopment

This project uses **[Tauri v2](https://v2.tauri.app/)**. Please make sure you have installed [node >=22](https://nodejs.org/) and [Rust](https://www.rust-lang.org/learn/get-started).

```bash
git clone git@github.com:UNIkeEN/SJMCL.git
npm install
```

To start as development mode:

```bash
npm run tauri dev
```

We use **ESLint** + **Prettier** for frontend code and **rustfmt** for backend code to ensure consistent formatting. Code formatting is automatically checked before each commit.

To manually check and fix formatting issues, you can run the following commands:

```bash
# For frontend part
npx eslint "src/**/*.{js,jsx,ts,tsx,json}" --no-fix     # check
npx eslint "src/**/*.{js,jsx,ts,tsx,json}" --fix        # fix

# For backend part
rustfmt --check src-tauri/src/**/*.rs
```
