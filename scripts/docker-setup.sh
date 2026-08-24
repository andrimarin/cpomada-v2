#!/bin/bash
# Script para instalar Docker y ejecutar el portal

set -e

echo "🐳 Docker Setup para Portal Cautivo Omada"
echo "=========================================="

# Detectar SO
OS=$(uname -s)

# Función para instalar Docker
install_docker() {
    echo "📦 Instalando Docker..."
    
    if [ "$OS" = "Linux" ]; then
        # Debian/Ubuntu
        if command -v apt-get &> /dev/null; then
            sudo apt-get update
            sudo apt-get install -y docker.io docker-compose
            sudo usermod -aG docker $USER
            echo "✅ Docker instalado en Ubuntu/Debian"
        # RHEL/CentOS
        elif command -v yum &> /dev/null; then
            sudo yum install -y docker
            sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            sudo chmod +x /usr/local/bin/docker-compose
            sudo systemctl start docker
            sudo usermod -aG docker $USER
            echo "✅ Docker instalado en CentOS/RHEL"
        fi
    elif [ "$OS" = "Darwin" ]; then
        echo "📖 macOS detectado. Por favor instala Docker Desktop manualmente:"
        echo "   https://www.docker.com/products/docker-desktop"
        exit 1
    fi
}

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker no está instalado"
    read -p "¿Deseas instalarlo ahora? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        install_docker
        echo "⚠️  Reinicia la sesión: exec su -l $USER"
        exit 0
    else
        echo "❌ Docker es requerido. Instálalo manualmente desde https://docker.com"
        exit 1
    fi
fi

echo "✅ Docker detectado: $(docker --version)"
echo "✅ Docker Compose detectado: $(docker-compose --version)"

# Crear .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando .env..."
    cp .env.example .env
    echo "✅ .env creado. Por favor edítalo con tus credenciales"
    echo "   nano .env"
fi

# Crear directorios SSL
if [ ! -d ssl ]; then
    mkdir -p ssl
    echo "📝 Generando certificado SSL auto-firmado..."
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem \
        -days 365 -nodes -subj "/CN=localhost" 2>/dev/null || true
    echo "✅ Certificado creado en ssl/"
fi

# Build y start
echo ""
echo "🚀 Iniciando servicios..."
docker-compose up -d --build

# Esperar a que la BD esté lista
echo "⏳ Esperando base de datos..."
for i in {1..30}; do
    if docker-compose exec -T mariadb mysql -u${DB_USER:-portal_user} -p${DB_PASSWORD:-portal_pass} -h localhost -e "SELECT 1" &> /dev/null; then
        echo "✅ Base de datos lista"
        break
    fi
    echo -n "."
    sleep 1
done

# Esperar a que backend esté listo
echo "⏳ Esperando backend..."
for i in {1..30}; do
    if curl -f http://localhost:3000/health &> /dev/null; then
        echo "✅ Backend listo"
        break
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "✅ ¡Portal Cautivo iniciado exitosamente!"
echo ""
echo "📊 ESTADO DE SERVICIOS:"
docker-compose ps
echo ""
echo "🌐 URLS:"
echo "   HTTP:  http://localhost:3000"
echo "   HTTPS: https://localhost"
echo "   API:   http://localhost:3000/api/v1/plans"
echo ""
echo "📊 VER LOGS:"
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f mariadb"
echo ""
echo "🛑 DETENER:"
echo "   docker-compose down"
echo ""
echo "💾 HACER BACKUP BD:"
echo "   docker-compose exec mariadb mysqldump -u${DB_USER:-portal_user} -p${DB_PASSWORD:-portal_pass} omada_payment > backup.sql"
echo ""