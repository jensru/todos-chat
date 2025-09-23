# 📐 UI Styleguide & Guidelines

Dieser Styleguide definiert die Design-Spezifikationen (Spacing, Typografie, Farben, Komponenten) für die dargestellten Preis- und Abo-Karten. Er dient als Grundlage für AI-Coding-Tools und Entwickler:innen.

---

## 🎨 Farben

| Element | Hex | Beschreibung |
| --- | --- | --- |
| Hintergrund (BG) | `#FFFFFF` | Standard Card BG |
| Text Primary | `#1F1F1F` | Dunkelgrau (Titel, Preis) |
| Text Secondary | `#747775` | Hellgrau (Untertitel, Info) |
| Text Emphasis | `#444746` | Mittleres Grau (Hervorhebung) |
| Link / CTA Blau | `#0B57D0` | Buttons, aktive States |
| Positiv Grün | `#146C2E` | Rabatt / Hinweis Text |
| Divider Line | `#000000` (12% Opacity) | Trennlinien |

---

## ✍️ Typografie

**Font Family:** Google Sans

| Größe | Line Height | Gewicht | Verwendung |
| --- | --- | --- | --- |
| 24px | 32px | 400 (Regular) | Preis (`dh61.99`) |
| 16px | 24px | 500 (Medium) | Sekundär-Überschrift (`Basic (100 GB)`) |
| 14px | 20px | 400 (Regular) | Body Text, Infos |
| 14px | 20px | 500 (Medium) | "Recommended" Label |
| 14px | 18px | 500 (Medium) | CTA Button Text |

---

## 🧩 Komponenten

### 🔵 Button – Primary CTA

- Hintergrund: `#0B57D0`
- Textfarbe: `#FFFFFF`
- Font: Google Sans, 14px, 500 (Medium), Line height 18px
- Padding: 40px Höhe, 127px Breite (abhängig vom Text)
- Border Radius: 12px

---

### ✅ Checkbox mit Label

- Checkbox: 16px × 16px
- Stroke Width: 1.32px
- Icon: Blau `#0B57D0`
- Abstand Checkbox ↔ Text: 8px
- Label: Google Sans, 14px, Regular, Farbe `#3C4043`

---

## 📏 Spacing & Layout

### Card Container

- Breite: **260px**
- Höhe (Inhalt): ca. **326px**
- Border Radius: **12px**
- Innenabstände:
    - 16px horizontal
    - 24px vertikal
- Abstände zwischen Elementen:
    - Titel → Preis: 16px
    - Preis → Rabatttext: 12px
    - Rabatttext → Info: 12px
    - Info → Button: 24px
    - Button → Zusatztext: 12px
    - Unterer Padding: 34px

### Checkbox Bereich

- Abstand links: 24px
- Abstand rechts: 24px
- Checkbox: 16px
- Vertikale Abstände: 7px innen, 6px außen
- Label-Link Abstand: 8px

---

## 📚 Beispielstruktur

```HTML
<div class="card">
  <p class="label">Recommended</p>
  <h2 class="title">Basic (100 GB)</h2>
  <p class="price">
    <span class="price-old">dh89.88</span>
    <span class="price-new">dh61.99</span>
  </p>
  <p class="info">for 1 year</p>
  <p class="discount">Save up to dh27.89 with offer</p>
  <p class="after">AED 74.99/year after</p>
  <button class="cta">Get discount</button>
  <p class="share">Share storage with up to 5 others</p>
  <div class="checkbox">
    <input type="checkbox" checked />
    <label>100 GB of storage for Photos, Drive & Gmail</label>
  </div>
</div>
```
