#!/bin/bash
set -e

PACKAGE_NAME="mnemo"
VERSION="1.0.1"
MAINTAINER="Thiago <thiago@ufrn.edu.br>"
BUILD_DIR="mnemo-package"

echo "🧹 Removing old installed versions..."

if dpkg -l | grep -q "^ii  $PACKAGE_NAME"; then
    sudo apt remove -y $PACKAGE_NAME
fi

sudo rm -rf /usr/share/mnemo
sudo rm -f /usr/bin/mnemo

echo "🔍 Checking source code..."

if grep -q "FileDialog" main.py; then
    echo "❌ ERROR: main.py still contains 'FileDialog'"
    exit 1
fi

echo "🛠️  Starting Debian package build..."

rm -rf $BUILD_DIR
rm -f *.deb

mkdir -p $BUILD_DIR/DEBIAN
mkdir -p $BUILD_DIR/usr/bin
mkdir -p $BUILD_DIR/usr/share/mnemo
mkdir -p $BUILD_DIR/usr/share/applications

cat << EOF > $BUILD_DIR/DEBIAN/control
Package: $PACKAGE_NAME
Version: $VERSION
Section: utils
Priority: optional
Architecture: all
Maintainer: $MAINTAINER
Depends: python3, python3-webview, python3-gi, python3-pdfkit, gir1.2-gtk-3.0, wkhtmltopdf
Description: mnemo is an elegant Markdown editor with real-time preview and PDF export.
 Built with Python and pywebview at UFRN.
EOF

# Executable /usr/bin
cat << EOF > $BUILD_DIR/usr/bin/mnemo
#!/bin/bash
export PYWEBVIEW_GUI=gtk
cd /usr/share/mnemo
exec python3 main.py "\$@"
EOF
chmod +x $BUILD_DIR/usr/bin/mnemo

# Copy app files
cp main.py index.html script.js $BUILD_DIR/usr/share/mnemo/
cp -r libs $BUILD_DIR/usr/share/mnemo/

# Desktop entry
cat << EOF > $BUILD_DIR/usr/share/applications/mnemo.desktop
[Desktop Entry]
Name=mnemo
Comment=Markdown Editor
Exec=mnemo
Icon=/usr/share/mnemo/libs/icon.png
Terminal=false
Type=Application
Categories=Development;TextEditor;
EOF

# Build the .deb
dpkg-deb --build $BUILD_DIR
mv ${BUILD_DIR}.deb ${PACKAGE_NAME}_${VERSION}_all.deb

echo "✅ Build finished: ${PACKAGE_NAME}_${VERSION}_all.deb"
echo "📦 To install:"
echo "   sudo apt install ./${PACKAGE_NAME}_${VERSION}_all.deb"
