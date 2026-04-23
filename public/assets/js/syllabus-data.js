// JEE Syllabus — All chapters with priority, class, topics, units
const JEE_SYLLABUS = {
  phy: {
    name: 'Physics', color: 'var(--phy)', icon: '⚡',
    chapters: [
      // PRIORITY A — Highest weightage
      { id:'phy_thermo',   name:'Thermodynamics',              cls:11, priority:'A', unit:'Thermodynamics',    topics:['Zeroth Law','First Law & Work done','Second Law & Entropy','Carnot Engine','Heat Engines & Refrigerators','Thermodynamic processes'] },
      { id:'phy_em',       name:'Electrostatics',              cls:12, priority:'A', unit:'Electromagnetism',  topics:['Coulombs Law','Electric Field','Gauss Law','Electric Potential','Capacitors','Energy stored in capacitor'] },
      { id:'phy_curr',     name:'Current Electricity',         cls:12, priority:'A', unit:'Electromagnetism',  topics:['Ohms Law','Kirchhoffs Laws','Wheatstone Bridge','Cells & EMF','RC Circuits','Meter Bridge'] },
      { id:'phy_mag',      name:'Magnetic Effects of Current', cls:12, priority:'A', unit:'Electromagnetism',  topics:['Biot-Savart Law','Amperes Law','Moving Charges in Magnetic Field','Cyclotron','Magnetism in Matter'] },
      { id:'phy_optics',   name:'Ray Optics',                  cls:12, priority:'A', unit:'Optics & Modern',   topics:['Reflection','Refraction','Snells Law','Prism','Lens Formula','Mirrors','Optical Instruments'] },
      { id:'phy_modern',   name:'Modern Physics',              cls:12, priority:'A', unit:'Optics & Modern',   topics:['Photoelectric Effect','de Broglie','Bohrs Model','Radioactivity','Nuclear Reactions','X-rays'] },
      { id:'phy_com',      name:'Centre of Mass & Collisions', cls:11, priority:'A', unit:'Mechanics I',       topics:['Centre of Mass','Linear Momentum','Collisions','Variable Mass System'] },
      { id:'phy_dual',     name:'Dual Nature of Radiation & Matter', cls:12, priority:'A', unit:'Optics & Modern', topics:['Photoelectric Effect','Matter Waves','Davisson-Germer Experiment'] },
      // PRIORITY B
      { id:'phy_emi',      name:'Electromagnetic Induction',   cls:12, priority:'B', unit:'Electromagnetism',  topics:['Faradays Law','Lenzs Law','Self Inductance','Mutual Inductance'] },
      { id:'phy_ac',       name:'Alternating Current',         cls:12, priority:'B', unit:'Electromagnetism',  topics:['AC Circuits','Resonance','Transformers','LC Oscillations'] },
      { id:'phy_waves',    name:'Waves',                       cls:11, priority:'B', unit:'Mechanics II',      topics:['Wave equation','Speed of sound','Superposition','Standing waves','Beats','Doppler Effect'] },
      { id:'phy_shm',      name:'Simple Harmonic Motion',      cls:11, priority:'B', unit:'Mechanics II',      topics:['SHM equation','Energy in SHM','Spring-mass system','Simple pendulum','Damped oscillations'] },
      { id:'phy_osc',      name:'Oscillations',                cls:11, priority:'B', unit:'Mechanics II',      topics:['Periodic motion','Restoring force','Phase'] },
      { id:'phy_kine',     name:'Kinematics',                  cls:11, priority:'B', unit:'Mechanics I',       topics:['Motion in straight line','Projectile motion','Relative motion','Circular motion'] },
      { id:'phy_nwt',      name:'Laws of Motion',              cls:11, priority:'B', unit:'Mechanics I',       topics:['Newtons 3 laws','Friction','Pseudo force','Pulleys','Constraint equations'] },
      { id:'phy_wpe',      name:'Work, Power & Energy',        cls:11, priority:'B', unit:'Mechanics I',       topics:['Work-Energy theorem','Conservative forces','Potential energy','Power'] },
      { id:'phy_wavop',    name:'Wave Optics',                 cls:12, priority:'B', unit:'Optics & Modern',   topics:['Huygens Principle','Interference','YDSE','Diffraction','Polarisation'] },
      // PRIORITY C
      { id:'phy_rot',      name:'Rotational Motion',           cls:11, priority:'C', unit:'Mechanics I',       topics:['Moment of inertia','Torque','Angular momentum','Rolling motion','Gyroscope'] },
      { id:'phy_grav',     name:'Gravitation',                 cls:11, priority:'C', unit:'Mechanics I',       topics:['Universal Law','Gravitational field','Escape velocity','Orbital velocity','Keplers Laws','Satellites'] },
      { id:'phy_fluid',    name:'Fluid Mechanics',             cls:11, priority:'C', unit:'Mechanics II',      topics:['Pressure','Archimedes Principle','Bernoullis equation','Viscosity','Surface tension'] },
      { id:'phy_kt',       name:'Kinetic Theory of Gases',     cls:11, priority:'C', unit:'Thermodynamics',    topics:['Ideal gas equation','KE of gas','Specific heats','Degrees of freedom','Mean free path'] },
      { id:'phy_semi',     name:'Semiconductors',              cls:12, priority:'C', unit:'Optics & Modern',   topics:['p-n junction','Diode characteristics','Zener diode','Transistors','Logic gates'] },
      { id:'phy_atoms',    name:'Atoms',                       cls:12, priority:'C', unit:'Optics & Modern',   topics:['Rutherford Model','Bohr Model','Energy Levels','Hydrogen Spectrum'] },
      { id:'phy_nuclei',   name:'Nuclei',                      cls:12, priority:'C', unit:'Optics & Modern',   topics:['Nuclear Structure','Mass Defect','Binding Energy','Radioactivity'] },
      // PRIORITY D
      { id:'phy_prop',     name:'Properties of Solids & Liquids', cls:11, priority:'D', unit:'Mechanics II',  topics:['Elasticity','Stress-Strain','Youngs modulus','Thermal expansion','Calorimetry'] },
      { id:'phy_comm',     name:'Communication Systems',       cls:12, priority:'D', unit:'Optics & Modern',   topics:['Modulation','AM & FM','Bandwidth','Propagation of EM waves'] },
      { id:'phy_mech_unit',name:'Units & Measurements',        cls:11, priority:'D', unit:'Mechanics I',       topics:['SI units','Dimensions','Error analysis','Significant figures'] },
      { id:'phy_emwaves',  name:'Electromagnetic Waves',       cls:12, priority:'D', unit:'Electromagnetism',  topics:['Displacement Current','EM Spectrum','Properties of EM Waves'] },
      { id:'phy_exp',      name:'Experimental Skills',         cls:12, priority:'B', unit:'Mechanics I',       topics:['Vernier calipers','Screw gauge','Simple pendulum','Meter scale','Youngs modulus'] },
    ]
  },
  chem: {
    name: 'Chemistry', color: 'var(--chem)', icon: '🧪',
    chapters: [
      // PRIORITY A
      { id:'ch_thermo',   name:'Thermodynamics & Thermochemistry', cls:11, priority:'A', unit:'Physical',    topics:['Internal energy','Enthalpy','Hess Law','Bond enthalpy','Entropy','Gibbs energy'] },
      { id:'ch_electro',  name:'Electrochemistry',            cls:12, priority:'A', unit:'Physical',         topics:['Electrolytic cells','Galvanic cells','EMF','Nernst equation','Conductance','Faradays laws','Batteries'] },
      { id:'ch_bond',     name:'Chemical Bonding',            cls:11, priority:'A', unit:'Inorganic',        topics:['Ionic bonding','Covalent bonding','VSEPR','Hybridisation','MOT','Hydrogen bonding','Resonance'] },
      { id:'ch_dblock',   name:'d & f Block Elements',        cls:12, priority:'A', unit:'Inorganic',        topics:['Properties of transition metals','Oxides & halides','Lanthanides','Actinides','Magnetic properties'] },
      { id:'ch_coord',    name:'Coordination Compounds',      cls:12, priority:'A', unit:'Inorganic',        topics:['Werner theory','Nomenclature','Isomerism','Bonding (CFT & VBT)','Colour & magnetism','Stability'] },
      { id:'ch_goc',      name:'General Organic Chemistry',   cls:11, priority:'A', unit:'Organic',          topics:['IUPAC nomenclature','Inductive effect','Resonance','Hyperconjugation','Carbocations','Carbanions','Radicals'] },
      { id:'ch_haloalk',  name:'Haloalkanes & Haloarenes',    cls:12, priority:'A', unit:'Organic',          topics:['SN1 & SN2','E1 & E2','Nucleophilic substitution','Elimination','Grignard reagents'] },
      { id:'ch_carbony',  name:'Carbonyl Compounds',          cls:12, priority:'A', unit:'Organic',          topics:['Aldehydes','Ketones','Carboxylic acids','Esters','Nucleophilic addition','Aldol condensation'] },
      // PRIORITY B
      { id:'ch_equil',    name:'Chemical Equilibrium',        cls:11, priority:'B', unit:'Physical',         topics:['Kp & Kc','Le Chatelier principle','Degree of dissociation','Ionic equilibrium','pH','Buffer'] },
      { id:'ch_kinetics', name:'Chemical Kinetics',           cls:12, priority:'B', unit:'Physical',         topics:['Rate of reaction','Rate law','Integrated rate equations','Arrhenius equation','Activation energy','Catalysis'] },
      { id:'ch_pblock',   name:'p-Block Elements',            cls:12, priority:'B', unit:'Inorganic',        topics:['Group 15','Group 16','Group 17','Group 18','Important compounds','Oxoacids'] },
      { id:'ch_amines',   name:'Amines',                      cls:12, priority:'B', unit:'Organic',          topics:['Classification','Basicity','Reactions','Diazonium salts','Coupling reactions'] },
      { id:'ch_alcohol',  name:'Alcohols, Phenols & Ethers',  cls:12, priority:'B', unit:'Organic',          topics:['Preparation','Physical properties','Reactions of alcohols','Phenol reactions','Ethers'] },
      { id:'ch_sblock',   name:'s-Block Elements',            cls:11, priority:'B', unit:'Inorganic',        topics:['Alkali metals','Alkaline earth metals','Important compounds','Diagonal relationship'] },
      { id:'ch_mole',     name:'Mole Concept & Stoichiometry',cls:11, priority:'B', unit:'Physical',         topics:['Mole','Avogadro number','Limiting reagent','% yield','Empirical formula','Concentration terms'] },
      { id:'ch_atom',     name:'Atomic Structure',            cls:11, priority:'B', unit:'Physical',         topics:['Bohr model','de Broglie','Heisenberg','Quantum numbers','Electronic configuration','Pauli & Hunds rule'] },
      { id:'ch_redox',    name:'Redox Reactions',             cls:11, priority:'C', unit:'Physical',         topics:['Oxidation state','Balancing redox','Titrations','Electrochemical cells'] },
      { id:'ch_practical',name:'Practical Chemistry',         cls:11, priority:'B', unit:'Inorganic',        topics:['Salt analysis','Titrations','Qualitative analysis','Organic functional groups'] },
      // PRIORITY C
      { id:'ch_sol',      name:'Solutions',                   cls:12, priority:'C', unit:'Physical',         topics:['Raoults law','Colligative properties','Osmosis','Vant Hoff factor','Azeotropes'] },
      { id:'ch_sstate',   name:'Solid State',                 cls:12, priority:'C', unit:'Physical',         topics:['Crystal systems','Unit cell','Packing fraction','Defects','Properties'] },
      { id:'ch_hydro',    name:'Hydrocarbons',                cls:11, priority:'C', unit:'Organic',          topics:['Alkanes','Alkenes','Alkynes','Arenes','Markovnikovs rule','EAS'] },
      { id:'ch_biomol',   name:'Biomolecules',                cls:12, priority:'C', unit:'Organic',          topics:['Carbohydrates','Proteins','Enzymes','Nucleic acids','Vitamins','Hormones'] },
      { id:'ch_ptable',   name:'Periodic Table & Properties', cls:11, priority:'C', unit:'Inorganic',        topics:['Periodicity','Atomic radius','Ionisation energy','Electron affinity','Electronegativity'] },
      { id:'ch_metal',    name:'Metallurgy',                  cls:12, priority:'C', unit:'Inorganic',        topics:['Ores','Concentration','Extraction','Refining','Thermodynamics of metallurgy'] },
      // PRIORITY D
      { id:'ch_poly',     name:'Polymers',                    cls:12, priority:'D', unit:'Organic',          topics:['Addition polymers','Condensation polymers','Natural rubber','Nylon','Bakelite'] },
      { id:'ch_surface',  name:'Surface Chemistry',           cls:12, priority:'D', unit:'Physical',         topics:['Adsorption','Colloids','Emulsions','Catalysis types','Tyndall effect'] },
      { id:'ch_enviro',   name:'Environmental Chemistry',     cls:11, priority:'D', unit:'Physical',         topics:['Air pollution','Water pollution','Ozone depletion','Green chemistry'] },
      { id:'ch_everyday', name:'Chemistry in Everyday Life',  cls:12, priority:'D', unit:'Organic',          topics:['Drugs','Dyes','Detergents','Food preservatives','Rocket propellants'] },
      { id:'ch_hydrog',   name:'Hydrogen',                    cls:11, priority:'D', unit:'Inorganic',        topics:['Isotopes','Hydrides','Water','Hydrogen peroxide','Heavy water'] },
      { id:'ch_states',   name:'States of Matter',            cls:11, priority:'D', unit:'Physical',         topics:['Gas laws','Ideal gas equation','Kinetic theory','Liquefaction','Liquid state'] },
    ]
  },
  math: {
    name: 'Mathematics', color: 'var(--math)', icon: '∑',
    chapters: [
      // PRIORITY A
      { id:'m_matdet',    name:'Matrices & Determinants',     cls:12, priority:'A', unit:'Algebra',          topics:['Matrix operations','Determinant properties','Inverse','Cramers rule','System of equations'] },
      { id:'m_binom',     name:'Binomial Theorem',            cls:11, priority:'A', unit:'Algebra',          topics:['Binomial expansion','General term','Middle term','Greatest coefficient','Properties of coefficients'] },
      { id:'m_seqseries', name:'Sequences & Series',          cls:11, priority:'A', unit:'Algebra',          topics:['AP & GP','Harmonic Progression','Sum to n terms','AGP','Infinite GP','Telescoping series'] },
      { id:'m_func',      name:'Functions',                   cls:11, priority:'A', unit:'Calculus',         topics:['Domain & Range','Injective/Surjective/Bijective','Composite functions','Inverse functions','Even/Odd'] },
      { id:'m_vec3d',     name:'Vectors & 3D Geometry',       cls:12, priority:'A', unit:'Coord & Vectors',  topics:['Dot & Cross product','Triple product','Direction cosines','Lines in 3D','Planes','Angle between'] },
      { id:'m_integ',     name:'Definite Integration',        cls:12, priority:'A', unit:'Calculus',         topics:['Properties of definite integrals','Leibniz rule','Beta-Gamma functions','Reduction formulae','Area'] },
      { id:'m_area',      name:'Area Under Curves',           cls:12, priority:'A', unit:'Calculus',         topics:['Area bounded by curves','Area between two curves'] },
      // PRIORITY B
      { id:'m_lim',       name:'Limits, Continuity & Differentiability', cls:11, priority:'B', unit:'Calculus', topics:['L-Hopitals rule','Sandwich theorem','Continuity','Differentiability','Mean Value Theorem'] },
      { id:'m_deriv',     name:'Differentiation & Applications', cls:12, priority:'B', unit:'Calculus',      topics:['Chain rule','Implicit differentiation','Parametric','Maxima & Minima','Tangents & Normals','Monotonicity'] },
      { id:'m_indef',     name:'Indefinite Integration',      cls:12, priority:'B', unit:'Calculus',         topics:['Standard integrals','Substitution','By parts','Partial fractions','Special integrals'] },
      { id:'m_prob',      name:'Probability',                 cls:12, priority:'B', unit:'Algebra',          topics:['Classical probability','Conditional probability','Bayes theorem','Random variable','Binomial distribution'] },
      { id:'m_coord',     name:'Coordinate Geometry — Conics',cls:11, priority:'B', unit:'Coord & Vectors',  topics:['Parabola','Ellipse','Hyperbola','Chord of contact','Normals','Tangents'] },
      { id:'m_perm',      name:'Permutations & Combinations', cls:11, priority:'B', unit:'Algebra',          topics:['Fundamental counting','Permutations','Combinations','Circular arrangements','Distribution'] },
      { id:'m_complex',   name:'Complex Numbers',             cls:11, priority:'B', unit:'Algebra',          topics:['Algebra of complex numbers','Modulus & Argument','De Moivres theorem','Roots of unity','Geometry'] },
      // PRIORITY C
      { id:'m_quad',      name:'Quadratic Equations',         cls:11, priority:'C', unit:'Algebra',          topics:['Nature of roots','Vieta formulae','Common roots','Max/Min of quadratic','Graph of quadratic'] },
      { id:'m_sl',        name:'Straight Lines',              cls:11, priority:'C', unit:'Coord & Vectors',  topics:['Slope','Equations of line','Distance formulae','Angle between lines','Family of lines'] },
      { id:'m_circle',    name:'Circles',                     cls:11, priority:'C', unit:'Coord & Vectors',  topics:['Equation of circle','Tangents','Chords','Common tangents','Radical axis','Family of circles'] },
      { id:'m_diffeq',    name:'Differential Equations',      cls:12, priority:'C', unit:'Calculus',         topics:['Order & Degree','Variable separable','Homogeneous','Linear DE','Bernoullis equation'] },
      { id:'m_trig',      name:'Trigonometry',                cls:11, priority:'C', unit:'Trig & Stats',     topics:['Trigonometric ratios','Identities','Compound angles','Multiple angles','Sub-multiple angles','Inverse trig'] },
      { id:'m_prop_trig', name:'Properties of Triangles',     cls:11, priority:'C', unit:'Trig & Stats',     topics:['Sine rule','Cosine rule','Projection formula','Incircle','Circumcircle','Area of triangle'] },
      // PRIORITY D
      { id:'m_stats',     name:'Statistics',                  cls:11, priority:'D', unit:'Trig & Stats',     topics:['Mean, Median, Mode','Variance','Standard deviation','Frequency distribution'] },
      { id:'m_sets',      name:'Sets, Relations & Functions', cls:11, priority:'D', unit:'Algebra',          topics:['Set operations','Venn diagrams','Types of relations','Equivalence relations'] },
      { id:'m_mathind',   name:'Mathematical Induction',      cls:11, priority:'D', unit:'Algebra',          topics:['Principle of induction','Strong induction','Well-ordering principle'] },
      { id:'m_lp',        name:'Linear Programming',          cls:12, priority:'D', unit:'Algebra',          topics:['Feasible region','Corner point method','Maximize/Minimize','Graphical method'] },
      { id:'m_reasoning', name:'Mathematical Reasoning',      cls:11, priority:'D', unit:'Algebra',          topics:['Statements','Logical operations','Tautology','Contradiction','Converse & Contrapositive'] },
    ]
  },
  eng: {
    name: 'English', color: 'var(--eng)', icon: '📖',
    chapters: [
      { id:'eng_reading', name:'Reading Skills',        cls:12, priority:'A', unit:'Reading', topics:['Unseen Passages'] },
      { id:'eng_writing', name:'Creative Writing',      cls:12, priority:'A', unit:'Writing', topics:['Notice','Invitations & Replies','Letters','Article/Report'] },
      { id:'eng_fl_prose',name:'Flamingo: Prose',       cls:12, priority:'A', unit:'Literature', topics:['The Last Lesson','Lost Spring','Deep Water','The Rattrap','Indigo','Poets and Pancakes','The Interview','Going Places'] },
      { id:'eng_fl_poem', name:'Flamingo: Poetry',      cls:12, priority:'B', unit:'Literature', topics:['My Mother at Sixty-six','Keeping Quiet','A Thing of Beauty','A Roadside Stand','Aunt Jennifers Tigers'] },
      { id:'eng_vistas',  name:'Vistas (Suppl.)',       cls:12, priority:'A', unit:'Literature', topics:['The Third Level','The Tiger King','Journey to the End of the Earth','The Enemy','On the Face of It','Memories of Childhood'] },
    ]
  },
  pe: {
    name: 'Phys. Ed', color: 'var(--pe)', icon: '🏃',
    chapters: [
      { id:'pe_mgmt',     name:'Management of Sporting Events', cls:12, priority:'A', unit:'PE', topics:['Committees','Fixtures','Knockout','League'] },
      { id:'pe_women',    name:'Children & Women in Sports',    cls:12, priority:'B', unit:'PE', topics:['Motor development','Postural deformities','Menarche'] },
      { id:'pe_yoga',     name:'Yoga as Preventive Measure',    cls:12, priority:'A', unit:'PE', topics:['Obesity','Diabetes','Asthma','Hypertension'] },
      { id:'pe_cwsn',     name:'PE & Sports for CWSN',          cls:12, priority:'B', unit:'PE', topics:['Organizations','Special Olympics','Paralympics'] },
      { id:'pe_nutri',    name:'Sports & Nutrition',            cls:12, priority:'A', unit:'PE', topics:['Balanced Diet','Macro & Micro Nutrients'] },
      { id:'pe_test',     name:'Test & Measurement in Sports',  cls:12, priority:'C', unit:'PE', topics:['Fitness Test','SAI Khelo India','Motor Fitness'] },
      { id:'pe_physio',   name:'Physiology & Injuries in Sports',cls:12,priority:'A', unit:'PE', topics:['Physiological factors','Sports injuries','First Aid'] },
      { id:'pe_biomech',  name:'Biomechanics & Sports',         cls:12, priority:'C', unit:'PE', topics:['Newtons Laws','Friction','Projectile'] },
      { id:'pe_psycho',   name:'Psychology & Sports',           cls:12, priority:'B', unit:'PE', topics:['Personality','Motivation','Aggression'] },
      { id:'pe_train',    name:'Training in Sports',            cls:12, priority:'A', unit:'PE', topics:['Strength','Endurance','Speed','Flexibility'] },
    ]
  },
  cbse_phy: {
    name: 'CBSE Physics (Cls 12)', color: 'var(--blue)', icon: '🔭',
    chapters: [
      { id:'cb_p1', name:'Electric Charges and Fields', cls:12, priority:'A', unit:'Electrostatics', topics:['Gauss Law Derivations','Dipole Field','Torque on Dipole'] },
      { id:'cb_p2', name:'Electrostatic Potential & Capacitance', cls:12, priority:'A', unit:'Electrostatics', topics:['Potential Derivations','Parallel Plate Capacitor','Energy Stored'] },
      { id:'cb_p3', name:'Current Electricity', cls:12, priority:'A', unit:'Current', topics:['Drift Velocity Derivation','Wheatstone Bridge','Cells in Series/Parallel'] },
      { id:'cb_p4', name:'Moving Charges and Magnetism', cls:12, priority:'A', unit:'Magnetism', topics:['Biot-Savart Applications','Amperes Law','Force between wires','Galvanometer'] },
      { id:'cb_p5', name:'Magnetism and Matter', cls:12, priority:'B', unit:'Magnetism', topics:['Earths Magnetism','Magnetic Properties','Solenoid as Magnet'] },
      { id:'cb_p6', name:'Electromagnetic Induction', cls:12, priority:'A', unit:'EMI & AC', topics:['Faradays Laws','Motional EMF Derivation','Self & Mutual Inductance'] },
      { id:'cb_p7', name:'Alternating Current', cls:12, priority:'A', unit:'EMI & AC', topics:['LCR Series Circuit','Resonance','AC Generator','Transformer'] },
      { id:'cb_p8', name:'Electromagnetic Waves', cls:12, priority:'B', unit:'EM Waves', topics:['Displacement Current','EM Spectrum'] },
      { id:'cb_p9', name:'Ray Optics and Optical Instruments', cls:12, priority:'A', unit:'Optics', topics:['Lens Makers Formula','Prism Formula','Microscope/Telescope Magnification'] },
      { id:'cb_p10', name:'Wave Optics', cls:12, priority:'A', unit:'Optics', topics:['Huygens Principle Derivations','YDSE Fringe Width','Diffraction'] },
      { id:'cb_p11', name:'Dual Nature of Radiation', cls:12, priority:'B', unit:'Modern Physics', topics:['Einsteins Equation','de Broglie Wavelength'] },
      { id:'cb_p12', name:'Atoms', cls:12, priority:'B', unit:'Modern Physics', topics:['Bohr Radius Derivation','Energy Levels','Hydrogen Spectrum'] },
      { id:'cb_p13', name:'Nuclei', cls:12, priority:'C', unit:'Modern Physics', topics:['Mass Defect','Binding Energy Curve','Nuclear Forces'] },
      { id:'cb_p14', name:'Semiconductor Electronics', cls:12, priority:'A', unit:'Electronic Devices', topics:['p-n Junction','Half/Full Wave Rectifiers','V-I Characteristics'] }
    ]
  },
  cbse_chem: {
    name: 'CBSE Chemistry (Cls 12)', color: 'var(--amber)', icon: '🧪',
    chapters: [
      { id:'cb_c1', name:'Solutions', cls:12, priority:'A', unit:'Physical', topics:['Raoults Law','Colligative Properties','Vant Hoff Factor'] },
      { id:'cb_c2', name:'Electrochemistry', cls:12, priority:'A', unit:'Physical', topics:['Nernst Equation','Kohlrausch Law','Batteries','Fuel Cells'] },
      { id:'cb_c3', name:'Chemical Kinetics', cls:12, priority:'A', unit:'Physical', topics:['Integrated Rate Equations','Arrhenius Equation','Order & Molecularity'] },
      { id:'cb_c4', name:'d and f Block Elements', cls:12, priority:'B', unit:'Inorganic', topics:['Lanthanoid Contraction','KMnO4 & K2Cr2O7','Magnetic Properties'] },
      { id:'cb_c5', name:'Coordination Compounds', cls:12, priority:'A', unit:'Inorganic', topics:['Nomenclature','VBT & CFT','Isomerism'] },
      { id:'cb_c6', name:'Haloalkanes and Haloarenes', cls:12, priority:'B', unit:'Organic', topics:['SN1 & SN2 Mechanisms','Elimination Reactions','Grignard Reagents'] },
      { id:'cb_c7', name:'Alcohols, Phenols and Ethers', cls:12, priority:'A', unit:'Organic', topics:['Acidic Nature','Esterification','Name Reactions'] },
      { id:'cb_c8', name:'Aldehydes, Ketones, Carboxylic Acids', cls:12, priority:'A', unit:'Organic', topics:['Nucleophilic Addition','Aldol & Cannizzaro','Acidity of Carboxylic Acids'] },
      { id:'cb_c9', name:'Amines', cls:12, priority:'B', unit:'Organic', topics:['Basicity Order','Diazonium Salts','Hinsberg Test'] },
      { id:'cb_c10', name:'Biomolecules', cls:12, priority:'A', unit:'Organic', topics:['Carbohydrates','Proteins & Amino Acids','Nucleic Acids','Vitamins'] }
    ]
  },
  cbse_math: {
    name: 'CBSE Mathematics (Cls 12)', color: 'var(--purple)', icon: '📐',
    chapters: [
      { id:'cb_m1', name:'Relations and Functions', cls:12, priority:'B', unit:'Algebra', topics:['Equivalence Relation','One-One & Onto Functions'] },
      { id:'cb_m2', name:'Inverse Trigonometric Functions', cls:12, priority:'B', unit:'Algebra', topics:['Domain & Range','Principal Value Branches'] },
      { id:'cb_m3', name:'Matrices', cls:12, priority:'B', unit:'Algebra', topics:['Matrix Operations','Symmetric & Skew-symmetric'] },
      { id:'cb_m4', name:'Determinants', cls:12, priority:'A', unit:'Algebra', topics:['Area of Triangle','Adjoint & Inverse','System of Linear Equations'] },
      { id:'cb_m5', name:'Continuity & Differentiability', cls:12, priority:'A', unit:'Calculus', topics:['Chain Rule','Parametric Differentiation','Second Order Derivatives'] },
      { id:'cb_m6', name:'Applications of Derivatives', cls:12, priority:'A', unit:'Calculus', topics:['Rate of Change','Increasing/Decreasing','Maxima & Minima'] },
      { id:'cb_m7', name:'Integrals', cls:12, priority:'A', unit:'Calculus', topics:['By Parts','Partial Fractions','Definite Integral Properties'] },
      { id:'cb_m8', name:'Application of Integrals', cls:12, priority:'B', unit:'Calculus', topics:['Area under Simple Curves'] },
      { id:'cb_m9', name:'Differential Equations', cls:12, priority:'B', unit:'Calculus', topics:['Order & Degree','Variable Separable','Homogeneous & Linear DE'] },
      { id:'cb_m10', name:'Vector Algebra', cls:12, priority:'B', unit:'Vectors & 3D', topics:['Dot & Cross Product','Direction Cosines','Projection'] },
      { id:'cb_m11', name:'Three Dimensional Geometry', cls:12, priority:'A', unit:'Vectors & 3D', topics:['Lines in Space','Angle Between Lines','Shortest Distance'] },
      { id:'cb_m12', name:'Linear Programming', cls:12, priority:'C', unit:'Linear Prog', topics:['Graphical Method','Feasible Region','Maximize/Minimize'] },
      { id:'cb_m13', name:'Probability', cls:12, priority:'A', unit:'Probability', topics:['Conditional Probability','Bayes Theorem','Probability Distribution'] }
    ]
  }
};

const PRIORITY_COLORS = { A:'#ef4444', B:'#f59e0b', C:'#22d3ee', D:'#94a3b8' };
const PRIORITY_LABELS = { A:'Priority A — Must Do', B:'Priority B — High Value', C:'Priority C — Moderate', D:'Priority D — Low Priority' };
const STATUS_LEVELS   = ['todo','theory','pyqs','mastered'];
const STATUS_LABELS   = { todo:'To Do', theory:'Theory', pyqs:'+ PYQs', mastered:'Mastered' };
const STATUS_COLORS   = { todo:'var(--muted)', theory:'var(--amber)', pyqs:'var(--blue)', mastered:'var(--green)' };
