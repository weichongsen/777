# AI彩票预测专家 Pro Max - 部署配置指南

## ⚠️ 重要：部署前必须完成配置

### 第一步：配置 Supabase 数据库

1. **注册 Supabase 账号**
   - 访问 https://supabase.com
   - 使用 GitHub 或邮箱注册

2. **创建新项目**
   - 点击 "New Project"
   - 填写项目名称（如：ai-lottery）
   - 选择区域（推荐：亚太东部 - 香港）
   - 设置数据库密码（请记住！）

3. **获取 API 密钥**
   - 进入项目后，点击左侧菜单 **Settings**
   - 选择 **API**
   - 找到以下信息：
     - **Project URL**: `https://xxxxx.supabase.co`
     - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

4. **编辑配置文件**
   
   打开 `scripts/global.js`，修改第1-2行：
   ```javascript
   // 替换为你的实际 Supabase URL
   const SUPABASE_URL = 'https://你的项目ID.supabase.co';
   
   // 替换为你的 anon public key
   const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```

5. **创建数据库表结构**
   - 在 Supabase 后台，点击左侧 **SQL Editor**
   - 点击 **New Query**
   - 复制 `supabase-schema.sql` 的全部内容
   - 粘贴到查询编辑器
   - 点击 **Run** 执行

### 第二步：配置彩票开奖API（可选）

如果您需要接入真实开奖数据：

1. **获取API接口**
   - 方式一：使用免费的彩票API服务
   - 方式二：购买商业彩票API
   - 方式三：自建开奖数据采集程序

2. **配置API地址**
   
   在管理员后台 (`admin.html`) 设置：
   - 开奖API地址
   - API密钥
   - 自动更新间隔

### 第三步：部署到 Cloudflare Pages

1. **上传代码**
   - 将整个项目文件夹上传到 GitHub 仓库
   - 或直接通过 Cloudflare Pages 上传

2. **设置构建命令**
   - 构建命令留空（纯静态网站）
   - 输出目录：`/`

3. **部署完成**
   - 获得网站地址
   - 配置自定义域名（可选）

## 🔧 验证配置是否成功

1. 打开网站，进入登录页面
2. 尝试注册新账户
3. 如果提示"请先配置 Supabase 数据库连接"，说明配置未完成
4. 注册成功后，使用账户登录
5. 如果能正常登录，说明配置成功

## 📝 常见问题

### Q: 登录时提示 "Invalid login credentials"
A: 这是正确的！说明 Supabase 已连接，但账户不存在或密码错误。请先注册新账户。

### Q: 提示 "请先配置 Supabase 数据库连接"
A: 
- 检查 `scripts/global.js` 中的 URL 和 KEY 是否正确
- 确保没有保留默认的 `your-supabase-url.supabase.co`

### Q: 数据库表创建失败
A: 
- 确保在正确的 Supabase 项目中执行 SQL
- 检查 SQL Editor 中的数据库连接

### Q: 如何重置管理员密码？
A: 
- 在 Supabase 后台，进入 **Authentication** -> **Users**
- 找到对应用户，点击 **Edit** -> **Reset password**

## 🎯 功能权限说明

| 功能 | 免费用户 | VIP用户 |
|------|----------|---------|
| 每日预测次数 | 3次 | 无限 |
| 数据分析 | 基础 | 全部 |
| 图表可视化 | 基础 | 高级 |
| AI实验室 | ❌ | ✅ |
| 高级模拟 | ❌ | ✅ |

## 📞 技术支持

如有问题，请检查：
1. Supabase 项目状态是否正常
2. API 密钥是否正确
3. 网络连接是否正常
