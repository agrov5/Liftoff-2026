import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Element from '../models/Element';
import Compound from '../models/Compound';
import Lesson from '../models/Lesson';

dotenv.config();

// Helper: convert flat shell array to bohrShells format
function shells(...counts: number[]) {
  return counts.map((electrons, i) => ({ shell: i + 1, electrons }));
}

// [atomicNumber, symbol, name, atomicMass, category, period, group|null, block, shellCounts[], protons, neutrons, electrons, electronegativity|null, meltingPoint|null, boilingPoint|null, density|null, standardState, funFact]
type RawElement = [
  number, string, string, number, string, number, number | null, string,
  number[], number, number, number,
  number | null, number | null, number | null, number | null,
  'solid' | 'liquid' | 'gas' | 'unknown', string
];

const RAW: RawElement[] = [
  [1,  'H',  'Hydrogen',      1.008,    'nonmetal',             1, 1,    's', [1],               1,   0,   1,  2.20,  13.99,    20.271,  8.988e-5,  'gas',     'Hydrogen is the most abundant element in the universe!'],
  [2,  'He', 'Helium',        4.0026,   'noble gas',            1, 18,   's', [2],               2,   2,   2,  null,  null,     4.222,   1.638e-4,  'gas',     'Helium is so light it can escape Earth\'s gravity!'],
  [3,  'Li', 'Lithium',       6.94,     'alkali metal',         2, 1,    's', [2,1],             3,   4,   3,  0.98,  453.65,   1603,    0.534,     'solid',   'Lithium powers the batteries in your phone and laptop!'],
  [4,  'Be', 'Beryllium',     9.0122,   'alkaline earth metal', 2, 2,    's', [2,2],             4,   5,   4,  1.57,  1560,     2742,    1.85,      'solid',   'Beryllium is used in X-ray windows because it\'s nearly transparent to X-rays!'],
  [5,  'B',  'Boron',         10.81,    'metalloid',            2, 13,   'p', [2,3],             5,   6,   5,  2.04,  2349,     4200,    2.34,      'solid',   'Boron is a key ingredient in Borax, used in laundry detergent!'],
  [6,  'C',  'Carbon',        12.011,   'nonmetal',             2, 14,   'p', [2,4],             6,   6,   6,  2.55,  3823,     4098,    2.26,      'solid',   'Carbon is the basis of all life on Earth!'],
  [7,  'N',  'Nitrogen',      14.007,   'nonmetal',             2, 15,   'p', [2,5],             7,   7,   7,  3.04,  63.15,    77.355,  1.145e-3,  'gas',     'Liquid nitrogen is so cold (-196°C) it can freeze almost anything instantly!'],
  [8,  'O',  'Oxygen',        15.999,   'nonmetal',             2, 16,   'p', [2,6],             8,   8,   8,  3.44,  54.36,    90.188,  1.429e-3,  'gas',     'Oxygen makes up 21% of Earth\'s air!'],
  [9,  'F',  'Fluorine',      18.998,   'nonmetal',             2, 17,   'p', [2,7],             9,  10,   9,  3.98,  53.48,    85.03,   1.696e-3,  'gas',     'Fluorine is the most reactive element — it attacks almost everything!'],
  [10, 'Ne', 'Neon',          20.18,    'noble gas',            2, 18,   'p', [2,8],            10,  10,  10,  null,  24.56,    27.104,  8.999e-4,  'gas',     'Neon signs glow orange-red when electricity passes through neon gas!'],
  [11, 'Na', 'Sodium',        22.99,    'alkali metal',         3, 1,    's', [2,8,1],          11,  12,  11,  0.93,  370.944, 1156.09,  0.968,     'solid',   'Pure sodium metal explodes violently when it touches water!'],
  [12, 'Mg', 'Magnesium',     24.305,   'alkaline earth metal', 3, 2,    's', [2,8,2],          12,  12,  12,  1.31,  923,     1363,    1.738,     'solid',   'Magnesium burns with a brilliant white flame used in fireworks!'],
  [13, 'Al', 'Aluminum',      26.982,   'post-transition metal',3, 13,   'p', [2,8,3],          13,  14,  13,  1.61,  933.47,  2743,    2.70,      'solid',   'Aluminum is the most abundant metal in Earth\'s crust!'],
  [14, 'Si', 'Silicon',       28.085,   'metalloid',            3, 14,   'p', [2,8,4],          14,  14,  14,  1.90,  1687,    3538,    2.329,     'solid',   'Silicon is the backbone of every computer chip ever made!'],
  [15, 'P',  'Phosphorus',    30.974,   'nonmetal',             3, 15,   'p', [2,8,5],          15,  16,  15,  2.19,  317.3,   553.65,  1.823,     'solid',   'Phosphorus is essential for DNA — every cell in your body contains it!'],
  [16, 'S',  'Sulfur',        32.06,    'nonmetal',             3, 16,   'p', [2,8,6],          16,  16,  16,  2.58,  388.36,  717.87,  2.067,     'solid',   'Sulfur gives rotten eggs and volcanoes their distinctive smell!'],
  [17, 'Cl', 'Chlorine',      35.45,    'nonmetal',             3, 17,   'p', [2,8,7],          17,  18,  17,  3.16,  171.6,   239.11,  3.214e-3,  'gas',     'Chlorine is used to purify drinking water around the world!'],
  [18, 'Ar', 'Argon',         39.948,   'noble gas',            3, 18,   'p', [2,8,8],          18,  22,  18,  null,  83.81,   87.302,  1.784e-3,  'gas',     'Argon fills most light bulbs to prevent the filament from burning!'],
  [19, 'K',  'Potassium',     39.098,   'alkali metal',         4, 1,    's', [2,8,8,1],        19,  20,  19,  0.82,  336.7,   1032,    0.862,     'solid',   'Potassium is essential for nerve signals — bananas are a great source!'],
  [20, 'Ca', 'Calcium',       40.078,   'alkaline earth metal', 4, 2,    's', [2,8,8,2],        20,  20,  20,  1.00,  1115,    1757,    1.55,      'solid',   'Calcium makes up your bones and teeth!'],
  [21, 'Sc', 'Scandium',      44.956,   'transition metal',     4, 3,    'd', [2,8,9,2],        21,  24,  21,  1.36,  1814,    3109,    2.985,     'solid',   'Scandium is used in high-intensity lighting and aerospace alloys!'],
  [22, 'Ti', 'Titanium',      47.867,   'transition metal',     4, 4,    'd', [2,8,10,2],       22,  26,  22,  1.54,  1941,    3560,    4.506,     'solid',   'Titanium is as strong as steel but 45% lighter!'],
  [23, 'V',  'Vanadium',      50.942,   'transition metal',     4, 5,    'd', [2,8,11,2],       23,  28,  23,  1.63,  2183,    3680,    6.11,      'solid',   'Vanadium steel is used in tools and springs for its toughness!'],
  [24, 'Cr', 'Chromium',      51.996,   'transition metal',     4, 6,    'd', [2,8,13,1],       24,  28,  24,  1.66,  2180,    2944,    7.19,      'solid',   'Chromium gives stainless steel its rust-resistance and shiny look!'],
  [25, 'Mn', 'Manganese',     54.938,   'transition metal',     4, 7,    'd', [2,8,13,2],       25,  30,  25,  1.55,  1519,    2334,    7.21,      'solid',   'Manganese is crucial for making steel strong and hard!'],
  [26, 'Fe', 'Iron',          55.845,   'transition metal',     4, 8,    'd', [2,8,14,2],       26,  30,  26,  1.83,  1811,    3134,    7.874,     'solid',   'Iron makes up Earth\'s entire core and gives blood its red colour!'],
  [27, 'Co', 'Cobalt',        58.933,   'transition metal',     4, 9,    'd', [2,8,15,2],       27,  32,  27,  1.88,  1768,    3200,    8.90,      'solid',   'Cobalt gives blue glass and pottery their deep blue colour!'],
  [28, 'Ni', 'Nickel',        58.693,   'transition metal',     4, 10,   'd', [2,8,16,2],       28,  31,  28,  1.91,  1728,    3186,    8.908,     'solid',   'Nickel is used in coins and magnets around the world!'],
  [29, 'Cu', 'Copper',        63.546,   'transition metal',     4, 11,   'd', [2,8,18,1],       29,  35,  29,  1.90,  1357.77, 2835,    8.96,      'solid',   'Copper has been used by humans for over 10,000 years!'],
  [30, 'Zn', 'Zinc',          65.38,    'transition metal',     4, 12,   'd', [2,8,18,2],       30,  35,  30,  1.65,  692.88,  1180,    7.14,      'solid',   'Zinc coats galvanized steel to prevent rust on cars and fences!'],
  [31, 'Ga', 'Gallium',       69.723,   'post-transition metal',4, 13,   'p', [2,8,18,3],       31,  39,  31,  1.81,  302.91,  2477,    5.91,      'solid',   'Gallium melts in your hand — its melting point is just 29.8°C!'],
  [32, 'Ge', 'Germanium',     72.630,   'metalloid',            4, 14,   'p', [2,8,18,4],       32,  41,  32,  2.01,  1211.4,  3106,    5.323,     'solid',   'Germanium was predicted by Mendeleev before it was discovered!'],
  [33, 'As', 'Arsenic',       74.922,   'metalloid',            4, 15,   'p', [2,8,18,5],       33,  42,  33,  2.18,  1090,    887,     5.727,     'solid',   'Arsenic was historically used as a poison in mystery novels!'],
  [34, 'Se', 'Selenium',      78.971,   'nonmetal',             4, 16,   'p', [2,8,18,6],       34,  45,  34,  2.55,  494,     958,     4.81,      'solid',   'Selenium is used in solar cells and gives red glass its colour!'],
  [35, 'Br', 'Bromine',       79.904,   'nonmetal',             4, 17,   'p', [2,8,18,7],       35,  45,  35,  2.96,  265.8,   332.0,   3.1028,    'liquid',  'Bromine is one of only two elements that are liquid at room temperature!'],
  [36, 'Kr', 'Krypton',       83.798,   'noble gas',            4, 18,   'p', [2,8,18,8],       36,  48,  36,  null,  115.78,  119.93,  3.749e-3,  'gas',     'Krypton lasers are used in laser light shows!'],
  [37, 'Rb', 'Rubidium',      85.468,   'alkali metal',         5, 1,    's', [2,8,18,8,1],     37,  48,  37,  0.82,  312.45,  961,     1.532,     'solid',   'Rubidium ignites spontaneously in air and explodes in water!'],
  [38, 'Sr', 'Strontium',     87.62,    'alkaline earth metal', 5, 2,    's', [2,8,18,8,2],     38,  50,  38,  0.95,  1050,    1655,    2.64,      'solid',   'Strontium gives fireworks their brilliant red colour!'],
  [39, 'Y',  'Yttrium',       88.906,   'transition metal',     5, 3,    'd', [2,8,18,9,2],     39,  50,  39,  1.22,  1799,    3609,    4.472,     'solid',   'Yttrium is used in the red phosphors of TV screens and monitors!'],
  [40, 'Zr', 'Zirconium',     91.224,   'transition metal',     5, 4,    'd', [2,8,18,10,2],    40,  51,  40,  1.33,  2128,    4682,    6.52,      'solid',   'Zirconium is used to clad nuclear fuel rods because it barely absorbs neutrons!'],
  [41, 'Nb', 'Niobium',       92.906,   'transition metal',     5, 5,    'd', [2,8,18,12,1],    41,  52,  41,  1.6,   2750,    5017,    8.57,      'solid',   'Niobium-steel alloys are used in jet engines and rocket nozzles!'],
  [42, 'Mo', 'Molybdenum',    95.95,    'transition metal',     5, 6,    'd', [2,8,18,13,1],    42,  54,  42,  2.16,  2896,    4912,    10.28,     'solid',   'Molybdenum has the third-highest melting point of all elements!'],
  [43, 'Tc', 'Technetium',    97,       'transition metal',     5, 7,    'd', [2,8,18,13,2],    43,  54,  43,  1.9,   2430,    4538,    11,        'solid',   'Technetium was the first artificially produced element!'],
  [44, 'Ru', 'Ruthenium',     101.07,   'transition metal',     5, 8,    'd', [2,8,18,15,1],    44,  57,  44,  2.2,   2607,    4423,    12.45,     'solid',   'Ruthenium is used to harden platinum and palladium for jewellery!'],
  [45, 'Rh', 'Rhodium',       102.906,  'transition metal',     5, 9,    'd', [2,8,18,16,1],    45,  58,  45,  2.28,  2237,    3968,    12.41,     'solid',   'Rhodium catalysts help convert car exhaust into less harmful gases!'],
  [46, 'Pd', 'Palladium',     106.42,   'transition metal',     5, 10,   'd', [2,8,18,18],      46,  60,  46,  2.20,  1828.05, 3236,    12.023,    'solid',   'Palladium can absorb up to 900 times its own volume in hydrogen!'],
  [47, 'Ag', 'Silver',        107.868,  'transition metal',     5, 11,   'd', [2,8,18,18,1],    47,  61,  47,  1.93,  1234.93, 2435,    10.49,     'solid',   'Silver has the highest electrical conductivity of all elements!'],
  [48, 'Cd', 'Cadmium',       112.414,  'transition metal',     5, 12,   'd', [2,8,18,18,2],    48,  64,  48,  1.69,  594.22,  1040,    8.65,      'solid',   'Cadmium is used in rechargeable nickel-cadmium batteries!'],
  [49, 'In', 'Indium',        114.818,  'post-transition metal',5, 13,   'p', [2,8,18,18,3],    49,  66,  49,  1.78,  429.75,  2345,    7.31,      'solid',   'Indium is used in touchscreen coatings on phones and tablets!'],
  [50, 'Sn', 'Tin',           118.710,  'post-transition metal',5, 14,   'p', [2,8,18,18,4],    50,  69,  50,  1.96,  505.08,  2875,    7.265,     'solid',   'Tin has been used since ancient times to make bronze with copper!'],
  [51, 'Sb', 'Antimony',      121.760,  'metalloid',            5, 15,   'p', [2,8,18,18,5],    51,  71,  51,  2.05,  903.78,  1908,    6.697,     'solid',   'Antimony was used as black eye makeup in ancient Egypt!'],
  [52, 'Te', 'Tellurium',     127.60,   'metalloid',            5, 16,   'p', [2,8,18,18,6],    52,  76,  52,  2.1,   722.66,  1261,    6.24,      'solid',   'Tellurium is one of the rarest stable elements on Earth!'],
  [53, 'I',  'Iodine',        126.904,  'nonmetal',             5, 17,   'p', [2,8,18,18,7],    53,  74,  53,  2.66,  386.85,  457.4,   4.933,     'solid',   'Iodine vapour is a beautiful deep violet — its name means "violet" in Greek!'],
  [54, 'Xe', 'Xenon',         131.293,  'noble gas',            5, 18,   'p', [2,8,18,18,8],    54,  77,  54,  null,  161.4,   165.051, 5.894e-3,  'gas',     'Xenon is used in powerful camera flashes and ion thrusters on spacecraft!'],
  [55, 'Cs', 'Cesium',        132.905,  'alkali metal',         6, 1,    's', [2,8,18,18,8,1],  55,  78,  55,  0.79,  301.7,   944,     1.873,     'solid',   'Cesium atomic clocks are so precise they lose just one second per 300 million years!'],
  [56, 'Ba', 'Barium',        137.327,  'alkaline earth metal', 6, 2,    's', [2,8,18,18,8,2],  56,  81,  56,  0.89,  1000,    2118,    3.51,      'solid',   'Barium gives fireworks their green colour!'],
  [57, 'La', 'Lanthanum',     138.905,  'lanthanide',           6, null, 'f', [2,8,18,18,9,2],  57,  82,  57,  1.10,  1193,    3737,    6.162,     'solid',   'Lanthanum is used in camera lenses to give them low dispersion!'],
  [58, 'Ce', 'Cerium',        140.116,  'lanthanide',           6, null, 'f', [2,8,18,19,9,2],  58,  82,  58,  1.12,  1068,    3716,    6.770,     'solid',   'Cerium is used in catalytic converters to reduce car emissions!'],
  [59, 'Pr', 'Praseodymium',  140.908,  'lanthanide',           6, null, 'f', [2,8,18,21,8,2],  59,  82,  59,  1.13,  1208,    3793,    6.77,      'solid',   'Praseodymium is used in powerful magnets in wind turbines and electric motors!'],
  [60, 'Nd', 'Neodymium',     144.242,  'lanthanide',           6, null, 'f', [2,8,18,22,8,2],  60,  84,  60,  1.14,  1297,    3347,    7.01,      'solid',   'Neodymium magnets are the strongest permanent magnets ever made!'],
  [61, 'Pm', 'Promethium',    145,      'lanthanide',           6, null, 'f', [2,8,18,23,8,2],  61,  84,  61,  1.13,  1315,    3273,    7.26,      'solid',   'Promethium is the only lanthanide with no stable isotopes!'],
  [62, 'Sm', 'Samarium',      150.36,   'lanthanide',           6, null, 'f', [2,8,18,24,8,2],  62,  88,  62,  1.17,  1345,    2173,    7.52,      'solid',   'Samarium-cobalt magnets are used in guided missiles and headphones!'],
  [63, 'Eu', 'Europium',      151.964,  'lanthanide',           6, null, 'f', [2,8,18,25,8,2],  63,  89,  63,  1.2,   1099,    1802,    5.264,     'solid',   'Europium makes the red and blue colours in euro banknotes glow under UV light!'],
  [64, 'Gd', 'Gadolinium',    157.25,   'lanthanide',           6, null, 'f', [2,8,18,25,9,2],  64,  93,  64,  1.20,  1585,    3546,    7.90,      'solid',   'Gadolinium contrast agents make MRI scans dramatically clearer!'],
  [65, 'Tb', 'Terbium',       158.925,  'lanthanide',           6, null, 'f', [2,8,18,27,8,2],  65,  94,  65,  1.2,   1629,    3503,    8.23,      'solid',   'Terbium is used to make green phosphors in TV screens and monitors!'],
  [66, 'Dy', 'Dysprosium',    162.500,  'lanthanide',           6, null, 'f', [2,8,18,28,8,2],  66,  97,  66,  1.22,  1680,    2840,    8.540,     'solid',   'Dysprosium is added to neodymium magnets so they work at high temperatures!'],
  [67, 'Ho', 'Holmium',       164.930,  'lanthanide',           6, null, 'f', [2,8,18,29,8,2],  67,  98,  67,  1.23,  1734,    2993,    8.79,      'solid',   'Holmium has the highest magnetic moment of any natural element!'],
  [68, 'Er', 'Erbium',        167.259,  'lanthanide',           6, null, 'f', [2,8,18,30,8,2],  68,  99,  68,  1.24,  1802,    3141,    9.066,     'solid',   'Erbium amplifiers boost signals in fibre-optic internet cables!'],
  [69, 'Tm', 'Thulium',       168.934,  'lanthanide',           6, null, 'f', [2,8,18,31,8,2],  69, 100,  69,  1.25,  1818,    2223,    9.32,      'solid',   'Thulium is used in portable X-ray devices used in remote areas!'],
  [70, 'Yb', 'Ytterbium',     173.045,  'lanthanide',           6, null, 'f', [2,8,18,32,8,2],  70, 103,  70,  1.1,   1097,    1469,    6.90,      'solid',   'Ytterbium clocks are the most precise timekeepers ever built!'],
  [71, 'Lu', 'Lutetium',      174.967,  'lanthanide',           6, null, 'f', [2,8,18,32,9,2],  71, 104,  71,  1.27,  1925,    3675,    9.841,     'solid',   'Lutetium is used in PET scanners to detect cancer!'],
  [72, 'Hf', 'Hafnium',       178.486,  'transition metal',     6, 4,    'd', [2,8,18,32,10,2], 72, 106,  72,  1.3,   2506,    4876,    13.31,     'solid',   'Hafnium is used in nuclear reactor control rods because it absorbs neutrons!'],
  [73, 'Ta', 'Tantalum',      180.948,  'transition metal',     6, 5,    'd', [2,8,18,32,11,2], 73, 108,  73,  1.5,   3290,    5731,    16.69,     'solid',   'Tantalum capacitors store energy in your smartphone!'],
  [74, 'W',  'Tungsten',      183.84,   'transition metal',     6, 6,    'd', [2,8,18,32,12,2], 74, 110,  74,  2.36,  3695,    6203,    19.25,     'solid',   'Tungsten has the highest melting point of all elements at 3,422°C!'],
  [75, 'Re', 'Rhenium',       186.207,  'transition metal',     6, 7,    'd', [2,8,18,32,13,2], 75, 111,  75,  1.9,   3459,    5903,    21.02,     'solid',   'Rhenium is used in jet engine superalloys that withstand extreme heat!'],
  [76, 'Os', 'Osmium',        190.23,   'transition metal',     6, 8,    'd', [2,8,18,32,14,2], 76, 114,  76,  2.2,   3306,    5285,    22.59,     'solid',   'Osmium is the densest naturally occurring element — denser than gold!'],
  [77, 'Ir', 'Iridium',       192.217,  'transition metal',     6, 9,    'd', [2,8,18,32,15,2], 77, 115,  77,  2.20,  2719,    4403,    22.56,     'solid',   'The iridium spike in rock layers marks where an asteroid wiped out the dinosaurs!'],
  [78, 'Pt', 'Platinum',      195.084,  'transition metal',     6, 10,   'd', [2,8,18,32,17,1], 78, 117,  78,  2.28,  2041.4,  4098,    21.45,     'solid',   'Platinum catalytic converters reduce pollution from car exhaust!'],
  [79, 'Au', 'Gold',          196.967,  'transition metal',     6, 11,   'd', [2,8,18,32,18,1], 79, 118,  79,  2.54,  1337.33, 3243,    19.3,      'solid',   'All the gold ever mined would fit in a cube just 21 metres wide!'],
  [80, 'Hg', 'Mercury',       200.592,  'transition metal',     6, 12,   'd', [2,8,18,32,18,2], 80, 121,  80,  2.00,  234.32,  629.88,  13.534,    'liquid',  'Mercury is the only metal that is liquid at room temperature!'],
  [81, 'Tl', 'Thallium',      204.38,   'post-transition metal',6, 13,   'p', [2,8,18,32,18,3], 81, 123,  81,  1.62,  577,     1746,    11.85,     'solid',   'Thallium was once used as rat poison because it is tasteless and odourless!'],
  [82, 'Pb', 'Lead',          207.2,    'post-transition metal',6, 14,   'p', [2,8,18,32,18,4], 82, 125,  82,  2.33,  600.61,  2022,    11.34,     'solid',   'Lead was used in Roman water pipes — and may have contributed to their empire\'s fall!'],
  [83, 'Bi', 'Bismuth',       208.980,  'post-transition metal',6, 15,   'p', [2,8,18,32,18,5], 83, 126,  83,  2.02,  544.55,  1837,    9.747,     'solid',   'Bismuth crystals grow in stunning rainbow-coloured staircase shapes!'],
  [84, 'Po', 'Polonium',      209,      'post-transition metal',6, 16,   'p', [2,8,18,32,18,6], 84, 125,  84,  2.0,   527,     1235,    9.196,     'solid',   'Polonium was discovered by Marie Curie, who named it after her homeland Poland!'],
  [85, 'At', 'Astatine',      210,      'metalloid',            6, 17,   'p', [2,8,18,32,18,7], 85, 125,  85,  2.2,   575,     610,     null,      'solid',   'Astatine is the rarest naturally occurring element — only grams exist on Earth!'],
  [86, 'Rn', 'Radon',         222,      'noble gas',            6, 18,   'p', [2,8,18,32,18,8], 86, 136,  86,  null,  202,     211.5,   9.73e-3,   'gas',     'Radon is a radioactive gas that can seep into homes from the ground!'],
  [87, 'Fr', 'Francium',      223,      'alkali metal',         7, 1,    's', [2,8,18,32,18,8,1],87,136,  87,  0.7,   300,     950,     null,      'solid',   'Francium is so radioactive that only 30 grams exist on Earth at any time!'],
  [88, 'Ra', 'Radium',        226,      'alkaline earth metal', 7, 2,    's', [2,8,18,32,18,8,2],88,138,  88,  0.9,   969,     1413,    5.5,       'solid',   'Radium was used in glow-in-the-dark watch dials until its dangers were discovered!'],
  [89, 'Ac', 'Actinium',      227,      'actinide',             7, null, 'f', [2,8,18,32,18,9,2],89,138,  89,  1.1,   1323,    3471,    10,        'solid',   'Actinium glows blue in the dark due to its intense radioactivity!'],
  [90, 'Th', 'Thorium',       232.038,  'actinide',             7, null, 'f', [2,8,18,32,18,10,2],90,142,90, 1.3,   2023,    5061,    11.72,     'solid',   'Thorium could power nuclear reactors and is three times more abundant than uranium!'],
  [91, 'Pa', 'Protactinium',  231.036,  'actinide',             7, null, 'f', [2,8,18,32,20,9,2],91,140,  91,  1.5,   1841,    4300,    15.37,     'solid',   'Protactinium is one of the rarest and most expensive naturally occurring elements!'],
  [92, 'U',  'Uranium',       238.029,  'actinide',             7, null, 'f', [2,8,18,32,21,9,2],92,146,  92,  1.38,  1405.3,  4404,    19.1,      'solid',   'One kilogram of uranium-235 contains as much energy as 3 million kg of coal!'],
  [93, 'Np', 'Neptunium',     237,      'actinide',             7, null, 'f', [2,8,18,32,22,9,2],93,144,  93,  1.36,  912,     4447,    20.2,      'solid',   'Neptunium was the first transuranic element ever synthesised!'],
  [94, 'Pu', 'Plutonium',     244,      'actinide',             7, null, 'f', [2,8,18,32,24,8,2],94,150,  94,  1.28,  912.5,   3505,    19.816,    'solid',   'Plutonium was used in the bomb dropped on Nagasaki in 1945!'],
  [95, 'Am', 'Americium',     243,      'actinide',             7, null, 'f', [2,8,18,32,25,8,2],95,148,  95,  1.13,  1449,    2880,    13.67,     'solid',   'Americium is inside most household smoke detectors!'],
  [96, 'Cm', 'Curium',        247,      'actinide',             7, null, 'f', [2,8,18,32,25,9,2],96,151,  96,  1.28,  1613,    3383,    13.51,     'solid',   'Curium was used in a spectrometer on the Mars Science Laboratory rover!'],
  [97, 'Bk', 'Berkelium',     247,      'actinide',             7, null, 'f', [2,8,18,32,27,8,2],97,150,  97,  1.3,   1259,    2900,    14.78,     'solid',   'Berkelium was discovered at the University of California, Berkeley in 1949!'],
  [98, 'Cf', 'Californium',   251,      'actinide',             7, null, 'f', [2,8,18,32,28,8,2],98,153,  98,  1.3,   1173,    1743,    15.1,      'solid',   'Californium is used to start nuclear reactors and treat certain cancers!'],
  [99, 'Es', 'Einsteinium',   252,      'actinide',             7, null, 'f', [2,8,18,32,29,8,2],99,153,  99,  1.3,   1133,    1269,    null,      'solid',   'Einsteinium was first found in the fallout of the first hydrogen bomb test!'],
  [100,'Fm', 'Fermium',       257,      'actinide',             7, null, 'f', [2,8,18,32,30,8,2],100,157,100, 1.3,   1800,    null,    null,      'solid',   'Fermium was named after Enrico Fermi, father of the nuclear age!'],
  [101,'Md', 'Mendelevium',   258,      'actinide',             7, null, 'f', [2,8,18,32,31,8,2],101,157,101, 1.3,   1100,    null,    null,      'solid',   'Mendelevium was named after Dmitri Mendeleev, inventor of the periodic table!'],
  [102,'No', 'Nobelium',      259,      'actinide',             7, null, 'f', [2,8,18,32,32,8,2],102,157,102, 1.3,   1100,    null,    null,      'solid',   'Nobelium was named after Alfred Nobel, inventor of dynamite and the Nobel Prize!'],
  [103,'Lr', 'Lawrencium',    266,      'actinide',             7, null, 'f', [2,8,18,32,32,9,2],103,163,103, 1.3,   1900,    null,    null,      'solid',   'Lawrencium was the last actinide element to be synthesised!'],
  [104,'Rf', 'Rutherfordium', 267,      'unknown',              7, 4,    'd', [2,8,18,32,32,10,2],104,163,104,null,  null,    null,    null,      'unknown', 'Rutherfordium was named after Ernest Rutherford, who discovered the atomic nucleus!'],
  [105,'Db', 'Dubnium',       268,      'unknown',              7, 5,    'd', [2,8,18,32,32,11,2],105,163,105,null,  null,    null,    null,      'unknown', 'Dubnium was named after Dubna, Russia, where it was first synthesised!'],
  [106,'Sg', 'Seaborgium',    269,      'unknown',              7, 6,    'd', [2,8,18,32,32,12,2],106,163,106,null,  null,    null,    null,      'unknown', 'Seaborgium is named after Glenn Seaborg, who co-discovered ten elements!'],
  [107,'Bh', 'Bohrium',       270,      'unknown',              7, 7,    'd', [2,8,18,32,32,13,2],107,163,107,null,  null,    null,    null,      'unknown', 'Bohrium was named after Niels Bohr, who developed the first model of the atom!'],
  [108,'Hs', 'Hassium',       269,      'unknown',              7, 8,    'd', [2,8,18,32,32,14,2],108,161,108,null,  null,    null,    null,      'unknown', 'Hassium was named after the German state of Hesse where it was created!'],
  [109,'Mt', 'Meitnerium',    278,      'unknown',              7, 9,    'd', [2,8,18,32,32,15,2],109,169,109,null,  null,    null,    null,      'unknown', 'Meitnerium was named after Lise Meitner, who co-discovered nuclear fission!'],
  [110,'Ds', 'Darmstadtium',  281,      'unknown',              7, 10,   'd', [2,8,18,32,32,16,2],110,171,110,null,  null,    null,    null,      'unknown', 'Darmstadtium was first made at the GSI research centre in Darmstadt, Germany!'],
  [111,'Rg', 'Roentgenium',   282,      'unknown',              7, 11,   'd', [2,8,18,32,32,17,2],111,171,111,null,  null,    null,    null,      'unknown', 'Roentgenium was named after Wilhelm Röntgen, who discovered X-rays!'],
  [112,'Cn', 'Copernicium',   285,      'unknown',              7, 12,   'd', [2,8,18,32,32,18,2],112,173,112,null,  null,    null,    null,      'unknown', 'Copernicium was named after Nicolaus Copernicus, who placed the Sun at the centre of the solar system!'],
  [113,'Nh', 'Nihonium',      286,      'unknown',              7, 13,   'p', [2,8,18,32,32,18,3],113,173,113,null,  null,    null,    null,      'unknown', 'Nihonium was discovered by Japanese scientists — Nihon means Japan!'],
  [114,'Fl', 'Flerovium',     289,      'unknown',              7, 14,   'p', [2,8,18,32,32,18,4],114,175,114,null,  null,    null,    null,      'unknown', 'Flerovium was named after the Flerov Laboratory where it was created!'],
  [115,'Mc', 'Moscovium',     290,      'unknown',              7, 15,   'p', [2,8,18,32,32,18,5],115,175,115,null,  null,    null,    null,      'unknown', 'Moscovium was named after the Moscow Oblast where it was first synthesised!'],
  [116,'Lv', 'Livermorium',   293,      'unknown',              7, 16,   'p', [2,8,18,32,32,18,6],116,177,116,null,  null,    null,    null,      'unknown', 'Livermorium was named after the Lawrence Livermore National Laboratory!'],
  [117,'Ts', 'Tennessine',    294,      'unknown',              7, 17,   'p', [2,8,18,32,32,18,7],117,177,117,null,  null,    null,    null,      'unknown', 'Tennessine was named after Tennessee, home to Oak Ridge National Laboratory!'],
  [118,'Og', 'Oganesson',     294,      'unknown',              7, 18,   'p', [2,8,18,32,32,18,8],118,176,118,null,  null,    null,    null,      'unknown', 'Oganesson is the heaviest known element — its atoms last less than a millisecond!'],
];

const ELEMENTS = RAW.map(([
  atomicNumber, symbol, name, atomicMass, category, period, group, block,
  shellCounts, protons, neutrons, electrons,
  electronegativity, meltingPoint, boilingPoint, density,
  standardState, funFact,
]) => ({
  atomicNumber,
  symbol,
  name,
  atomicMass,
  category,
  period,
  group: group ?? null,
  block,
  bohrShells: shells(...(shellCounts as number[])),
  protons,
  neutrons,
  electrons,
  electronegativity: electronegativity ?? null,
  meltingPoint: meltingPoint ?? null,
  boilingPoint: boilingPoint ?? null,
  density: density ?? null,
  standardState,
  funFact,
  earthExamples: [],
  elementImageUrl: '',
  englishWords: [],
  pronunciationAudio: '',
}));

const COMPOUNDS = [
  {
    formula: 'H2O',
    name: 'Water',
    commonName: 'Water',
    elements: [{ symbol: 'H', count: 2 }, { symbol: 'O', count: 1 }],
    molecularWeight: 18.015,
    description: 'Water is the most essential compound for life on Earth.',
    uses: ['drinking', 'cooking', 'agriculture'],
    earthExamples: [],
    compoundImageUrl: '',
    modelImageUrl: '',
    meltingPoint: 273.15,
    boilingPoint: 373.15,
    isSafe: true,
    warningLabel: null,
    englishWords: ['drink', 'wet', 'liquid'],
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

  await mongoose.disconnect();
  console.log('Seeding complete!');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
