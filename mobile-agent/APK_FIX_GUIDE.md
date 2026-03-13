# 安卓 APK 构建问题修复指南

## 问题描述
上传到 GitHub 后下载的安卓 APK 无法打开/安装。

## 常见原因

### 1. **签名问题（最可能）**
- Release build 使用了 debug 签名
- Android 新版本（Android 10+）对 debug 签名 APK 安装有限制
- 需要正确签名的 APK 才能正常安装

### 2. **GitHub Actions 工作流缺失**
- 缺少自动构建配置
- 需要创建 `.github/workflows/build-android.yml`

### 3. **架构不匹配**
- APK 可能只包含特定架构（arm64-v8a）
- 目标设备可能使用不同架构（armeabi-v7a）

---

## 已修复内容

### ✅ 1. 创建 GitHub Actions 工作流
文件: `.github/workflows/build-android.yml`
- 自动构建 Release APK
- 自动签名 APK
- 上传到 Artifacts

### ✅ 2. 更新 build.gradle 配置
文件: `android/app/build.gradle`
- 添加 universal APK 支持
- 分离 debug/release 签名配置
- 添加 APK 分架构构建选项

### ✅ 3. 创建本地构建脚本
文件: `build-android.sh`
- 支持本地快速构建
- 自动处理签名

---

## 重新构建步骤

### 方法 1: GitHub Actions 自动构建（推荐）

1. **提交更改到 GitHub**
```bash
cd ~/.openclaw/workspace-coder/mobile-agent
git add .
git commit -m "Fix Android build: Add signing and GitHub Actions workflow"
git push origin main
```

2. **在 GitHub 上触发构建**
- 打开 GitHub 仓库页面
- 点击 Actions 标签
- 选择 "Build Android APK" 工作流
- 点击 "Run workflow"

3. **下载 APK**
- 等待构建完成
- 在 Artifacts 中下载 `app-release-signed` APK
- 安装到手机测试

### 方法 2: 本地构建

```bash
cd ~/.openclaw/workspace-coder/mobile-agent

# 运行构建脚本
./build-android.sh

# APK 输出位置:
# android/app/build/outputs/apk/release/app-release-signed.apk
```

### 方法 3: 手动构建

```bash
cd ~/.openclaw/workspace-coder/mobile-agent

# 1. 安装依赖
npm install

# 2. 生成签名密钥（如不存在）
keytool -genkey -v \
  -keystore android/app/keystore/release.keystore \
  -alias release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass release123 \
  -keypass release123 \
  -dname "CN=Mobile Agent, OU=Dev, O=OpenClaw, L=Beijing, ST=Beijing, C=CN"

# 3. 构建 Release APK
cd android
./gradlew assembleRelease

# 4. 签名 APK
jarsigner -verbose \
  -sigalg SHA256withRSA \
  -digestalg SHA-256 \
  -keystore app/keystore/release.keystore \
  -storepass release123 \
  app/build/outputs/apk/release/app-release-unsigned.apk \
  release

# 5. 对齐优化
$ANDROID_HOME/build-tools/35.0.0/zipalign -v 4 \
  app/build/outputs/apk/release/app-release-unsigned.apk \
  app/build/outputs/apk/release/app-release-signed.apk
```

---

## APK 安装问题解决

### 问题 1: "安装包解析错误"
**原因**: APK 签名不正确或损坏
**解决**: 使用上面方法重新构建签名 APK

### 问题 2: "应用未安装"
**原因**: 已安装同包名应用但签名不同
**解决**: 先卸载旧版本再安装
```bash
adb uninstall com.mobileagent
```

### 问题 3: "此应用不适合您的设备"
**原因**: APK 架构与设备不匹配
**解决**: 构建 universal APK 或特定架构 APK

### 问题 4: Android 10+ 安装限制
**原因**: Android 10+ 对 debug 签名 APK 有安装限制
**解决**: 使用 release 签名（已配置）

---

## 下一步操作

1. **提交修复到 GitHub**:
```bash
git add .
git commit -m "Fix Android APK signing and build workflow"
git push origin main
```

2. **在 GitHub Actions 触发构建**

3. **测试 APK 安装**
- 下载构建好的 APK
- 传输到手机
- 安装测试

---

## 相关文件变更

| 文件 | 说明 |
|------|------|
| `.github/workflows/build-android.yml` | 新增：GitHub Actions 工作流 |
| `android/app/build.gradle` | 修改：添加签名配置 |
| `build-android.sh` | 新增：本地构建脚本 |

---

*修复时间: 2026-03-13*
