#!/bin/bash
set -e

# Package Configurations
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

echo "🔍 Checking source code in src/mnemo/..."
# Adjusted to check the new source path
if grep -q "FileDialog" src/mnemo/main.py; then
    echo "❌ ERROR: src/mnemo/main.py still contains 'FileDialog'"
    exit 1
fi

echo "🛠️  Starting Debian package build..."

# Clean previous builds
rm -rf $BUILD_DIR
rm -f *.deb

# Create Debian directory structure
mkdir -p $BUILD_DIR/DEBIAN
mkdir -p $BUILD_DIR/usr/bin
mkdir -p $BUILD_DIR/usr/share/mnemo/frontend
mkdir -p $BUILD_DIR/usr/share/applications

# Create Control file (metadata)
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

# Create the system executable /usr/bin/mnemo
cat << EOF > $BUILD_DIR/usr/bin/mnemo
#!/bin/bash
export PYWEBVIEW_GUI=gtk
# Enter the directory where files are installed to ensure relative paths work
cd /usr/share/mnemo
exec python3 main.py "\$@"
EOF
chmod +x $BUILD_DIR/usr/bin/mnemo

# --- Copy Application Files ---

# Copy Python code to the app root
cp src/mnemo/main.py $BUILD_DIR/usr/share/mnemo/
cp src/mnemo/__init__.py $BUILD_DIR/usr/share/mnemo/ 2>/dev/null || :

# Copy UI files to the frontend/ subfolder
cp frontend/index.html frontend/script.js $BUILD_DIR/usr/share/mnemo/frontend/
cp -r frontend/libs $BUILD_DIR/usr/share/mnemo/frontend/

# Create Desktop entry (shortcut)
cat << EOF > $BUILD_DIR/usr/share/applications/mnemo.desktop
[Desktop Entry]
Name=mnemo
Comment=Markdown Editor
Exec=mnemo
Icon=/usr/share/mnemo/frontend/libs/icon.png
Terminal=false
Type=Application
Categories=Development;TextEditor;
EOF

# Build the .deb package
echo "📦 Packaging..."
dpkg-deb --build $BUILD_DIR
mv ${BUILD_DIR}.deb ${PACKAGE_NAME}_${VERSION}_all.deb

echo "✅ Build finished: ${PACKAGE_NAME}_${VERSION}_all.deb"
echo "🚀 To install:"
echo "   sudo apt install ./${PACKAGE_NAME}_${VERSION}_all.deb"