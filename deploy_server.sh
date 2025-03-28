#!/bin/bash

# DEFINITIONS DE VARIABLES
PROJECT_DIR="/home/"
GIT_REPO="https://github.com/wicra/PontConnect-REST-Node"
NODE_VERSION="22.14.0"

echo "DEBUT DE L'INSTALLATION DU SERVEUR"

# REPERTOIRE DU PROJET
if [ ! -d "$PROJECT_DIR" ]; then
  echo "CREATION DU REPERTOIRE  $PROJECT_DIR..."
  mkdir -p "$PROJECT_DIR"
else
  echo "LE REPERTOIRE $PROJECT_DIR EXISTE DEJA."
fi

cd "$PROJECT_DIR"

# CLONAGE DU PROJET
if [ ! -d "$PROJECT_DIR/.git" ]; then
  echo "CLONAGE DU PROJET..."
  git clone "$GIT_REPO"

# INSTALLATION DE NODE.JS ET DOCKER
echo "INSTALLATION DE NODE.JS $NODE_VERSION ET NPM..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "NODE.JS : $(node -v)"
echo "NPM : $(npm -v)"

# INSTALLATION DE DOCKER
if ! command -v docker &> /dev/null; then
  echo "INSTALLATION DE DOCKER..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker pi
  echo "DOCKER : $(docker -v)"
else
  echo "DOCKER EST DEJA INSTALLE."
fi

# INSTALLATION DE DOCKER-COMPOSE
if ! command -v docker-compose &> /dev/null; then
  echo "INSTALLATION DE DOCKER-COMPOSE..."
  sudo apt-get install -y docker-compose
  echo "DOCKER-COMPOSE : $(docker-compose -v)"
else
  echo "DOCKER-COMPOSE EST DEJA INSTALLE."
fi

# DEMARRER LA BASE DE DONNEES
echo "DEMARRAGE DE LA BASE DE DONNEES..."
docker compose -f compose.db.yaml up -d
echo "BASE DE DONNEES DEMARREE."

# INSTALLATION DES DEPENDANCES
echo "SUPPRESSION DES ANCIENNES DEPENDANCES..."
rm -rf node_modules package-lock.json

echo "INSTALLATION DES DEPENDANCES..."
npm install --production

# CONFIGURATION DES VARIABLES D'ENVIRONNEMENT
echo "CHARGEMENT DES VARIABLES D'ENVIRONNEMENT..."
cat <<EOF > .env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=api_db
DB_CHARSET=utf8
EOF

# DEMARRAGE DU SERVEUR NODE.JS
echo "DEMARRAGE DU SERVEUR NODE.JS..."
npm run start

echo "INSTALLATION TERMINEE AVEC SUCCES !"
