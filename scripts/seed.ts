import * as db from "../src/lib/db";

// Datos de ejemplo alineados al mockup de marca: El Túnel, K'mina Club,
// El Galpón y Bunker, cada uno con su color/identidad propia.

function inDays(days: number, hour = 23) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
}

db.resetAndSeed((h) => {
  const elTunel = h.createTenant({
    name: "El Túnel",
    city: "La Plata",
    description:
      "El clásico de la cumbia, con toda la onda de los 90's y 2000's. Un boliche mítico, con la mejor música, ambiente y gente linda.",
    accentColor: "#FF2E93",
    amenities: ["Cumbia 90's/2000's", "Bailable", "Bar", "Estacionamiento"],
  });
  h.addUser(elTunel.id, "Romina Gómez", "romina@eltunel.com", "admin");

  const kmina = h.createTenant({
    name: "K'mina Club",
    city: "La Plata",
    description: "Cumbia total y reggaetón clásico, todos los viernes. El after de los sábados de La Plata.",
    accentColor: "#FFD400",
    amenities: ["Cumbia Total", "Bailable", "Bar"],
  });
  h.addUser(kmina.id, "Diego Cabral", "diego@kmina.com", "admin");

  const elGalpon = h.createTenant({
    name: "El Galpón",
    city: "Berisso",
    description: "Cumbia sin límites: el salón más grande de la zona, shows en vivo todos los fines de semana.",
    accentColor: "#22E1E1",
    amenities: ["Cumbia sin límites", "Bailable", "Bar", "Estacionamiento"],
  });
  h.addUser(elGalpon.id, "Marisa Ledesma", "marisa@elgalpon.com", "admin");

  const bunker = h.createTenant({
    name: "Bunker",
    city: "Ensenada",
    description: "Cumbia y cuarteto en el boliche under de Ensenada. La fiesta de tu vida, todos los fines de semana.",
    accentColor: "#8B2FF2",
    amenities: ["Cumbia/Cuarteto", "Bailable", "Bar"],
  });
  h.addUser(bunker.id, "Nahuel Torres", "nahuel@bunker.com", "admin");

  const show1 = h.createShowWithArtists({
    tenantId: elTunel.id,
    title: "La Rumba",
    date: inDays(4, 23),
    capacity: 300,
    ticketPrice: 8000,
    artistNames: ["Los Reyes del Ritmo", "DJ Fierro"],
    genre: "Cumbia 90's/2000's",
  });

  const show2 = h.createShowWithArtists({
    tenantId: elTunel.id,
    title: "Cumbia Time",
    date: inDays(11, 23),
    capacity: 300,
    ticketPrice: 8500,
    artistNames: ["La Tropa Cumbiera"],
    genre: "Cumbia 90's/2000's",
  });

  h.createShowWithArtists({
    tenantId: elTunel.id,
    title: "Cumbia Nostalgia",
    date: inDays(28, 23),
    capacity: 350,
    ticketPrice: 9000,
    artistNames: ["Los Reyes del Ritmo"],
    genre: "Cumbia 90's/2000's",
  });

  const show3 = h.createShowWithArtists({
    tenantId: kmina.id,
    title: "La K'mina",
    date: inDays(6, 0),
    capacity: 220,
    ticketPrice: 6000,
    artistNames: ["Grupo Fuego Sur"],
    genre: "Cumbia/Reggaetón clásico",
  });

  const show4 = h.createShowWithArtists({
    tenantId: elGalpon.id,
    title: "El Galpón · Cumbia sin límites",
    date: inDays(14, 23),
    capacity: 400,
    ticketPrice: 7500,
    artistNames: ["Cumbia Real Show", "Los Auténticos del Barrio"],
    genre: "Cumbia sin límites",
  });

  const show5 = h.createShowWithArtists({
    tenantId: bunker.id,
    title: "La Fiesta de tu Vida",
    date: inDays(20, 0),
    capacity: 250,
    ticketPrice: 7000,
    artistNames: ["Los Herederos"],
    genre: "Cumbia/Cuarteto",
  });

  h.createReservation({
    tenantId: elTunel.id,
    showId: show1.id,
    customerName: "Micaela Fernández",
    customerPhone: "+54 221 555-0142",
    quantity: 2,
  });
  h.createReservation({
    tenantId: elTunel.id,
    showId: show1.id,
    customerName: "Julián Pérez",
    customerPhone: "+54 221 555-0198",
    quantity: 4,
  });
  h.createReservation({
    tenantId: elTunel.id,
    showId: show2.id,
    customerName: "Sofía Ríos",
    customerPhone: "+54 221 555-0177",
    quantity: 3,
  });
  h.createReservation({
    tenantId: kmina.id,
    showId: show3.id,
    customerName: "Bruno Alsina",
    customerPhone: "+54 221 555-0133",
    quantity: 2,
  });
  h.createReservation({
    tenantId: elGalpon.id,
    showId: show4.id,
    customerName: "Nahuel Aramburu",
    customerPhone: "+54 221 555-0111",
    quantity: 2,
  });
  h.createReservation({
    tenantId: bunker.id,
    showId: show5.id,
    customerName: "Marisa Ledesma",
    customerPhone: "+54 221 555-0155",
    quantity: 5,
  });

  h.createGuest({
    tenantId: elTunel.id,
    showId: show1.id,
    name: "Bruno (staff sonido)",
    plusOnes: 1,
  });
  h.createGuest({
    tenantId: kmina.id,
    showId: show3.id,
    name: "Grupo Fuego Sur (managers)",
    plusOnes: 3,
  });
  h.createGuest({
    tenantId: elGalpon.id,
    showId: show4.id,
    name: "Marisa (dueña)",
    plusOnes: 1,
  });
  h.createGuest({
    tenantId: bunker.id,
    showId: show5.id,
    name: "Prensa Ensenada",
    plusOnes: 2,
  });
});

console.log("Seed completo: 4 boliches (El Túnel, K'mina Club, El Galpón, Bunker) con shows, reservas y listas de invitados.");
