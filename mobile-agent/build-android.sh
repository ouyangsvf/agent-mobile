#!/bin/bash

# Mobile Agent Android 构建脚本
# 用于本地构建签名 APK

set -e

echo "📱 Mobile Agent Android Build Script"
echo "===================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目目录
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# 检查依赖
echo ""
echo "🔍 检查依赖..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"

# 检查 Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}❌ Java 未安装${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Java: $(java -version 2>&1 | head -n1)${NC}"

# 安装 npm 依赖
echo ""
echo "📦 安装 npm 依赖..."
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${YELLOW}⚠ node_modules 已存在，跳过安装${NC}"
fi

# 创建签名密钥（如果不存在）
KEYSTORE_DIR="android/app/keystore"
KEYSTORE_FILE="$KEYSTORE_DIR/release.keystore"

if [ ! -f "$KEYSTORE_FILE" ]; then
    echo ""
    echo "🔐 生成签名密钥..."
    mkdir -p "$KEYSTORE_DIR"
    keytool -genkey -v \
        -keystore "$KEYSTORE_FILE" \
        -alias release \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass release123 \
        -keypass release123 \
        -dname "CN=Mobile Agent, OU=Dev, O=OpenClaw, L=Beijing, ST=Beijing, C=CN"
    echo -e "${GREEN}✓ 签名密钥已生成: $KEYSTORE_FILE${NC}"
else
    echo -e "${GREEN}✓ 签名密钥已存在${NC}"
fi

# 构建 Release APK
echo ""
echo "🔨 构建 Release APK..."
cd android

# 确保 gradlew 可执行
chmod +x gradlew

# 清理并构建
./gradlew clean
./gradlew assembleRelease

echo ""
echo -e "${GREEN}✅ 构建完成！${NC}"
echo ""

# 签名 APK（如果未自动签名）
APK_UNSIGNED="app/build/outputs/apk/release/app-release-unsigned.apk"
APK_SIGNED="app/build/outputs/apk/release/app-release-signed.apk"

if [ -f "$APK_UNSIGNED" ]; then
    echo "🔏 签名 APK..."
    jarsigner -verbose \
        -sigalg SHA256withRSA \
        -digestalg SHA-256 \
        -keystore "$KEYSTORE_FILE" \
        -storepass release123 \
        "$APK_UNSIGNED" \
        release
    
    # 对齐优化
    if command -v zipalign &> /dev/null; then
        zipalign -v 4 "$APK_UNSIGNED" "$APK_SIGNED"
        echo -e "${GREEN}✓ APK 已签名并优化${NC}"
        FINAL_APK="$APK_SIGNED"
    else
        echo -e "${YELLOW}⚠ zipalign 未找到，使用未对齐版本${NC}"
        cp "$APK_UNSIGNED" "$APK_SIGNED"
        FINAL_APK="$APK_SIGNED"
    fi
else
    FINAL_APK="app/build/outputs/apk/release/app-release.apk"
fi

echo ""
echo "===================================="
echo -e "${GREEN}🎉 APK 构建成功！${NC}"
echo ""
echo "📍 文件位置:"
echo "   $PROJECT_DIR/android/$FINAL_APK"
echo ""
echo "📋 所有生成的 APK:"
find app/build/outputs/apk -name "*.apk" -exec ls -lh {} \; 2>/dev/null || true
echo ""
echo "📲 安装到手机:"
echo "   adb install -r $PROJECT_DIR/android/$FINAL_APK"
echo ""
