# E² Hub

> Hub de portfolio e projetos universitários — Design hacker/Matrix animado

![E² Hub Preview](https://img.shields.io/badge/Status-Online-brightgreen?style=for-the-badge&logo=matrix)
![Tech Stack](https://img.shields.io/badge/Stack-Vanilla%20JS%20%2B%20CSS3-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

---

## 🎯 Sobre

**E² Hub** é meu hub central de portfolio e projetos acadêmicos, construído com estética **cyberpunk/hacker/Matrix**. Zero frameworks, puro vanilla — performance, acessibilidade e código limpo.

### Features

- 🌧️ **Matrix Rain Canvas** — Chuva de caracteres japonesa/hex animada
- 📺 **CRT Effects** — Scanlines, vignette, glitch text
- ⌨️ **Terminal UI** — Header estilo terminal, prompt animado
- 📊 **Contadores animados** — Stats com easing suave
- 📈 **Skill bars** — Barras de progresso com shimmer
- 🔊 **Audio beeps** — Sons hacker opcionais (Web Audio API)
- 🎮 **Easter eggs** — Código Konami ativa modo Matrix
- ♿ **Acessível** — Reduz animações se `prefers-reduced-motion`
- 📱 **Responsivo** — Mobile-first, funciona em qualquer tela

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/Eli2Dev/e2-hub.git
cd e2-hub

# Install (optional - only for dev server)
npm install

# Run dev server
npm run dev
# Abre em http://localhost:3000
```

Ou simplesmente abra `index.html` no navegador — é um site estático puro!

---

## 📁 Estrutura

```
e2-hub/
├── index.html      # Estrutura semântica + SEO
├── styles.css      # CSS Custom Properties, Grid/Flex, Animações
├── app.js          # ES6 Classes: MatrixRain, Counter, ProjectsManager, etc.
├── package.json    # Scripts dev/build/deploy
├── .gitignore
└── README.md
```

---

## 🛠️ Adicionando Projetos

Edite `app.js` na seção **INITIALIZATION** → `projectsManager.addBatch([...])`:

```javascript
projectsManager.addBatch([
  {
    title: 'Meu Projeto Incrível',
    desc: 'Descrição curta do que faz',
    tech: ['React', 'TypeScript', 'Node.js'],
    url: 'https://meuprojeto.dev',      // Link demo (opcional)
    repo: 'https://github.com/user/repo', // Link GitHub (opcional)
    icon: '⚡'                            // Emoji/ícone (opcional)
  },
  // ... mais projetos
]);
```

---

## 🎨 Customização

### Cores (CSS Variables em `:root`)

```css
:root {
  --matrix-green: #00ff41;      /* Verde principal */
  --matrix-green-bright: #39ff14;
  --matrix-dark: #0a0f0a;       /* Background */
  --matrix-card: #0d1a0d;       /* Cards */
  --accent-cyan: #00ffff;       /* Acento ciano */
  --accent-amber: #ffb000;      /* Acento âmbar */
  --accent-red: #ff0040;        /* Acento vermelho */
  --accent-purple: #bf00ff;     /* Acento roxo */
}
```

### Fontes

```css
--font-mono: 'JetBrains Mono', monospace;   /* Código/UI */
--font-display: 'Space Mono', monospace;    /* Títulos */
```

---

## 📦 Deploy

### GitHub Pages (Recomendado)

```bash
# Já configurado no package.json
npm run deploy
# Ou manual:
gh-pages -d .
```

O site estará em `https://Eli2Dev.github.io/e2-hub/`

### Netlify / Vercel

Arraste a pasta `e2-hub` no dashboard — deploy automático.

---

## ♿ Acessibilidade

- `prefers-reduced-motion`: Desativa animações pesadas
- Contraste WCAG AA nas cores principais
- Semântica HTML5 adequada
- Focus visible em links/botões
- `aria-hidden` em elementos decorativos

---

## 🔒 Segurança

- **Zero dependências runtime** — sem supply chain attacks
- **CSP ready** — inline scripts permitidos apenas no `app.js`
- **Sem tracking** — zero analytics, zero cookies
- **HTTPS only** em produção

---

## 📜 Licença

MIT — Use, modifique, compartilhe. Créditos apreciados!

---

## 👨‍💻 Autor

**Eli2Dev** — *Dev Fullstack / Discente*

[![GitHub](https://img.shields.io/badge/GitHub-Eli2Dev-181717?style=for-the-badge&logo=github)](https://github.com/Eli2Dev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Eliel_Reis-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/eliel-reis)
[![Email](https://img.shields.io/badge/Email-Eliel.reiinan@gmail.com-D14836?style=for-the-badge&logo=gmail)](mailto:Eliel.reiinan@gmail.com)

---

<p align="center">
  <a href="https://github.com/Eli2Dev" target="_blank">
    <strong>ProdByE²</strong>
  </a>
</p>

---

> `// Sistema operacional: E² Hub v1.0.0`
> `>_ echo "Coded with ██████ by Eli2Dev"`