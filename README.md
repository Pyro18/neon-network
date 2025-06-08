# NeonNetwork 

## 🚀 Tecnologie Utilizzate

### Frontend

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Type safety e sviluppo robusto
- **Tailwind CSS** - Styling moderno e responsive
- **Radix UI** - Componenti UI accessibili
- **Lucide React** - Icone moderne
- **React Hook Form** - Gestione form avanzata
- **Zod** - Validazione schema

### Backend & Database

- **Supabase** - Backend-as-a-Service con PostgreSQL
- **Row Level Security (RLS)** - Sicurezza a livello di database
- **Supabase Auth** - Autenticazione con provider OAuth

### Styling & UI

- **Design System Personalizzato** - Componenti neon-themed
- **Tema Cyberpunk** - Colori neon e effetti particelle
- **Responsive Design** - Ottimizzato per mobile e desktop
- **Dark Mode** - Supporto nativo tema scuro

## 📁 Struttura del Progetto

```text
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # Pagine autenticazione
│   ├── forum/             # Sezioni forum
│   └── admin/             # Pannello amministrazione
├── components/            # Componenti React riutilizzabili
│   ├── ui/               # Componenti UI base
│   ├── auth/             # Componenti autenticazione
│   ├── forum/            # Componenti forum
│   └── admin/            # Componenti amministrazione
├── hooks/                # Custom React hooks
├── lib/                  # Utilities e configurazioni
├── types/                # Definizioni TypeScript
└── public/               # Assets statici
```

## ⚡ Funzionalità Implementate

### ✅ Autenticazione

- [x] Registrazione utente con email
- [x] Login/logout
- [x] Integrazione Discord OAuth
- [x] Verifica email
- [x] Reset password
- [x] Gestione profilo utente
- [x] Sistema ruoli (member, moderator, admin)
- [x] Role-based access control

### ✅ Forum

- [x] Creazione e gestione categorie
- [x] Creazione thread e post
- [x] Sistema di reply/risposte
- [x] Editor Markdown avanzato
- [x] Syntax highlighting codice
- [x] Paginazione thread e post
- [x] Statistiche forum (contatori utenti, post, thread)
- [x] Interfaccia responsive

### ✅ UI/UX

- [x] Design system neon/cyberpunk
- [x] Componenti UI personalizzati
- [x] Effetti particelle animate
- [x] Tema scuro ottimizzato
- [x] Indicatori stato server
- [x] Contatore giocatori online
- [x] Carousel notizie
- [x] Mappa server interattiva

### ✅ Amministrazione

- [x] Pannello admin protetto
- [x] Gestione categorie forum
- [x] Statistiche generali
- [x] Gestione thread e post
- [x] Media uploader per immagini

## 🚧 Funzionalità in Sviluppo

### ⏳ Sistema di Moderazione

- [ ] **Sistema Ban Utenti**
  - [x] Struttura database preparata (`is_banned`, `ban_reason`, `banned_until`)
  - [x] Controlli RLS implementati
  - [ ] Interfaccia admin per ban/unban
  - [ ] Pagina ban appeal
  - [ ] Ban temporanei con scadenza automatica
  - [ ] Log azioni moderazione

- [ ] **Strumenti Moderazione**
  - [ ] Moderazione post (approvazione/rimozione)
  - [ ] Segnalazione contenuti inappropriati
  - [ ] Warning system per utenti
  - [ ] Moderazione thread (lock/pin/move)
  - [ ] Queue moderazione contenuti

### 🔄 Miglioramenti Pianificati

- [ ] **Notifiche**
  - [ ] Notifiche in-app
  - [ ] Email notifications
  - [ ] Notifiche Discord webhook

- [ ] **Social Features**
  - [ ] Sistema like/reazioni post
  - [ ] Profili utente estesi
  - [ ] Badge e achievements
  - [ ] Sistema reputazione

- [ ] **Performance & SEO**
  - [ ] Cache ottimizzato
  - [ ] Meta tags dinamici
  - [ ] Sitemap automatica
  - [ ] Analytics integration

## 🛠️ Setup Sviluppo

### Prerequisiti

- Node.js 18+
- PNPM
- Account Supabase

### Installazione

1. **Clone repository**

```bash
git clone <repository-url>
cd neon-network
```

2. **Installa dipendenze**

```bash
pnpm install
```

3. **Configura environment variables**

```bash
# Copia il file di esempio
cp .env.example .env.local

# Configura le variabili:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Avvia development server**

```bash
pnpm dev
```

## 🗄️ Schema Database

### Tabelle Principali

- `profiles` - Profili utente estesi
- `forum_categories` - Categorie forum
- `forum_threads` - Thread discussioni
- `forum_posts` - Post e risposte

### Sicurezza

- Row Level Security (RLS) abilitato su tutte le tabelle
- Politiche granulari per lettura/scrittura
- Controlli ruoli integrati

## 🧪 Testing

### Test Status

- ⚠️ **Testing Generale**: Necessita test completi
- ⚠️ **Test Unitari**: Da implementare
- ⚠️ **Test Integration**: Da implementare
- ⚠️ **Test E2E**: Da implementare

### Test Manuali Eseguiti

- [x] Autenticazione flow completo
- [x] Creazione e gestione forum
- [x] Responsive design
- [x] Controlli permessi ruoli
- [ ] Performance sotto carico
- [ ] Cross-browser compatibility



## 📝 Note Sviluppo

### Problemi Noti

- Sistema ban non completamente implementato nell'UI
- Mancano test automatizzati
- Performance da ottimizzare per grandi volumi

### Priorità Sviluppo

1. Completare sistema ban/moderazione
2. Implementare test suite
3. Ottimizzazioni performance
4. Sistema notifiche

---

**PS: Se potete, lasciate i credits nel footer, grazie <3**