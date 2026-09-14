# Irisabella Healing Texel requirements baseline

This document records the accepted behavior of the current website. Requirement IDs
are stable references for future changes. Tests named below are the automated evidence;
items marked as a limitation require a manual or provider-side check.

## Navigation

| ID | Requirement and acceptance criteria | Evidence |
| --- | --- | --- |
| NAV-01 | The fixed navigation exposes Welkom, Wat is Healing, Mijn Aanpak, Wie ben ik, Reviews, Contact, and Afspraak maken. Each section link scrolls its target into view. | `navigation.spec.ts` — all nav links visible and scroll to sections |
| NAV-02 | At mobile widths, the menu opens and closes by pointer or keyboard; choosing a link closes it. | `navigation.spec.ts` — hamburger/menu link tests |
| NAV-03 | The navigation hides after scrolling down and returns when scrolling up, except while the mobile menu is open. | `navigation.spec.ts` — navbar visibility tests |

## Page content and responsive layout

| ID | Requirement and acceptance criteria | Evidence |
| --- | --- | --- |
| CNT-01 | The page has the Welkom header and sections Wat is Healing, Mijn Aanpak, Wie ben ik, Reviews, and Contact. | `structure.spec.ts` — section headings |
| CNT-02 | The approach states a healing costs €80, lasts one hour, and the complete appointment takes about 1.5–2 hours. | `content.spec.ts` — treatment facts |
| CNT-03 | The site remains usable without horizontal page overflow at desktop and mobile viewports. | `content.spec.ts` — responsive layout |
| CNT-04 | Images load and provide meaningful alternative text; local custom fonts load. | `structure.spec.ts` — asset/font/accessibility tests |

## Slideshow and reviews

| ID | Requirement and acceptance criteria | Evidence |
| --- | --- | --- |
| MED-01 | Five supplied images appear in the slideshow, exactly one is active, it advances every 10 seconds, and loops back to the first image. | `carousels.spec.ts` — Slideshow |
| REV-01 | Reviews are rendered from `data/testimonials.yaml`, with text, author, and exactly one active review. | `carousels.spec.ts` — loaded from YAML |
| REV-02 | Previous/next controls, keyboard activation, auto-advance, reset after manual navigation, and mobile swipe work. | `carousels.spec.ts`, `structure.spec.ts` |
| REV-03 | Navigation and the slideshow continue working while review data is delayed; a failed review request does not break the page. | `navigation.spec.ts`, `structure.spec.ts` |

## Booking and contact

| ID | Requirement and acceptance criteria | Evidence |
| --- | --- | --- |
| BKG-01 | All three appointment calls to action point to `https://irisabella.simplybook.it/v2/#book`. When the widget is available, each opens its dialog; modifier clicks retain ordinary link behavior. | `booking.spec.ts` |
| BKG-02 | If the booking widget fails to load, appointment links remain usable ordinary links. | `booking.spec.ts` |
| BKG-03 | Live availability, customer details, payments, confirmation, and provider-side booking behavior are outside automated coverage. | Limitation: no live booking tests by design |
| CON-01 | Contact details are phone `06 53 24 52 53`, email `Irisabella@xs4all.nl`, and Ruijslaan 90, 1796 AZ, De Koog. | `contact.spec.ts` |
| CON-02 | Maps and Instagram open safely in a new tab; Instagram has an accessible label. | `contact.spec.ts` |

## Accessibility, SEO, and appearance

| ID | Requirement and acceptance criteria | Evidence |
| --- | --- | --- |
| A11Y-01 | Skip navigation, keyboard focus, interactive labels, heading hierarchy, and reduced-motion styling remain available. | `structure.spec.ts` |
| SEO-01 | The homepage declares the Dutch language, title, description, canonical URL, LocalBusiness JSON-LD, valid sitemap, and crawler-friendly robots file. | `seo.spec.ts`, `structure.spec.ts` |
| VIS-01 | Chromium desktop and mobile layouts match the committed, reviewed visual baseline for the full page, key sections, navigation, slideshow, controls, and logo. | `visual.spec.ts` |
