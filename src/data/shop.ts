export const shop = {
  name: "Rasa Bonaire",
  tagline: "Indonesian kitchen, island hours",
  street: "Kaya Grandi 24",
  city: "Kralendijk, Bonaire",
  phone: "+599 717 0240",
  whatsapp: "+599 780 1188",
  emailOrders: "orders@rasabonaire.com",
  openingHours: [
    { days: "Monday, Tuesday", hours: "closed — we shop and prep" },
    { days: "Wednesday to Friday", hours: "17:00 – 21:30" },
    { days: "Saturday, Sunday", hours: "12:00 – 21:30" },
  ],
  preorderClosesAt: 15,
  serviceZones: [
    { id: "kralendijk", name: "Kralendijk centre", feeCents: 350 },
    { id: "nikiboko", name: "Nikiboko / Tera Kora", feeCents: 450 },
    { id: "hato", name: "Hato / Sabadeco", feeCents: 650 },
    { id: "rincon", name: "Rincon", feeCents: 750 },
  ],
};

export const story = {
  heading: "We cook in batches. When a pan is empty, that dish is off for the night.",
  body: [
    "Yanti takes the wok and grinds the peanut sauce at seven in the morning, before the island heat arrives. Ordering happens here, in advance — that is the whole point. We cook in batches, not from a freezer, so we know exactly how much rendang to braise and how many sticks of sate to skewer.",
    "Bonaire gave us the second half of the menu: funchi fried in butter, keshi yena straight from the oven, pastechi filled to the edge. Two kitchens on one island, both of them ours.",
  ],
};

export const reviews = [
  {
    name: "Marisol Croes",
    place: "Kralendijk",
    text: "Ordered the rendang for six people at 11:00 and picked it up at 18:00. Still hot, still dry the way it should be. The sambal ijo is not a joke.",
  },
  {
    name: "Daan Winklaar",
    place: "Rincon",
    text: "The preorder slot is what sold me. No queue at the door, food is packed when I get there, kid gets his sate without waiting.",
  },
  {
    name: "Sofie Bakker",
    place: "Hato",
    text: "Keshi yena on a Friday, funchi on a Sunday. I have stopped cooking on weekends. Delivery came up to Sabadeco in twenty minutes.",
  },
];

export const faqs = [
  {
    q: "How does preordering work?",
    a: "Pick your dishes, choose the batch slot, pay online, then collect at Kaya Grandi 24 inside your slot. We only cook what was ordered, so everything is made the same afternoon. Preorder closes at 15:00 for the same evening.",
  },
  {
    q: "What if I miss my slot?",
    a: "Your food stays in the warmer for 30 minutes and we call the number on the order. After that it goes to the staff table, and we would rather not let rendang go to waste.",
  },
  {
    q: "Can I pay in cash?",
    a: "Yes, choose cash on pickup. The order is confirmed but only marked paid when the counter takes your money.",
  },
  {
    q: "Is there anything for people who do not eat meat?",
    a: "Gado-gado, tempeh mendoan, bakwan jagung, funchi baka and both sweets are vegetarian. Say so in the order note and we keep the shrimp paste out of the sambal.",
  },
];
