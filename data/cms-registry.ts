export type CmsFieldType = "text" | "textarea" | "url" | "image" | "multiline-title";

export type CmsFieldDefinition = {
  key: string;
  label: string;
  section: string;
  type: CmsFieldType;
  defaultValue: string;
};

export type AboutCard = {
  id: string;
  title: string;
  body: string;
  image: string;
  href: string;
  bgColor: string;
  frameColor?: string;
  textColor: string;
  isActive?: boolean;
  kind?: "image" | "bus";
};

export const defaultAboutCards: AboutCard[] = [
  { id: "bun", title: "BUN", body: "Unsere Buns und Sandwichbrote werden von sorgfältig ausgewählten Bäckereien handwerklich hergestellt, mit hochwertigen Zutaten und viel Liebe zum Detail.", image: "/mlem-assets/baos-1.webp", href: "", bgColor: "#68A1BF", frameColor: "#F6BBD1", textColor: "#000000", isActive: true },
  { id: "fleisch", title: "FLEISCH", body: "Unser Halal-Fleisch beziehen wir täglich frisch vom Verdi Supermarkt. Dort wird streng auf zertifizierte Halal-Qualität, Frische und verantwortungsvolle Herkunft geachtet – für besten Geschmack und volle Transparenz.", image: "/mlem-assets/meat.webp", href: "", bgColor: "#FFF3B0", frameColor: "#68A1BF", textColor: "#FFFFFF", isActive: true },
  { id: "salat", title: "SALAT", body: "Unser Gemüse beziehen wir frisch von ausgewählten Lieferanten. Knackige Qualität, intensive Aromen und vollen Geschmack.", image: "/mlem-assets/salad-and-tomato.webp", href: "", bgColor: "#F6BBD1", frameColor: "#FFF3B0", textColor: "#000000", isActive: true },
  { id: "dinner-hopping", title: "DINNER HOPPING", body: "DinnerHopping serviert kulinarische Erlebnisse an Bord eines klassischen Oldtimer US School Bus – Bavarian Soul trifft American Street Food. Eine unvergessliche Nacht auf Rädern durch München.", image: "", href: "https://dinnerhopping.eu/", bgColor: "#a9d3a1", frameColor: "#F6BBD1", textColor: "#000000", isActive: true, kind: "bus" },
];

export function normalizeAboutCards(cards: AboutCard[]) {
  return cards
    .filter((card) => card && typeof card === "object")
    .map((card, index) => {
      const fallback = defaultAboutCards.find((candidate) => candidate.id === card.id) ?? defaultAboutCards[index];
      const hasFrameColor = typeof card.frameColor === "string";
      return {
        ...(fallback ?? {}),
        ...card,
        bgColor: hasFrameColor ? card.bgColor : (fallback?.bgColor ?? card.bgColor),
        frameColor: hasFrameColor ? card.frameColor : card.bgColor,
      };
    });
}

export const defaultNavigationSections = [
  { key: "hero", name: "Hero", target: "section-1" },
  { key: "about", name: "About", target: "section-2" },
  { key: "menu", name: "Menu", target: "section-3" },
  { key: "welcome", name: "Welcome", target: "section-5" },
  { key: "footer", name: "Footer", target: "footer" },
] as const;

export const defaultNavigationItems = [
  { id: "about", label: "About Us", type: "section", target: "about", newTab: false },
  { id: "menu", label: "Menu", type: "external", target: "https://eat.allo.restaurant/restaurant/bun-munich", newTab: true },
  { id: "reservation", label: "Reservation", type: "external", target: "https://reservations.allo.restaurant/de/bun-munich", newTab: true },
] as const;

export const defaultWebsiteSectionOrder = ["Hero", "Navigation", "About", "Menu", "Welcome", "Footer", "Messages"] as const;

export const cmsFields: CmsFieldDefinition[] = [
  { key: "homepage.hero.title", label: "Opening title", section: "Hero", type: "multiline-title", defaultValue: "ASIAN\nAMERICAN\nKITCHEN" },
  { key: "homepage.hero.logo", label: "Main logo", section: "Hero", type: "image", defaultValue: "/mlem-assets/bun-logo-03-cropped.webp" },
  { key: "homepage.story.logo", label: "Story logo", section: "Hero", type: "image", defaultValue: "/mlem-assets/bun-logo-03-cropped.webp" },
  { key: "homepage.nav.about.label", label: "About link label", section: "Navigation", type: "text", defaultValue: "About Us" },
  { key: "homepage.nav.menu.label", label: "Menu link label", section: "Navigation", type: "text", defaultValue: "Menu" },
  { key: "homepage.nav.menu.href", label: "Menu link", section: "Navigation", type: "url", defaultValue: "https://eat.allo.restaurant/restaurant/bun-munich" },
  { key: "homepage.nav.reservation.label", label: "Reservation link label", section: "Navigation", type: "text", defaultValue: "Reservation" },
  { key: "homepage.nav.reservation.href", label: "Reservation link", section: "Navigation", type: "url", defaultValue: "https://reservations.allo.restaurant/de/bun-munich" },
  { key: "homepage.nav.items", label: "Navigation menus", section: "Navigation", type: "text", defaultValue: JSON.stringify(defaultNavigationItems) },
  { key: "homepage.nav.sections", label: "Section naming convention", section: "Navigation", type: "text", defaultValue: JSON.stringify(defaultNavigationSections) },
  { key: "homepage.section.order", label: "Website section order", section: "Navigation", type: "text", defaultValue: JSON.stringify(defaultWebsiteSectionOrder) },

  { key: "homepage.about.1.title", label: "Card 1 title", section: "About", type: "text", defaultValue: "BUN" },
  { key: "homepage.about.cards", label: "About cards", section: "About", type: "text", defaultValue: JSON.stringify(defaultAboutCards) },
  { key: "homepage.about.1.body", label: "Card 1 text", section: "About", type: "textarea", defaultValue: "Unsere Buns und Sandwichbrote werden von sorgfältig ausgewählten Bäckereien handwerklich hergestellt, mit hochwertigen Zutaten und viel Liebe zum Detail." },
  { key: "homepage.about.1.image", label: "Card 1 image", section: "About", type: "image", defaultValue: "/mlem-assets/baos-1.webp" },
  { key: "homepage.about.2.title", label: "Card 2 title", section: "About", type: "text", defaultValue: "FLEISCH" },
  { key: "homepage.about.2.body", label: "Card 2 text", section: "About", type: "textarea", defaultValue: "Unser Halal-Fleisch beziehen wir täglich frisch vom Verdi Supermarkt. Dort wird streng auf zertifizierte Halal-Qualität, Frische und verantwortungsvolle Herkunft geachtet – für besten Geschmack und volle Transparenz." },
  { key: "homepage.about.2.image", label: "Card 2 image", section: "About", type: "image", defaultValue: "/mlem-assets/meat.webp" },
  { key: "homepage.about.3.title", label: "Card 3 title", section: "About", type: "text", defaultValue: "SALAT" },
  { key: "homepage.about.3.body", label: "Card 3 text", section: "About", type: "textarea", defaultValue: "Unser Gemüse beziehen wir frisch von ausgewählten Lieferanten. Knackige Qualität, intensive Aromen und vollen Geschmack." },
  { key: "homepage.about.3.image", label: "Card 3 image", section: "About", type: "image", defaultValue: "/mlem-assets/salad-and-tomato.webp" },
  { key: "homepage.about.4.title", label: "Card 4 title", section: "About", type: "text", defaultValue: "DINNER HOPPING" },
  { key: "homepage.about.4.href", label: "Card 4 link", section: "About", type: "url", defaultValue: "https://dinnerhopping.eu/" },
  { key: "homepage.about.4.body", label: "Card 4 text", section: "About", type: "textarea", defaultValue: "DinnerHopping serviert kulinarische Erlebnisse an Bord eines klassischen Oldtimer US School Bus – Bavarian Soul trifft American Street Food. Eine unvergessliche Nacht auf Rädern durch München." },

  { key: "homepage.menu.title", label: "Menu heading", section: "Menu", type: "text", defaultValue: "MENU" },
  { key: "homepage.menu.pickup.label", label: "Pickup CTA label", section: "Menu", type: "text", defaultValue: "PICK UP ORDER & MENU" },
  { key: "homepage.menu.pickup.href", label: "Pickup link", section: "Menu", type: "url", defaultValue: "https://eat.allo.restaurant/restaurant/bun-munich" },
  { key: "homepage.menu.reservation.label", label: "Reservation CTA label", section: "Menu", type: "text", defaultValue: "RESERVATION" },
  { key: "homepage.menu.reservation.href", label: "Reservation link", section: "Menu", type: "url", defaultValue: "https://reservations.allo.restaurant/de/bun-munich" },

  { key: "homepage.welcome.title", label: "Welcome heading", section: "Welcome", type: "text", defaultValue: "WELLCOME" },
  { key: "homepage.welcome.1", label: "Welcome paragraph 1", section: "Welcome", type: "textarea", defaultValue: "Willkommen bei BUN – dem Ort, an dem amerikanische Streetfood-Klassiker auf moderne asiatische Aromen treffen." },
  { key: "homepage.welcome.2", label: "Welcome paragraph 2", section: "Welcome", type: "textarea", defaultValue: "Unser Restaurant in der Münchner Karlstraße ist aus einer einfachen Idee entstanden: Wir wollten das Beste aus zwei kulinarischen Welten verbinden und ein Food-Erlebnis schaffen, das überraschend, mutig und einfach richtig lecker ist." },
  { key: "homepage.welcome.3", label: "Welcome paragraph 3", section: "Welcome", type: "textarea", defaultValue: "Wir arbeiten täglich mit frischen, hochwertigen Zutaten und entwickeln unsere Gerichte mit viel Leidenschaft – von unseren saftigen Fusion-Burgern und Philly Cheese Steaks bis hin zu fluffigen Baos, knusprigem Fried Chicken. Jedes Gericht erzählt ein Stück unserer eigenen Food-Reise und wird mit größter Sorgfalt zubereitet." },
  { key: "homepage.welcome.4", label: "Welcome paragraph 4", section: "Welcome", type: "textarea", defaultValue: "BUN ist mehr als nur ein Restaurant – es ist ein Ort zum Ankommen, Genießen und Teilen. Egal ob schneller Lunch, entspanntes Dinner oder ein Besuch mit Freunden: Wir wollen, dass ihr euch bei uns wohlfühlt und mit einem Lächeln nach Hause geht." },
  { key: "homepage.welcome.5", label: "Welcome paragraph 5", section: "Welcome", type: "textarea", defaultValue: "Authentisch. Kreativ. Fusion aus Leidenschaft." },
  { key: "homepage.welcome.6", label: "Welcome paragraph 6", section: "Welcome", type: "textarea", defaultValue: "Wir freuen uns darauf, euch bei uns willkommen zu heißen!" },

  { key: "homepage.footer.pickup.label", label: "Footer pickup label", section: "Footer", type: "text", defaultValue: "PICK UP ORDER & MENU" },
  { key: "homepage.footer.pickup.href", label: "Footer pickup link", section: "Footer", type: "url", defaultValue: "https://eat.allo.restaurant/restaurant/bun-munich" },
  { key: "homepage.footer.reservation.label", label: "Footer reservation label", section: "Footer", type: "text", defaultValue: "RESERVATION" },
  { key: "homepage.footer.reservation.href", label: "Footer reservation link", section: "Footer", type: "url", defaultValue: "https://reservations.allo.restaurant/de/bun-munich" },
  { key: "homepage.footer.impressum.label", label: "Impressum label", section: "Footer", type: "text", defaultValue: "IMPRESSUM" },
  { key: "homepage.footer.impressum.href", label: "Impressum link", section: "Footer", type: "url", defaultValue: "#" },
  { key: "homepage.footer.datenschutz.label", label: "Datenschutz label", section: "Footer", type: "text", defaultValue: "DATENSCHUTZ" },
  { key: "homepage.footer.datenschutz.href", label: "Datenschutz link", section: "Footer", type: "url", defaultValue: "#" },
  { key: "homepage.narrator.section1", label: "Opening message", section: "Messages", type: "textarea", defaultValue: "Hallo! Ich begleite dich heute durch unsere Reise! 👋" },
  { key: "homepage.narrator.section2", label: "About message", section: "Messages", type: "textarea", defaultValue: "Das sind die Zutaten für den perfekten Burger! 🥬" },
  { key: "homepage.narrator.section3", label: "Menu message", section: "Messages", type: "textarea", defaultValue: "Unsere Karte ist vielseitig — und alles ist richtig lecker! 😋" },
  { key: "homepage.narrator.section5", label: "Welcome message", section: "Messages", type: "textarea", defaultValue: "Wir freuen uns, dich bei uns im Restaurant willkommen zu heißen! 🙏" },
  { key: "homepage.narrator.footer", label: "Footer message", section: "Messages", type: "textarea", defaultValue: "Danke für deinen Besuch! Bis bald! 🎉" },

  { key: "homepage.footer.left", label: "Perspective left word", section: "Footer", type: "text", defaultValue: "Asian" },
  { key: "homepage.footer.center", label: "Perspective center word", section: "Footer", type: "text", defaultValue: "x" },
  { key: "homepage.footer.right", label: "Perspective right word", section: "Footer", type: "text", defaultValue: "American" },
];

export const cmsDefaults = Object.fromEntries(
  cmsFields.map((field) => [field.key, field.defaultValue]),
) as Record<string, string>;
