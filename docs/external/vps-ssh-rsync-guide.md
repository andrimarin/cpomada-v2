# 📘 Guía: Conexión SSH y rsync a vps-fv

Hola Andri 👋

Hice hardening al SSH del vps-fv. Tu flujo actual sigue funcionando,
pero por si necesitas replicarlo en otra máquina o retomar el setup,
te dejo la guía completa.

═══════════════════════════════════════════════════════════════════
CAMBIOS APLICADOS EN LA VPS (informativo)
═══════════════════════════════════════════════════════════════════

- SSH ahora escucha SOLO en 127.0.0.1 (antes en 0.0.0.0)
- Puerto 22 cerrado en Security Group AWS y UFW
- ec2-instance-connect desinstalado
- Session Manager (SSM) sigue siendo el único acceso desde internet

Impacto para ti: NINGUNO. Ya te conectabas por túnel SSM a localhost,
que es exactamente lo mismo que hago yo ahora. Solo cambió que ya no
hay puerto 22 expuesto al mundo.

═══════════════════════════════════════════════════════════════════
REQUISITOS EN TU LAPTOP
═══════════════════════════════════════════════════════════════════

- AWS CLI configurada con tus credenciales (usuario IAM: Andri)
- Session Manager Plugin instalado
- Tu llave privada SSH en ~/.ssh/id_ed25519 (o la que tengas
  registrada como andri@firmavirtual.legal en la VPS)
- rsync instalado (viene por defecto en Linux/macOS/WSL)

Si te falta AWS CLI o Session Manager Plugin, avísame y te paso la
guía de instalación.

═══════════════════════════════════════════════════════════════════
PASO 1 — Configurar alias en tu ~/.bashrc (una sola vez)
═══════════════════════════════════════════════════════════════════

Ejecuta en tu terminal (Linux/macOS/WSL):

cat >> ~/.bashrc <<'EOF'

# ─── VPS vps-fv ────────────────────────────────

export VPS_FV_INSTANCE_ID="i-0666926f83f493152"

# Sesión SSM directa (shell en la VPS como ssm-user)

alias vps-ssh='aws ssm start-session --target $VPS_FV_INSTANCE_ID'

# Túnel SSM para SSH/rsync (puerto local 2222 → VPS puerto 22)

alias tunel-ssh='aws ssm start-session \
 --target $VPS_FV_INSTANCE_ID \
 --document-name AWS-StartPortForwardingSession \
 --parameters "{\"portNumber\":[\"22\"],\"localPortNumber\":[\"2222\"]}"'

# Túnel SSM para DBeaver/MariaDB (puerto local 3307 → VPS puerto 3306)

alias tunel-vps='aws ssm start-session \
 --target $VPS_FV_INSTANCE_ID \
 --document-name AWS-StartPortForwardingSession \
 --parameters "{\"portNumber\":[\"3306\"],\"localPortNumber\":[\"3307\"]}"'
EOF

source ~/.bashrc

Verifica:
alias | grep -E 'vps-ssh|tunel-'

═══════════════════════════════════════════════════════════════════
PASO 2 — (Opcional pero recomendado) Configurar ~/.ssh/config
═══════════════════════════════════════════════════════════════════

Para no repetir "-p 2222" cada vez:

cat >> ~/.ssh/config <<'EOF'

Host vps-fv
HostName localhost
Port 2222
User andri
StrictHostKeyChecking accept-new
EOF

chmod 600 ~/.ssh/config

Con esto, en lugar de "ssh -p 2222 andri@localhost" solo escribes:
ssh vps-fv

═══════════════════════════════════════════════════════════════════
USO DIARIO
═══════════════════════════════════════════════════════════════════

╔══════════════════════════════════════════════════════════════╗
║ A. CONEXIÓN INTERACTIVA (para trabajar dentro de la VPS) ║
╚══════════════════════════════════════════════════════════════╝

vps-ssh

Te conecta como ssm-user. Para cambiar a tu usuario:
sudo su - andri

╔══════════════════════════════════════════════════════════════╗
║ B. SSH / RSYNC / SCP (transferencia de archivos) ║
╚══════════════════════════════════════════════════════════════╝

Flujo de 2 terminales:

Terminal 1 (mantener abierta):
tunel-ssh

    (Deja esta terminal corriendo. Ctrl+C cierra el túnel.)

Terminal 2 (usar):
ssh vps-fv # entrar por SSH
ssh vps-fv "comando remoto" # ejecutar un comando
rsync -avz archivo.txt vps-fv:/ruta/ # subir archivo
rsync -avz vps-fv:/ruta/archivo.txt ./ # bajar archivo
rsync -avz --progress ./carpeta/ vps-fv:/ruta/carpeta/ # sincronizar carpeta

Si no configuraste ~/.ssh/config, reemplaza "vps-fv" por
"-p 2222 andri@localhost" (para ssh) o
'-e "ssh -p 2222" ... andri@localhost:/ruta/' (para rsync).

╔══════════════════════════════════════════════════════════════╗
║ C. DBEAVER / MARIADB ║
╚══════════════════════════════════════════════════════════════╝

Terminal 1:
tunel-vps

DBeaver:
Host: localhost, Port: 3307
(usuario/contraseña te los paso aparte)

═══════════════════════════════════════════════════════════════════
TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════

▸ "Address already in use" al abrir el túnel
Ya tienes otra sesión con ese puerto. Cierra la anterior o cambia
el puerto local (2223, 2224, etc.).

▸ "TargetNotConnected"
El SSM Agent perdió conexión. Espera 30s y reintenta.

▸ "Permission denied (publickey)" al hacer ssh
Tu llave privada no coincide con la que está autorizada en
/home/andri/.ssh/authorized_keys en la VPS. Avísame y verificamos.

▸ "aws: command not found"
AWS CLI no instalada o no está en tu PATH.

▸ "session-manager-plugin: command not found"
Falta el plugin. Descárgalo desde:
https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html

═══════════════════════════════════════════════════════════════════
DATOS DE REFERENCIA
═══════════════════════════════════════════════════════════════════

Instance ID: i-0666926f83f493152
Región: us-east-1
IP Elástica: 3.218.159.92 (no se usa para SSH, solo para HTTP/HTTPS)
Usuario SSH: andri
Puerto SSH: 22 (en la VPS, escucha solo en 127.0.0.1)
Puerto local: 2222 (por convención, cualquiera libre sirve)

═══════════════════════════════════════════════════════════════════
Cualquier duda, avísame. — Kong
═══════════════════════════════════════════════════════════════════
