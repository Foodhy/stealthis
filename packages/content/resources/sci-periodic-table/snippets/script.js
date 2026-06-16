/* Interactive Periodic Table — COCL-PTE v3.2 (illustrative dataset) */
(function () {
  "use strict";

  /* ---------------------------------------------------------------
   * Dataset. Fields:
   *   z, sym, name, mass, group, period, cat, state, en (electroneg.),
   *   disc (discovery year, "anc." for antiquity), conf (electron config),
   *   shells (per-shell counts), col (grid column), row (grid row), fact.
   * Categories: alkali, alkaline, transition, postt, metalloid, nonmetal,
   *   halogen, noble, lanth, actin, unknown.
   * --------------------------------------------------------------- */
  var CATS = {
    alkali:     { label: "Alkali metal",            color: "var(--c-alkali)" },
    alkaline:   { label: "Alkaline earth metal",    color: "var(--c-alkaline)" },
    transition: { label: "Transition metal",        color: "var(--c-transition)" },
    postt:      { label: "Post-transition metal",   color: "var(--c-postt)" },
    metalloid:  { label: "Metalloid",               color: "var(--c-metalloid)" },
    nonmetal:   { label: "Reactive nonmetal",       color: "var(--c-nonmetal)" },
    halogen:    { label: "Halogen",                 color: "var(--c-halogen)" },
    noble:      { label: "Noble gas",               color: "var(--c-noble)" },
    lanth:      { label: "Lanthanide",              color: "var(--c-lanth)" },
    actin:      { label: "Actinide",                color: "var(--c-actin)" },
    unknown:    { label: "Unknown / predicted",     color: "var(--c-unknown)" }
  };
  var STATES = {
    solid:   { label: "Solid",   color: "var(--s-solid)" },
    liquid:  { label: "Liquid",  color: "var(--s-liquid)" },
    gas:     { label: "Gas",     color: "var(--s-gas)" },
    unknown: { label: "Unknown", color: "var(--s-unknown)" }
  };

  // compact electron-config helper using noble-gas shorthand
  var BLOCK = function (group) {
    if (group === 1 || group === 2) return "s";
    if (group >= 3 && group <= 12) return "d";
    if (group >= 13 && group <= 18) return "p";
    return "f";
  };

  var E = [
    [1,"H","Hydrogen",1.008,1,1,"nonmetal","gas",2.20,1766,"1s¹",[1],1,1,"Lightest element; the COCL spectral lab uses it to calibrate the Balmer reference line."],
    [2,"He","Helium",4.0026,18,1,"noble","gas",null,1868,"1s²",[2],18,1,"First detected as an unknown solar line before it was found on Earth."],
    [3,"Li","Lithium",6.94,1,2,"alkali","solid",0.98,1817,"[He] 2s¹",[2,1],1,2,"Soft enough to cut with a knife; floats on oil in the demo cabinet."],
    [4,"Be","Beryllium",9.0122,2,2,"alkaline","solid",1.57,1798,"[He] 2s²",[2,2],2,2,"Transparent to X-rays — used for the window of COCL's bench diffractometer."],
    [5,"B","Boron",10.81,13,2,"metalloid","solid",2.04,1808,"[He] 2s² 2p¹",[2,3],13,2,"Forms cage-like clusters that fascinate the materials group."],
    [6,"C","Carbon",12.011,14,2,"nonmetal","solid",2.55,-1,"[He] 2s² 2p²",[2,4],14,2,"Backbone of organic chemistry; allotrope shelf holds graphite and a lab diamond."],
    [7,"N","Nitrogen",14.007,15,2,"nonmetal","gas",3.04,1772,"[He] 2s² 2p³",[2,5],15,2,"Makes up most of the air; liquefied for the cryostat at 77 K."],
    [8,"O","Oxygen",15.999,16,2,"nonmetal","gas",3.44,1774,"[He] 2s² 2p⁴",[2,6],16,2,"Pale blue as a liquid; the lab's combustion bench tracks it carefully."],
    [9,"F","Fluorine",18.998,17,2,"halogen","gas",3.98,1886,"[He] 2s² 2p⁵",[2,7],17,2,"Most electronegative element on the COCL scale; stored behind interlock."],
    [10,"Ne","Neon",20.180,18,2,"noble","gas",null,1898,"[He] 2s² 2p⁶",[2,8],18,2,"Glows orange-red in the discharge tube on the demo wall."],
    [11,"Na","Sodium",22.990,1,3,"alkali","solid",0.93,1807,"[Ne] 3s¹",[2,8,1],1,3,"Reacts vividly with water; kept under mineral oil in jar #11."],
    [12,"Mg","Magnesium",24.305,2,3,"alkaline","solid",1.31,1755,"[Ne] 3s²",[2,8,2],2,3,"Burns with a brilliant white flame used in the photometry calibration."],
    [13,"Al","Aluminium",26.982,13,3,"postt","solid",1.61,1825,"[Ne] 3s² 3p¹",[2,8,3],13,3,"Most abundant metal in the crust; the lab's optical breadboard is anodised Al."],
    [14,"Si","Silicon",28.085,14,3,"metalloid","solid",1.90,1824,"[Ne] 3s² 3p²",[2,8,4],14,3,"Semiconductor heart of every detector chip in the building."],
    [15,"P","Phosphorus",30.974,15,3,"nonmetal","solid",2.19,1669,"[Ne] 3s² 3p³",[2,8,5],15,3,"White allotrope glows faintly — the original meaning of phosphorescence."],
    [16,"S","Sulfur",32.06,16,3,"nonmetal","solid",2.58,-1,"[Ne] 3s² 3p⁴",[2,8,6],16,3,"Yellow crystalline mineral; samples sit in tray S-3 of the rock cabinet."],
    [17,"Cl","Chlorine",35.45,17,3,"halogen","gas",3.16,1774,"[Ne] 3s² 3p⁵",[2,8,7],17,3,"Greenish gas; handled only in the fume hood with the green tag."],
    [18,"Ar","Argon",39.948,18,3,"noble","gas",null,1894,"[Ne] 3s² 3p⁶",[2,8,8],18,3,"Inert filler gas for the lab's welding glovebox."],
    [19,"K","Potassium",39.098,1,4,"alkali","solid",0.82,1807,"[Ar] 4s¹",[2,8,8,1],1,4,"Even more reactive than sodium; the lilac flame test favourite."],
    [20,"Ca","Calcium",40.078,2,4,"alkaline","solid",1.00,1808,"[Ar] 4s²",[2,8,8,2],2,4,"Structural element of bone and the chalk used on the lab boards."],
    [21,"Sc","Scandium",44.956,3,4,"transition","solid",1.36,1879,"[Ar] 3d¹ 4s²",[2,8,9,2],3,4,"Light, strong, and rare; alloyed into the bench's frame fittings."],
    [22,"Ti","Titanium",47.867,4,4,"transition","solid",1.54,1791,"[Ar] 3d² 4s²",[2,8,10,2],4,4,"Corrosion-proof; used for the vacuum chamber bolts."],
    [23,"V","Vanadium",50.942,5,4,"transition","solid",1.63,1801,"[Ar] 3d³ 4s²",[2,8,11,2],5,4,"Its salts span five vivid colours across oxidation states."],
    [24,"Cr","Chromium",51.996,6,4,"transition","solid",1.66,1797,"[Ar] 3d⁵ 4s¹",[2,8,13,1],6,4,"Gives the mirror finish on the optical mounts."],
    [25,"Mn","Manganese",54.938,7,4,"transition","solid",1.55,1774,"[Ar] 3d⁵ 4s²",[2,8,13,2],7,4,"Purple permanganate is the lab's go-to titration indicator."],
    [26,"Fe","Iron",55.845,8,4,"transition","solid",1.83,-1,"[Ar] 3d⁶ 4s²",[2,8,14,2],8,4,"Most-used structural metal; the building's I-beams are mostly iron."],
    [27,"Co","Cobalt",58.933,9,4,"transition","solid",1.88,1735,"[Ar] 3d⁷ 4s²",[2,8,15,2],9,4,"Deep blue glass colourant on the spectroscopy filter shelf."],
    [28,"Ni","Nickel",58.693,10,4,"transition","solid",1.91,1751,"[Ar] 3d⁸ 4s²",[2,8,16,2],10,4,"Plates the lab's reference weights against tarnish."],
    [29,"Cu","Copper",63.546,11,4,"transition","solid",1.90,-1,"[Ar] 3d¹⁰ 4s¹",[2,8,18,1],11,4,"All the building wiring; turns flames bluish-green."],
    [30,"Zn","Zinc",65.38,12,4,"transition","solid",1.65,1746,"[Ar] 3d¹⁰ 4s²",[2,8,18,2],12,4,"Anode metal in the teaching galvanic cells."],
    [31,"Ga","Gallium",69.723,13,4,"postt","solid",1.81,1875,"[Ar] 3d¹⁰ 4s² 4p¹",[2,8,18,3],13,4,"Melts in a warm hand at 30 °C — the open-day party trick."],
    [32,"Ge","Germanium",72.630,14,4,"metalloid","solid",2.01,1886,"[Ar] 3d¹⁰ 4s² 4p²",[2,8,18,4],14,4,"Transparent in the infrared; lenses for the thermal camera."],
    [33,"As","Arsenic",74.922,15,4,"metalloid","solid",2.18,-1,"[Ar] 3d¹⁰ 4s² 4p³",[2,8,18,5],15,4,"Locked sample; only handled in the historical-toxicology unit."],
    [34,"Se","Selenium",78.971,16,4,"nonmetal","solid",2.55,1817,"[Ar] 3d¹⁰ 4s² 4p⁴",[2,8,18,6],16,4,"Photoconductive — basis of the lab's antique light meter."],
    [35,"Br","Bromine",79.904,17,4,"halogen","liquid",2.96,1826,"[Ar] 3d¹⁰ 4s² 4p⁵",[2,8,18,7],17,4,"One of only two liquid elements at room temperature."],
    [36,"Kr","Krypton",83.798,18,4,"noble","gas",3.00,1898,"[Ar] 3d¹⁰ 4s² 4p⁶",[2,8,18,8],18,4,"Once defined the metre via its orange-red emission line."],
    [37,"Rb","Rubidium",85.468,1,5,"alkali","solid",0.82,1861,"[Kr] 5s¹",[2,8,18,8,1],1,5,"Cooled to micro-kelvin in the lab's atom-trap demo."],
    [38,"Sr","Strontium",87.62,2,5,"alkaline","solid",0.95,1790,"[Kr] 5s²",[2,8,18,8,2],2,5,"Bright crimson in the fireworks-chemistry lecture."],
    [39,"Y","Yttrium",88.906,3,5,"transition","solid",1.22,1794,"[Kr] 4d¹ 5s²",[2,8,18,9,2],3,5,"Key ingredient in the lab's red-phosphor display panel."],
    [40,"Zr","Zirconium",91.224,4,5,"transition","solid",1.33,1789,"[Kr] 4d² 5s²",[2,8,18,10,2],4,5,"Crucible metal that shrugs off heat and acid."],
    [41,"Nb","Niobium",92.906,5,5,"transition","solid",1.60,1801,"[Kr] 4d⁴ 5s¹",[2,8,18,12,1],5,5,"Superconducts when chilled — wound into the test magnet."],
    [42,"Mo","Molybdenum",95.95,6,5,"transition","solid",2.16,1781,"[Kr] 4d⁵ 5s¹",[2,8,18,13,1],6,5,"High-temperature furnace windings are made of it."],
    [43,"Tc","Technetium",98,7,5,"transition","solid",1.90,1937,"[Kr] 4d⁵ 5s²",[2,8,18,13,2],7,5,"First element made artificially; entirely radioactive."],
    [44,"Ru","Ruthenium",101.07,8,5,"transition","solid",2.20,1844,"[Kr] 4d⁷ 5s¹",[2,8,18,15,1],8,5,"Hardens platinum contacts in the lab's switchgear."],
    [45,"Rh","Rhodium",102.91,9,5,"transition","solid",2.28,1803,"[Kr] 4d⁸ 5s¹",[2,8,18,16,1],9,5,"Mirror-bright and inert; coats the reflectance standard."],
    [46,"Pd","Palladium",106.42,10,5,"transition","solid",2.20,1803,"[Kr] 4d¹⁰",[2,8,18,18],10,5,"Soaks up hydrogen like a sponge — the gas-storage demo."],
    [47,"Ag","Silver",107.87,11,5,"transition","solid",1.93,-1,"[Kr] 4d¹⁰ 5s¹",[2,8,18,18,1],11,5,"Best electrical conductor; the lab's reference electrode."],
    [48,"Cd","Cadmium",112.41,12,5,"transition","solid",1.69,1817,"[Kr] 4d¹⁰ 5s²",[2,8,18,18,2],12,5,"Once a yellow pigment; now a controlled sample."],
    [49,"In","Indium",114.82,13,5,"postt","solid",1.78,1863,"[Kr] 4d¹⁰ 5s² 5p¹",[2,8,18,18,3],13,5,"So soft it cries — a faint crackle when bent."],
    [50,"Sn","Tin",118.71,14,5,"postt","solid",1.96,-1,"[Kr] 4d¹⁰ 5s² 5p²",[2,8,18,18,4],14,5,"Cold-bending a bar produces the famous tin cry."],
    [51,"Sb","Antimony",121.76,15,5,"metalloid","solid",2.05,-1,"[Kr] 4d¹⁰ 5s² 5p³",[2,8,18,18,5],15,5,"Expands as it freezes; used in old printing type alloy."],
    [52,"Te","Tellurium",127.60,16,5,"metalloid","solid",2.10,1782,"[Kr] 4d¹⁰ 5s² 5p⁴",[2,8,18,18,6],16,5,"Eating it gives a garlic breath that lasts for days."],
    [53,"I","Iodine",126.90,17,5,"halogen","solid",2.66,1811,"[Kr] 4d¹⁰ 5s² 5p⁵",[2,8,18,18,7],17,5,"Sublimes into a violet vapour in the gentle-heat demo."],
    [54,"Xe","Xenon",131.29,18,5,"noble","gas",2.60,1898,"[Kr] 4d¹⁰ 5s² 5p⁶",[2,8,18,18,8],18,5,"Powers the bright flash lamps on the imaging rig."],
    [55,"Cs","Caesium",132.91,1,6,"alkali","solid",0.79,1860,"[Xe] 6s¹",[2,8,18,18,8,1],1,6,"Defines the SI second through its 9.19-GHz transition."],
    [56,"Ba","Barium",137.33,2,6,"alkaline","solid",0.89,1808,"[Xe] 6s²",[2,8,18,18,8,2],2,6,"Its sulfate is the radiology contrast meal."],
    [57,"La","Lanthanum",138.91,3,6,"lanth","solid",1.10,1839,"[Xe] 5d¹ 6s²",[2,8,18,18,9,2],3,9,"Lends a high refractive index to the lab's premium lenses."],
    [58,"Ce","Cerium",140.12,null,6,"lanth","solid",1.12,1803,"[Xe] 4f¹ 5d¹ 6s²",[2,8,18,19,9,2],4,9,"Most abundant rare earth; polishes the optical flats."],
    [59,"Pr","Praseodymium",140.91,null,6,"lanth","solid",1.13,1885,"[Xe] 4f³ 6s²",[2,8,18,21,8,2],5,9,"Tints welding goggles the lab's signature green."],
    [60,"Nd","Neodymium",144.24,null,6,"lanth","solid",1.14,1885,"[Xe] 4f⁴ 6s²",[2,8,18,22,8,2],6,9,"Heart of the strongest permanent magnets on the bench."],
    [61,"Pm","Promethium",145,null,6,"lanth","solid",1.13,1945,"[Xe] 4f⁵ 6s²",[2,8,18,23,8,2],7,9,"Glows faintly on its own; every isotope is radioactive."],
    [62,"Sm","Samarium",150.36,null,6,"lanth","solid",1.17,1879,"[Xe] 4f⁶ 6s²",[2,8,18,24,8,2],8,9,"Earliest rare-earth magnet material, still in old motors."],
    [63,"Eu","Europium",151.96,null,6,"lanth","solid",1.20,1901,"[Xe] 4f⁷ 6s²",[2,8,18,25,8,2],9,9,"Red glow behind anti-counterfeit banknote inks."],
    [64,"Gd","Gadolinium",157.25,null,6,"lanth","solid",1.20,1880,"[Xe] 4f⁷ 5d¹ 6s²",[2,8,18,25,9,2],10,9,"Most magnetic at room temperature; an MRI contrast agent."],
    [65,"Tb","Terbium",158.93,null,6,"lanth","solid",1.20,1843,"[Xe] 4f⁹ 6s²",[2,8,18,27,8,2],11,9,"Green phosphor in the trichromatic display lab."],
    [66,"Dy","Dysprosium",162.50,null,6,"lanth","solid",1.22,1886,"[Xe] 4f¹⁰ 6s²",[2,8,18,28,8,2],12,9,"Keeps high-heat magnets from losing their pull."],
    [67,"Ho","Holmium",164.93,null,6,"lanth","solid",1.23,1878,"[Xe] 4f¹¹ 6s²",[2,8,18,29,8,2],13,9,"Holds the record for the strongest magnetic moment per atom."],
    [68,"Er","Erbium",167.26,null,6,"lanth","solid",1.24,1843,"[Xe] 4f¹² 6s²",[2,8,18,30,8,2],14,9,"Amplifies light in the lab's fibre-optic test bench."],
    [69,"Tm","Thulium",168.93,null,6,"lanth","solid",1.25,1879,"[Xe] 4f¹³ 6s²",[2,8,18,31,8,2],15,9,"Rarest stable rare earth; used in portable X-ray sources."],
    [70,"Yb","Ytterbium",173.05,null,6,"lanth","solid",1.10,1878,"[Xe] 4f¹⁴ 6s²",[2,8,18,32,8,2],16,9,"Powers one of the lab's ultra-stable optical clocks."],
    [71,"Lu","Lutetium",174.97,3,6,"lanth","solid",1.27,1907,"[Xe] 4f¹⁴ 5d¹ 6s²",[2,8,18,32,9,2],17,9,"Densest, hardest lanthanide; the detector-crystal favourite."],
    [72,"Hf","Hafnium",178.49,4,6,"transition","solid",1.30,1923,"[Xe] 4f¹⁴ 5d² 6s²",[2,8,18,32,10,2],4,6,"Absorbs stray neutrons in the teaching-reactor control rods."],
    [73,"Ta","Tantalum",180.95,5,6,"transition","solid",1.50,1802,"[Xe] 4f¹⁴ 5d³ 6s²",[2,8,18,32,11,2],5,6,"Body-friendly metal used in the lab's implant-materials study."],
    [74,"W","Tungsten",183.84,6,6,"transition","solid",2.36,1783,"[Xe] 4f¹⁴ 5d⁴ 6s²",[2,8,18,32,12,2],6,6,"Highest melting point of all metals; the furnace element."],
    [75,"Re","Rhenium",186.21,7,6,"transition","solid",1.90,1925,"[Xe] 4f¹⁴ 5d⁵ 6s²",[2,8,18,32,13,2],7,6,"Last stable element to be discovered, in 1925."],
    [76,"Os","Osmium",190.23,8,6,"transition","solid",2.20,1803,"[Xe] 4f¹⁴ 5d⁶ 6s²",[2,8,18,32,14,2],8,6,"Densest naturally occurring element on the COCL scale."],
    [77,"Ir","Iridium",192.22,9,6,"transition","solid",2.20,1803,"[Xe] 4f¹⁴ 5d⁷ 6s²",[2,8,18,32,15,2],9,6,"Most corrosion-resistant metal; tips the lab's reference pens."],
    [78,"Pt","Platinum",195.08,10,6,"transition","solid",2.28,1735,"[Xe] 4f¹⁴ 5d⁹ 6s¹",[2,8,18,32,17,1],10,6,"Catalyst workhorse; the resistance thermometer standard."],
    [79,"Au","Gold",196.97,11,6,"transition","solid",2.54,-1,"[Xe] 4f¹⁴ 5d¹⁰ 6s¹",[2,8,18,32,18,1],11,6,"Sputtered nanometre-thin onto the electron-microscope samples."],
    [80,"Hg","Mercury",200.59,12,6,"transition","liquid",2.00,-1,"[Xe] 4f¹⁴ 5d¹⁰ 6s²",[2,8,18,32,18,2],12,6,"The other room-temperature liquid; sealed in the historic barometer."],
    [81,"Tl","Thallium",204.38,13,6,"postt","solid",1.62,1861,"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹",[2,8,18,32,18,3],13,6,"Found via its brilliant green spectral line; strictly controlled."],
    [82,"Pb","Lead",207.2,14,6,"postt","solid",2.33,-1,"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²",[2,8,18,32,18,4],14,6,"Shields the lab's gamma-counter behind 5 cm bricks."],
    [83,"Bi","Bismuth",208.98,15,6,"postt","solid",2.02,1753,"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³",[2,8,18,32,18,5],15,6,"Grows iridescent staircase crystals in the crystal-growth demo."],
    [84,"Po","Polonium",209,16,6,"postt","solid",2.00,1898,"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴",[2,8,18,32,18,6],16,6,"Intensely radioactive; only a sealed micro-source is kept."],
    [85,"At","Astatine",210,17,6,"halogen","solid",2.20,1940,"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵",[2,8,18,32,18,7],17,6,"Rarest naturally occurring element; never seen in bulk."],
    [86,"Rn","Radon",222,18,6,"noble","gas",2.20,1900,"[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶",[2,8,18,32,18,8],18,6,"Radioactive gas the building's basement sensors watch for."],
    [87,"Fr","Francium",223,1,7,"alkali","solid",0.70,1939,"[Rn] 7s¹",[2,8,18,32,18,8,1],1,7,"Most reactive metal; only a few thousand atoms ever exist at once."],
    [88,"Ra","Radium",226,2,7,"alkaline","solid",0.90,1898,"[Rn] 7s²",[2,8,18,32,18,8,2],2,7,"Glowed in old instrument dials; now safely retired."],
    [89,"Ac","Actinium",227,3,7,"actin","solid",1.10,1899,"[Rn] 6d¹ 7s²",[2,8,18,32,18,9,2],3,10,"Glows pale blue in the dark from its own radioactivity."],
    [90,"Th","Thorium",232.04,null,7,"actin","solid",1.30,1829,"[Rn] 6d² 7s²",[2,8,18,32,18,10,2],4,10,"Once lit gas lantern mantles with a brilliant white glow."],
    [91,"Pa","Protactinium",231.04,null,7,"actin","solid",1.50,1913,"[Rn] 5f² 6d¹ 7s²",[2,8,18,32,20,9,2],5,10,"One of the rarest and most expensive natural elements."],
    [92,"U","Uranium",238.03,null,7,"actin","solid",1.38,1789,"[Rn] 5f³ 6d¹ 7s²",[2,8,18,32,21,9,2],6,10,"Heaviest primordial element; the teaching-reactor's fuel."],
    [93,"Np","Neptunium",237,null,7,"actin","solid",1.36,1940,"[Rn] 5f⁴ 6d¹ 7s²",[2,8,18,32,22,9,2],7,10,"First transuranium element, named for the next planet out."],
    [94,"Pu","Plutonium",244,null,7,"actin","solid",1.28,1940,"[Rn] 5f⁶ 7s²",[2,8,18,32,24,8,2],8,10,"Warm to the touch from its own decay; six allotropes."],
    [95,"Am","Americium",243,null,7,"actin","solid",1.30,1944,"[Rn] 5f⁷ 7s²",[2,8,18,32,25,8,2],9,10,"The active speck inside household smoke detectors."],
    [96,"Cm","Curium",247,null,7,"actin","solid",1.30,1944,"[Rn] 5f⁷ 6d¹ 7s²",[2,8,18,32,25,9,2],10,10,"Glows red-purple in the dark; powers deep-space probes."],
    [97,"Bk","Berkelium",247,null,7,"actin","solid",1.30,1949,"[Rn] 5f⁹ 7s²",[2,8,18,32,27,8,2],11,10,"Named for its birthplace; produced only in microgram lots."],
    [98,"Cf","Californium",251,null,7,"actin","solid",1.30,1950,"[Rn] 5f¹⁰ 7s²",[2,8,18,32,28,8,2],12,10,"A potent neutron source for the lab's borehole-imaging study."],
    [99,"Es","Einsteinium",252,null,7,"actin","solid",1.30,1952,"[Rn] 5f¹¹ 7s²",[2,8,18,32,29,8,2],13,10,"First spotted in the debris of a thermonuclear test."],
    [100,"Fm","Fermium",257,null,7,"actin","solid",1.30,1952,"[Rn] 5f¹² 7s²",[2,8,18,32,30,8,2],14,10,"Heaviest element that can be made in weighable atoms via neutrons."],
    [101,"Md","Mendelevium",258,null,7,"actin","solid",1.30,1955,"[Rn] 5f¹³ 7s²",[2,8,18,32,31,8,2],15,10,"Named for the architect of the periodic table itself."],
    [102,"No","Nobelium",259,null,7,"actin","solid",1.30,1966,"[Rn] 5f¹⁴ 7s²",[2,8,18,32,32,8,2],16,10,"Prefers the unusual +2 oxidation state in solution."],
    [103,"Lr","Lawrencium",262,3,7,"actin","solid",1.30,1961,"[Rn] 5f¹⁴ 7s² 7p¹",[2,8,18,32,32,8,3],17,10,"Last actinide; bridges to the super-heavy transition metals."],
    [104,"Rf","Rutherfordium",267,4,7,"transition","unknown",null,1969,"[Rn] 5f¹⁴ 6d² 7s²",[2,8,18,32,32,10,2],4,7,"First transactinide; atoms survive only seconds."],
    [105,"Db","Dubnium",268,5,7,"transition","unknown",null,1970,"[Rn] 5f¹⁴ 6d³ 7s²",[2,8,18,32,32,11,2],5,7,"Named for the rival lab that helped discover it."],
    [106,"Sg","Seaborgium",269,6,7,"transition","unknown",null,1974,"[Rn] 5f¹⁴ 6d⁴ 7s²",[2,8,18,32,32,12,2],6,7,"Named for a living scientist — a first at the time."],
    [107,"Bh","Bohrium",270,7,7,"transition","unknown",null,1981,"[Rn] 5f¹⁴ 6d⁵ 7s²",[2,8,18,32,32,13,2],7,7,"Behaves chemically like its lighter cousin rhenium."],
    [108,"Hs","Hassium",269,8,7,"transition","unknown",null,1984,"[Rn] 5f¹⁴ 6d⁶ 7s²",[2,8,18,32,32,14,2],8,7,"Predicted to be the densest element of all."],
    [109,"Mt","Meitnerium",278,9,7,"unknown","unknown",null,1982,"[Rn] 5f¹⁴ 6d⁷ 7s²",[2,8,18,32,32,15,2],9,7,"Honours the physicist who explained nuclear fission."],
    [110,"Ds","Darmstadtium",281,10,7,"unknown","unknown",null,1994,"[Rn] 5f¹⁴ 6d⁸ 7s²",[2,8,18,32,32,16,2],10,7,"Made one atom at a time at a German accelerator."],
    [111,"Rg","Roentgenium",282,11,7,"unknown","unknown",null,1994,"[Rn] 5f¹⁴ 6d⁹ 7s²",[2,8,18,32,32,17,2],11,7,"Named for the discoverer of X-rays."],
    [112,"Cn","Copernicium",285,12,7,"transition","unknown",null,1996,"[Rn] 5f¹⁴ 6d¹⁰ 7s²",[2,8,18,32,32,18,2],12,7,"Might be a gas or liquid — predictions disagree."],
    [113,"Nh","Nihonium",286,13,7,"unknown","unknown",null,2004,"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹",[2,8,18,32,32,18,3],13,7,"First element named in East Asia, after Japan."],
    [114,"Fl","Flerovium",289,14,7,"unknown","unknown",null,1999,"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²",[2,8,18,32,32,18,4],14,7,"Suspected to be surprisingly volatile for a heavy metal."],
    [115,"Mc","Moscovium",290,15,7,"unknown","unknown",null,2003,"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³",[2,8,18,32,32,18,5],15,7,"Decays through a long chain of heavy daughters."],
    [116,"Lv","Livermorium",293,16,7,"unknown","unknown",null,2000,"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴",[2,8,18,32,32,18,6],16,7,"Named for the lab that co-discovered it."],
    [117,"Ts","Tennessine",294,17,7,"halogen","unknown",null,2010,"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵",[2,8,18,32,32,18,7],17,7,"Second-heaviest element; a halogen only in name."],
    [118,"Og","Oganesson",294,18,7,"noble","unknown",null,2002,"[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶",[2,8,18,32,32,18,8],18,7,"Heaviest known element; a noble gas that may not be noble."]
  ];

  // map array rows to objects
  var KEYS = ["z","sym","name","mass","group","period","cat","state","en","disc","conf","shells","col","row","fact"];
  var ELEMENTS = E.map(function (r) {
    var o = {};
    KEYS.forEach(function (k, i) { o[k] = r[i]; });
    o.block = BLOCK(o.group);
    if (o.cat === "lanth" || o.cat === "actin") o.block = "f";
    return o;
  });

  /* ---------------------------------------------------------------
   * Rendering
   * --------------------------------------------------------------- */
  var ptable = document.getElementById("ptable");
  var byZ = {};
  var cellEls = [];
  var mode = "category";

  function enColor(en) {
    // map electronegativity ~0.7..3.98 onto teal->accent->danger ramp
    if (en == null) return "var(--c-unknown)";
    var t = Math.max(0, Math.min(1, (en - 0.7) / (3.98 - 0.7)));
    // interpolate three stops: teal(15,125,120) accent(26,79,138) danger(207,69,56)
    var stops = [[15,125,120],[26,79,138],[207,69,56]];
    var seg = t < 0.5 ? 0 : 1;
    var lt = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
    var a = stops[seg], b = stops[seg + 1];
    var c = a.map(function (v, i) { return Math.round(v + (b[i] - v) * lt); });
    return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
  }

  function tint(hexVar, alpha) {
    // we use rgba over white for fill; resolve CSS var via a probe
    return hexVar;
  }

  function colorFor(el) {
    if (mode === "category") return CATS[el.cat].color;
    if (mode === "state") return STATES[el.state].color;
    return enColor(el.en);
  }

  // build a light fill from a solid color using color-mix (well supported)
  function fillFor(el) {
    var c = colorFor(el);
    return "color-mix(in srgb, " + c + " 16%, #ffffff)";
  }
  function borderFor(el) {
    var c = colorFor(el);
    return "color-mix(in srgb, " + c + " 55%, #ffffff)";
  }

  function applyColors() {
    cellEls.forEach(function (cell) {
      var el = byZ[cell.dataset.z];
      cell.style.setProperty("--cell-bg", fillFor(el));
      cell.style.setProperty("--cell-border", borderFor(el));
    });
  }

  function makeCell(el) {
    var cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    cell.dataset.z = el.z;
    cell.style.gridColumn = el.col;
    cell.style.gridRow = el.row;
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("aria-label", el.name + ", element " + el.z + ", " + CATS[el.cat].label);
    cell.innerHTML =
      '<span class="cell__num">' + el.z + "</span>" +
      '<span class="cell__sym">' + el.sym + "</span>" +
      '<span class="cell__name">' + el.name + "</span>" +
      '<span class="cell__mass">' + fmtMass(el.mass) + "</span>";
    cell.addEventListener("click", function () { openPanel(el); });
    return cell;
  }

  function fmtMass(m) {
    if (m >= 100) return m.toFixed(m % 1 === 0 ? 0 : 2);
    return m.toFixed(m % 1 === 0 ? 0 : 3);
  }

  function buildTable() {
    var frag = document.createDocumentFragment();

    // f-block placeholder cells in the main body (period 6 & 7, group 3 spot)
    ELEMENTS.forEach(function (el) {
      byZ[el.z] = el;
      var cell = makeCell(el);
      cellEls.push(cell);
      frag.appendChild(cell);
    });

    // placeholders pointing to the lanthanide/actinide rows
    [["57–71", 3, 6], ["89–103", 3, 7]].forEach(function (p) {
      var ph = document.createElement("div");
      ph.className = "cell cell--ph";
      ph.style.gridColumn = p[1];
      ph.style.gridRow = p[2];
      ph.setAttribute("aria-hidden", "true");
      ph.innerHTML = '<span class="cell__rng">' + p[0] + "</span>";
      frag.appendChild(ph);
    });

    // small spacer row between main block and f-block
    var spacer = document.createElement("div");
    spacer.className = "fspacer";
    spacer.style.gridRow = "8";
    frag.appendChild(spacer);

    ptable.appendChild(frag);
    applyColors();
  }

  /* ---------------------------------------------------------------
   * Detail panel
   * --------------------------------------------------------------- */
  var panel = document.getElementById("panel");
  var scrim = document.getElementById("scrim");
  var lastFocus = null;

  function openPanel(el) {
    lastFocus = document.activeElement;
    var c = colorFor(el);
    set("panel-symbol", el.sym);
    document.getElementById("panel-symbol").style.background =
      "color-mix(in srgb, " + c + " 88%, #000 0%)";
    set("panel-num", "Z = " + el.z);
    set("panel-name", el.name);
    var catEl = document.getElementById("panel-cat");
    catEl.textContent = CATS[el.cat].label + " · " + el.block + "-block";
    catEl.style.color = c;
    set("panel-mass", fmtMass(el.mass) + " u");
    set("panel-gp", (el.group ? "Group " + el.group : "f-block") + " · Period " + el.period);
    set("panel-block", el.block + "-block");
    set("panel-state", STATES[el.state].label + " at 298 K");
    set("panel-en", el.en == null ? "—" : el.en.toFixed(2) + " (Pauling)");
    set("panel-disc", el.disc === -1 ? "Antiquity" : String(el.disc));
    set("panel-conf", el.conf);
    set("panel-rec", "#" + String(el.z).padStart(4, "0"));
    document.getElementById("panel-fact").textContent = "“" + el.fact + "”";

    var shells = document.getElementById("panel-shells");
    shells.innerHTML = "";
    el.shells.forEach(function (n, i) {
      var s = document.createElement("span");
      s.className = "shell";
      s.textContent = "n" + (i + 1) + ": " + n;
      shells.appendChild(s);
    });

    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
    document.getElementById("panel-close").focus();
  }

  function closePanel() {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function set(id, txt) { document.getElementById(id).textContent = txt; }

  document.getElementById("panel-close").addEventListener("click", closePanel);
  scrim.addEventListener("click", closePanel);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("is-open")) closePanel();
  });

  /* ---------------------------------------------------------------
   * Color-mode toggle
   * --------------------------------------------------------------- */
  var segBtns = Array.prototype.slice.call(document.querySelectorAll(".seg__btn"));
  segBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      mode = btn.dataset.mode;
      segBtns.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-checked", on ? "true" : "false");
      });
      applyColors();
      renderLegend();
      toast("Coloring by " + btn.textContent.trim().toLowerCase());
    });
  });

  /* ---------------------------------------------------------------
   * Legend
   * --------------------------------------------------------------- */
  var legend = document.getElementById("legend");
  var legendMode = document.getElementById("legend-mode");

  function renderLegend() {
    legend.innerHTML = "";
    legendMode.textContent = "· by " + mode;
    if (mode === "electronegativity") {
      var ramp = document.createElement("li");
      ramp.innerHTML =
        '<span class="swatch" style="background:' + enColor(0.7) + '"></span>0.70' +
        '<span class="swatch" style="background:' + enColor(2.3) + ';margin-left:14px"></span>~2.3' +
        '<span class="swatch" style="background:' + enColor(3.98) + ';margin-left:14px"></span>3.98 (Pauling)';
      legend.appendChild(ramp);
      var unk = document.createElement("li");
      unk.innerHTML = '<span class="swatch" style="background:var(--c-unknown)"></span>No accepted value';
      legend.appendChild(unk);
      return;
    }
    var src = mode === "state" ? STATES : CATS;
    Object.keys(src).forEach(function (k) {
      var li = document.createElement("li");
      li.innerHTML = '<span class="swatch" style="background:' + src[k].color + '"></span>' + src[k].label;
      legend.appendChild(li);
    });
  }

  /* ---------------------------------------------------------------
   * Search
   * --------------------------------------------------------------- */
  var search = document.getElementById("search");
  var searchCount = document.getElementById("search-count");

  function runSearch() {
    var q = search.value.trim().toLowerCase();
    if (!q) {
      cellEls.forEach(function (c) { c.classList.remove("is-dim", "is-hit"); });
      searchCount.textContent = "";
      return;
    }
    var hits = 0;
    cellEls.forEach(function (cell) {
      var el = byZ[cell.dataset.z];
      var match =
        el.sym.toLowerCase() === q ||
        el.sym.toLowerCase().indexOf(q) === 0 ||
        el.name.toLowerCase().indexOf(q) !== -1 ||
        String(el.z) === q;
      cell.classList.toggle("is-hit", match);
      cell.classList.toggle("is-dim", !match);
      if (match) hits++;
    });
    searchCount.textContent = hits + (hits === 1 ? " match" : " matches");
  }
  search.addEventListener("input", runSearch);
  search.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      var hit = cellEls.filter(function (c) { return c.classList.contains("is-hit"); });
      if (hit.length === 1) openPanel(byZ[hit[0].dataset.z]);
    }
  });

  /* ---------------------------------------------------------------
   * Toast helper
   * --------------------------------------------------------------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-show"); }, 1800);
  }

  /* ---------------------------------------------------------------
   * Init
   * --------------------------------------------------------------- */
  buildTable();
  renderLegend();
})();
