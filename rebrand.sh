#!/bin/bash

# HE4S Messenger - Script di Rebranding Completo
# Esegui questo script dalla root del progetto he4s-messenger

echo "🚀 Inizio rebranding Session → HE4S Messenger..."

# Colori per output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. SOSTITUZIONI NEI FILE DI TESTO
echo -e "${BLUE}📝 Sostituzione riferimenti nei file...${NC}"

# Trova e sostituisci in tutti i file (esclusi node_modules, .git, build)
find . -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/build/*" \
  -not -path "*/dist/*" \
  \( -name "*.json" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" -o -name "*.html" -o -name "*.md" -o -name "*.yml" -o -name "*.yaml" \) \
  -exec sed -i 's/Session Messenger/HE4S Messenger/g' {} +

find . -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/build/*" \
  -not -path "*/dist/*" \
  \( -name "*.json" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" -o -name "*.html" -o -name "*.md" \) \
  -exec sed -i 's/Session/HE4S/g' {} +

find . -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/build/*" \
  -not -path "*/dist/*" \
  \( -name "*.json" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" -o -name "*.html" -o -name "*.md" \) \
  -exec sed -i 's/session/he4s/g' {} +

find . -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/build/*" \
  -not -path "*/dist/*" \
  \( -name "*.json" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" -o -name "*.html" -o -name "*.md" \) \
  -exec sed -i 's/Oxen/HE4S Network/g' {} +

find . -type f \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/build/*" \
  -not -path "*/dist/*" \
  \( -name "*.json" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" -o -name "*.html" -o -name "*.md" \) \
  -exec sed -i 's/getsession.org/he4s.network/g' {} +

echo -e "${GREEN}✓ Sostituzioni completate${NC}"

# 2. MODIFICA PACKAGE.JSON
echo -e "${BLUE}📦 Aggiornamento package.json...${NC}"

if [ -f "package.json" ]; then
  # Backup
  cp package.json package.json.backup
  
  # Modifica con jq se disponibile, altrimenti con sed
  if command -v jq &> /dev/null; then
    jq '.name = "he4s-messenger" | 
        .productName = "HE4S Messenger" | 
        .description = "Private messenger for HE4S Network" |
        .author = "HE4S Team"' package.json > package.json.tmp && mv package.json.tmp package.json
    echo -e "${GREEN}✓ package.json aggiornato con jq${NC}"
  else
    sed -i 's/"name": ".*"/"name": "he4s-messenger"/' package.json
    sed -i 's/"productName": ".*"/"productName": "HE4S Messenger"/' package.json
    echo -e "${GREEN}✓ package.json aggiornato con sed${NC}"
  fi
fi

# 3. MODIFICA README
echo -e "${BLUE}📄 Aggiornamento README...${NC}"

if [ -f "README.md" ]; then
  cat > README.md << 'EOF'
# HE4S Messenger

Private and secure messaging application for the HE4S Network.

## About HE4S Messenger

HE4S Messenger is a fork of Session Messenger, adapted to work with the HE4S token and network infrastructure.

## Features

- End-to-end encrypted messaging
- Decentralized architecture
- No phone number required
- Integrated with HE4S Network

## Installation

```bash
npm install
npm start
```

## Building

```bash
npm run build
```

## Development

```bash
npm run dev
```

## License

See LICENSE file for details.

---

Built with ❤️ for the HE4S Community
EOF
  echo -e "${GREEN}✓ README.md creato${NC}"
fi

# 4. RINOMINA FILE E CARTELLE
echo -e "${BLUE}📁 Rinominazione file e cartelle...${NC}"

# Rinomina file contenenti 'session' nel nome
find . -depth -not -path "*/node_modules/*" -not -path "*/.git/*" -name "*session*" | while read file; do
  newname=$(echo "$file" | sed 's/session/he4s/g')
  if [ "$file" != "$newname" ]; then
    mv "$file" "$newname" 2>/dev/null && echo "Rinominato: $file → $newname"
  fi
done

echo -e "${GREEN}✓ Rinominazione completata${NC}"

# 5. CREA FILE DI CONFIGURAZIONE HE4S
echo -e "${BLUE}⚙️  Creazione configurazione HE4S...${NC}"

mkdir -p config

cat > config/he4s-config.json << 'EOF'
{
  "network": {
    "name": "HE4S Network",
    "tokenSymbol": "HE4S",
    "serviceNodes": [
      "https://node1.he4s.network",
      "https://node2.he4s.network",
      "https://node3.he4s.network"
    ],
    "seedNodes": [
      "seed1.he4s.network:8080",
      "seed2.he4s.network:8080"
    ]
  },
  "app": {
    "name": "HE4S Messenger",
    "version": "1.0.0",
    "homepage": "https://he4s.network"
  },
  "features": {
    "swap": {
      "enabled": true,
      "pairs": ["HE4S/OXEN", "HE4S/USDT"]
    }
  }
}
EOF

echo -e "${GREEN}✓ Configurazione HE4S creata${NC}"

# 6. GIT COMMIT
echo -e "${BLUE}📌 Commit delle modifiche...${NC}"

git add .
git commit -m "🔄 Rebranding completo: Session → HE4S Messenger

- Sostituiti tutti i riferimenti a Session con HE4S
- Aggiornato package.json e configurazioni
- Creata configurazione HE4S Network
- Rinominati file e cartelle
"

echo -e "${GREEN}✓ Modifiche committate${NC}"

# 7. SUMMARY
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ REBRANDING COMPLETATO!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📋 Prossimi passi:"
echo "1. Controlla i file modificati con: git diff HEAD~1"
echo "2. Aggiorna i tuoi Service Nodes in config/he4s-config.json"
echo "3. Sostituisci loghi e icone nella cartella /images o /assets"
echo "4. Configura gli endpoint API per HE4S"
echo "5. Testa l'applicazione: npm install && npm start"
echo ""
echo "🔄 Per ripristinare: git reset --hard HEAD~1"
echo ""
echo -e "${BLUE}Buon lavoro con HE4S Messenger! 🚀${NC}"
