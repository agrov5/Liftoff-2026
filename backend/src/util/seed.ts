import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Element from '../models/Element';
import Compound from '../models/Compound';
import Lesson from '../models/Lesson';

dotenv.config();

const ELEMENTS = [
  {
    atomicNumber: 1,
    symbol: 'H',
    name: 'Hydrogen',
    atomicMass: 1.008,
    category: 'nonmetal',
    period: 1,
    group: 1,
    block: 's',
    bohrShells: [{ shell: 1, electrons: 1 }],
    protons: 1,
    neutrons: 0,
    electrons: 1,
    electronegativity: 2.2,
    meltingPoint: 13.99,
    boilingPoint: 20.271,
    density: 0.00008988,
    discoveredBy: 'Henry Cavendish',
    discoveryYear: 1766,
    standardState: 'gas',
    earthExamples: [
      {
        name: 'Water',
        description: 'Hydrogen is a key part of water (H₂O), found in every ocean, river, and raindrop on Earth.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Stilles_Mineralwasser.jpg/800px-Stilles_Mineralwasser.jpg',
      },
      {
        name: 'The Sun',
        description: 'The Sun is 74% hydrogen by mass. Nuclear fusion of hydrogen powers all the light and heat Earth receives.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg/800px-The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg',
      },
    ],
    elementImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Hydrogenglow.jpg/800px-Hydrogenglow.jpg',
    funFact: 'Hydrogen is the lightest and most abundant element in the universe!',
    englishWords: ['water', 'ocean', 'sun', 'light', 'fuel', 'gas', 'bubble'],
    pronunciationAudio: '',
  },
  {
    atomicNumber: 2,
    symbol: 'He',
    name: 'Helium',
    atomicMass: 4.0026,
    category: 'noble gas',
    period: 1,
    group: 18,
    block: 's',
    bohrShells: [{ shell: 1, electrons: 2 }],
    protons: 2,
    neutrons: 2,
    electrons: 2,
    electronegativity: null,
    meltingPoint: null,
    boilingPoint: 4.222,
    density: 0.0001638,
    discoveredBy: 'Pierre Janssen',
    discoveryYear: 1868,
    standardState: 'gas',
    earthExamples: [
      {
        name: 'Balloons',
        description: 'Helium fills balloons and makes them float because it is lighter than air.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Helium_balloons.jpg/800px-Helium_balloons.jpg',
      },
      {
        name: 'MRI Machines',
        description: 'Liquid helium cools the superconducting magnets inside MRI machines used in hospitals.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/MRI_Scanner.jpg/800px-MRI_Scanner.jpg',
      },
    ],
    elementImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Helium_spectra.jpg/800px-Helium_spectra.jpg',
    funFact: 'Helium is so light it can escape Earth\'s gravity and float into space!',
    englishWords: ['balloon', 'float', 'light', 'hospital', 'cool', 'party'],
    pronunciationAudio: '',
  },
  {
    atomicNumber: 6,
    symbol: 'C',
    name: 'Carbon',
    atomicMass: 12.011,
    category: 'nonmetal',
    period: 2,
    group: 14,
    block: 'p',
    bohrShells: [{ shell: 1, electrons: 2 }, { shell: 2, electrons: 4 }],
    protons: 6,
    neutrons: 6,
    electrons: 6,
    electronegativity: 2.55,
    meltingPoint: 3823,
    boilingPoint: 4098,
    density: 2.26,
    discoveredBy: 'Ancient',
    discoveryYear: null,
    standardState: 'solid',
    earthExamples: [
      {
        name: 'Diamond',
        description: 'Pure carbon atoms arranged in a crystal lattice form diamond — the hardest natural material.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Diamond_and_graphite2.jpg/800px-Diamond_and_graphite2.jpg',
      },
      {
        name: 'Graphite (Pencils)',
        description: 'The grey writing material in pencils is graphite, another form of pure carbon.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/GraphiteUSGOV.jpg/800px-GraphiteUSGOV.jpg',
      },
      {
        name: 'Coal',
        description: 'Coal is mostly carbon and has been used as fuel for thousands of years.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Coal_anthracite.jpg/800px-Coal_anthracite.jpg',
      },
    ],
    elementImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Diamond_and_graphite2.jpg/800px-Diamond_and_graphite2.jpg',
    funFact: 'Carbon is the basis of all life on Earth. Every living thing is built from carbon!',
    englishWords: ['diamond', 'pencil', 'coal', 'fire', 'hard', 'life', 'black'],
    pronunciationAudio: '',
  },
  {
    atomicNumber: 7,
    symbol: 'N',
    name: 'Nitrogen',
    atomicMass: 14.007,
    category: 'nonmetal',
    period: 2,
    group: 15,
    block: 'p',
    bohrShells: [{ shell: 1, electrons: 2 }, { shell: 2, electrons: 5 }],
    protons: 7,
    neutrons: 7,
    electrons: 7,
    electronegativity: 3.04,
    meltingPoint: 63.15,
    boilingPoint: 77.355,
    density: 0.001145,
    discoveredBy: 'Daniel Rutherford',
    discoveryYear: 1772,
    standardState: 'gas',
    earthExamples: [
      {
        name: 'Air',
        description: '78% of Earth\'s air is nitrogen gas. Every breath you take is mostly nitrogen!',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Earth_from_Space.jpg/800px-Earth_from_Space.jpg',
      },
      {
        name: 'Fertilizer',
        description: 'Nitrogen is essential for plant growth. Farmers add nitrogen-rich fertilizer to soil.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Farmer_plowing_field.jpg/800px-Farmer_plowing_field.jpg',
      },
    ],
    elementImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Nitrogen_gas_wikipedia.jpg/800px-Nitrogen_gas_wikipedia.jpg',
    funFact: 'Liquid nitrogen is so cold (-196°C) it can freeze almost anything instantly!',
    englishWords: ['air', 'breath', 'sky', 'plant', 'grow', 'cold', 'freeze'],
    pronunciationAudio: '',
  },
  {
    atomicNumber: 8,
    symbol: 'O',
    name: 'Oxygen',
    atomicMass: 15.999,
    category: 'nonmetal',
    period: 2,
    group: 16,
    block: 'p',
    bohrShells: [{ shell: 1, electrons: 2 }, { shell: 2, electrons: 6 }],
    protons: 8,
    neutrons: 8,
    electrons: 8,
    electronegativity: 3.44,
    meltingPoint: 54.36,
    boilingPoint: 90.188,
    density: 0.001429,
    discoveredBy: 'Carl Wilhelm Scheele',
    discoveryYear: 1771,
    standardState: 'gas',
    earthExamples: [
      {
        name: 'Breathing',
        description: 'Humans and most animals need oxygen to survive. We breathe it from the air every second.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Nidhi_Suresh.jpg/800px-Nidhi_Suresh.jpg',
      },
      {
        name: 'Fire',
        description: 'Oxygen feeds fire. Without oxygen, flames go out.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Campfire_at_Big_Meadows_Campground.jpg/800px-Campfire_at_Big_Meadows_Campground.jpg',
      },
      {
        name: 'Rust',
        description: 'When iron meets oxygen and water, it forms rust — a red-brown coating on metal.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Rust3.jpg/800px-Rust3.jpg',
      },
    ],
    elementImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Liquid_oxygen_in_a_beaker.jpg/800px-Liquid_oxygen_in_a_beaker.jpg',
    funFact: 'Oxygen makes up 21% of Earth\'s air and nearly half of Earth\'s crust by mass!',
    englishWords: ['breathe', 'fire', 'rust', 'air', 'burn', 'alive', 'blue'],
    pronunciationAudio: '',
  },
  {
    atomicNumber: 11,
    symbol: 'Na',
    name: 'Sodium',
    atomicMass: 22.99,
    category: 'alkali metal',
    period: 3,
    group: 1,
    block: 's',
    bohrShells: [{ shell: 1, electrons: 2 }, { shell: 2, electrons: 8 }, { shell: 3, electrons: 1 }],
    protons: 11,
    neutrons: 12,
    electrons: 11,
    electronegativity: 0.93,
    meltingPoint: 370.944,
    boilingPoint: 1156.09,
    density: 0.968,
    discoveredBy: 'Humphry Davy',
    discoveryYear: 1807,
    standardState: 'solid',
    earthExamples: [
      {
        name: 'Table Salt',
        description: 'Table salt (NaCl) is sodium chloride. Sodium gives salt its flavour and is used in cooking worldwide.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Salt_shaker_on_white_background.jpg/800px-Salt_shaker_on_white_background.jpg',
      },
      {
        name: 'Ocean Water',
        description: 'The ocean is salty because it contains dissolved sodium chloride.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Oceanwater.jpg/800px-Oceanwater.jpg',
      },
    ],
    elementImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Na_%28Sodium%29.jpg/800px-Na_%28Sodium%29.jpg',
    funFact: 'Pure sodium metal explodes violently when it touches water!',
    englishWords: ['salt', 'ocean', 'cook', 'flavour', 'salty', 'food', 'sea'],
    pronunciationAudio: '',
  },
  {
    atomicNumber: 26,
    symbol: 'Fe',
    name: 'Iron',
    atomicMass: 55.845,
    category: 'transition metal',
    period: 4,
    group: 8,
    block: 'd',
    bohrShells: [
      { shell: 1, electrons: 2 },
      { shell: 2, electrons: 8 },
      { shell: 3, electrons: 14 },
      { shell: 4, electrons: 2 },
    ],
    protons: 26,
    neutrons: 30,
    electrons: 26,
    electronegativity: 1.83,
    meltingPoint: 1811,
    boilingPoint: 3134,
    density: 7.874,
    discoveredBy: 'Ancient',
    discoveryYear: null,
    standardState: 'solid',
    earthExamples: [
      {
        name: 'Steel Bridges',
        description: 'Iron is the main component of steel, used to build bridges, buildings, and vehicles.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/GoldenGateBridge-001.jpg/800px-GoldenGateBridge-001.jpg',
      },
      {
        name: 'Earth\'s Core',
        description: 'Earth\'s core is made mostly of iron and nickel. Iron is the most abundant element on Earth by mass.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Internal_structure_of_Earth.jpg/800px-Internal_structure_of_Earth.jpg',
      },
      {
        name: 'Blood',
        description: 'Iron in haemoglobin gives blood its red colour and carries oxygen around the body.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Blood_drop.jpg/800px-Blood_drop.jpg',
      },
    ],
    elementImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Iron_electrolytic_and_1cm3_cube.jpg/800px-Iron_electrolytic_and_1cm3_cube.jpg',
    funFact: 'Iron makes up 5% of Earth\'s crust and is the most used metal in human civilization!',
    englishWords: ['bridge', 'metal', 'strong', 'blood', 'red', 'build', 'core', 'heavy'],
    pronunciationAudio: '',
  },
  {
    atomicNumber: 79,
    symbol: 'Au',
    name: 'Gold',
    atomicMass: 196.967,
    category: 'transition metal',
    period: 6,
    group: 11,
    block: 'd',
    bohrShells: [
      { shell: 1, electrons: 2 },
      { shell: 2, electrons: 8 },
      { shell: 3, electrons: 18 },
      { shell: 4, electrons: 32 },
      { shell: 5, electrons: 18 },
      { shell: 6, electrons: 1 },
    ],
    protons: 79,
    neutrons: 118,
    electrons: 79,
    electronegativity: 2.54,
    meltingPoint: 1337.33,
    boilingPoint: 3243,
    density: 19.3,
    discoveredBy: 'Ancient',
    discoveryYear: null,
    standardState: 'solid',
    earthExamples: [
      {
        name: 'Jewellery',
        description: 'Gold is prized for jewellery worldwide because it is shiny, rare, and does not rust.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Gold_ring.jpg/800px-Gold_ring.jpg',
      },
      {
        name: 'Electronics',
        description: 'Gold is used in phone and computer connectors because it conducts electricity and never corrodes.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Gold_circuit_board.jpg/800px-Gold_circuit_board.jpg',
      },
    ],
    elementImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Gold-crystals.jpg/800px-Gold-crystals.jpg',
    funFact: 'All the gold ever mined in history would fit in a cube about 21 metres on each side!',
    englishWords: ['gold', 'shiny', 'rare', 'jewel', 'ring', 'rich', 'yellow', 'valuable'],
    pronunciationAudio: '',
  },
];

const COMPOUNDS = [
  {
    formula: 'H2O',
    name: 'Water',
    commonName: 'Water',
    elements: [{ symbol: 'H', count: 2 }, { symbol: 'O', count: 1 }],
    molecularWeight: 18.015,
    description: 'Water is the most essential compound for life on Earth. It covers 71% of the planet\'s surface.',
    uses: ['drinking', 'cooking', 'agriculture', 'industry', 'transportation'],
    earthExamples: [
      {
        name: 'Oceans',
        description: 'Earth\'s oceans contain 96.5% of all water on the planet.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Oceanwater.jpg/800px-Oceanwater.jpg',
        earthLocation: 'Pacific Ocean',
      },
      {
        name: 'Rain',
        description: 'Rain is water that evaporates from oceans and falls back to Earth.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/800px-The_Earth_seen_from_Apollo_17.jpg',
        earthLocation: 'Global',
      },
    ],
    compoundImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Stilles_Mineralwasser.jpg/800px-Stilles_Mineralwasser.jpg',
    modelImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Water_molecule_3D.svg/800px-Water_molecule_3D.svg',
    meltingPoint: 273.15,
    boilingPoint: 373.15,
    isSafe: true,
    warningLabel: null,
    englishWords: ['drink', 'wet', 'liquid', 'ocean', 'rain', 'swim', 'thirsty'],
    difficulty: 'beginner',
  },
  {
    formula: 'CO2',
    name: 'Carbon Dioxide',
    commonName: 'Carbon Dioxide',
    elements: [{ symbol: 'C', count: 1 }, { symbol: 'O', count: 2 }],
    molecularWeight: 44.01,
    description: 'Carbon dioxide is a colourless gas exhaled by animals and absorbed by plants. It is a key greenhouse gas.',
    uses: ['fire extinguishers', 'carbonated drinks', 'dry ice', 'plant growth', 'food preservation'],
    earthExamples: [
      {
        name: 'Fizzy Drinks',
        description: 'Carbon dioxide dissolved in water creates bubbles in fizzy drinks like soda.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Sparkling_water.jpg/800px-Sparkling_water.jpg',
        earthLocation: 'Worldwide',
      },
      {
        name: 'Dry Ice',
        description: 'Solid CO₂ is called dry ice. It skips the liquid stage and goes straight to gas.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Dry_ice_pellets.jpg/800px-Dry_ice_pellets.jpg',
        earthLocation: 'Industrial',
      },
    ],
    compoundImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Sparkling_water.jpg/800px-Sparkling_water.jpg',
    modelImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Carbon_dioxide_3D_ball.png/800px-Carbon_dioxide_3D_ball.png',
    meltingPoint: null,
    boilingPoint: 194.65,
    isSafe: true,
    warningLabel: 'Can displace oxygen in confined spaces',
    englishWords: ['breathe', 'fizzy', 'bubble', 'exhale', 'plant', 'greenhouse', 'cold'],
    difficulty: 'beginner',
  },
  {
    formula: 'NaCl',
    name: 'Sodium Chloride',
    commonName: 'Table Salt',
    elements: [{ symbol: 'Na', count: 1 }, { symbol: 'Cl', count: 1 }],
    molecularWeight: 58.44,
    description: 'Table salt is one of the oldest and most important food flavourings and preservatives in human history.',
    uses: ['cooking', 'food preservation', 'medicine', 'de-icing roads', 'chemistry'],
    earthExamples: [
      {
        name: 'Sea Water',
        description: 'Ocean water is salty because it contains dissolved sodium chloride.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Oceanwater.jpg/800px-Oceanwater.jpg',
        earthLocation: 'Oceans worldwide',
      },
      {
        name: 'Salt Mines',
        description: 'Massive underground deposits of salt are mined around the world.',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Wieliczka_salt_mine.jpg/800px-Wieliczka_salt_mine.jpg',
        earthLocation: 'Wieliczka, Poland',
      },
    ],
    compoundImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Salt_shaker_on_white_background.jpg/800px-Salt_shaker_on_white_background.jpg',
    modelImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Sodium-chloride-3D-ionic.png/800px-Sodium-chloride-3D-ionic.png',
    meltingPoint: 1073.8,
    boilingPoint: 1738,
    isSafe: true,
    warningLabel: null,
    englishWords: ['salt', 'salty', 'flavour', 'cook', 'food', 'season', 'white', 'crystal'],
    difficulty: 'beginner',
  },
];

async function seed(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/periodic-language';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB for seeding...');

  await Element.deleteMany({});
  await Compound.deleteMany({});
  await Lesson.deleteMany({});

  const insertedElements = await Element.insertMany(ELEMENTS);
  console.log(`Seeded ${insertedElements.length} elements`);

  const insertedCompounds = await Compound.insertMany(COMPOUNDS);
  console.log(`Seeded ${insertedCompounds.length} compounds`);

  // Create lessons for the first three elements (H, He, C)
  const lessons = [];
  const elementSymbols = ['H', 'He', 'C'];

  for (let i = 0; i < elementSymbols.length; i++) {
    const sym = elementSymbols[i];
    const el = insertedElements.find((e) => e.symbol === sym);
    if (!el) continue;

    const relatedCompounds = insertedCompounds.filter((c) =>
      c.elements.some((ce) => ce.symbol === sym)
    );

    lessons.push({
      elementSymbol: sym,
      elementRef: el._id,
      title: `Lesson ${el.atomicNumber}: ${el.name}`,
      subtitle: `Learn English through the power of ${el.name}!`,
      lessonOrder: el.atomicNumber,
      difficulty: 'beginner' as const,
      estimatedMinutes: 10,
      xpReward: 100,
      compoundRefs: relatedCompounds.map((c) => c._id),
      learningObjectives: [
        `Understand what ${el.name} is and where it exists on Earth`,
        `Learn English words related to ${el.name}`,
        `Identify the Bohr-Rutherford model of ${el.name}`,
        `Recognize compounds containing ${el.name}`,
      ],
      vocabulary: el.englishWords.slice(0, 5).map((word) => ({
        word,
        definition: `A word introduced through the element ${el.name}`,
        exampleSentence: `${el.name} helps us understand the word "${word}".`,
        partOfSpeech: 'noun',
        audioUrl: '',
        imageUrl: '',
      })),
      quizQuestions: [
        {
          question: `How many protons does ${el.name} have?`,
          type: 'multiple-choice' as const,
          options: [
            String(el.protons),
            String(el.protons + 1),
            String(el.protons + 2),
            String(el.protons - 1 < 0 ? el.protons + 3 : el.protons - 1),
          ],
          correctAnswer: String(el.protons),
          explanation: `${el.name} has ${el.protons} proton(s), which equals its atomic number.`,
          imageUrl: '',
          points: 10,
        },
        {
          question: `What is the chemical symbol for ${el.name}?`,
          type: 'multiple-choice' as const,
          options: [el.symbol, 'X', 'Z', 'Q'],
          correctAnswer: el.symbol,
          explanation: `The symbol for ${el.name} is ${el.symbol}.`,
          imageUrl: '',
          points: 10,
        },
        {
          question: `Which English word is related to ${el.name}?`,
          type: 'multiple-choice' as const,
          options: el.englishWords.slice(0, 4),
          correctAnswer: el.englishWords[0],
          explanation: `"${el.englishWords[0]}" is directly related to ${el.name}.`,
          imageUrl: '',
          points: 15,
        },
      ],
      isPublished: true,
    });
  }

  const insertedLessons = await Lesson.insertMany(lessons);
  console.log(`Seeded ${insertedLessons.length} lessons`);

  await mongoose.disconnect();
  console.log('Seeding complete!');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
