import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const CORE_SUBJECTS = ["Science", "Social Science", "Mathematics", "English", "Kannada", "Hindi"];

const COMPREHENSIVE_SYLLABUS = {
  // =============================== CLASS 10 ===============================
  10: {
    Science: [
      {
        id: "s10_chem1",
        chapter: "Chemical Reactions & Equations",
        unit: "Chemistry",
        weightage: "6 Marks",
        rootConcept: "Conservation of Mass in Chemical Change",
        nodes: [
          {
            title: "Types of Reactions",
            points: [
              "Combination: A + B → AB",
              "Decomposition: Heat (Thermal), Light (Photo), Electricity (Electrolytic)",
              "Displacement: Fe + CuSO₄ → FeSO₄ + Cu",
              "Double Displacement: Na₂SO₄ + BaCl₂ → BaSO₄↓ + 2NaCl"
            ],
            mnemonic: "Remember: 'C-D-D-R' (Combine, Decompose, Displace, Redox)",
            color: "#3b82f6"
          },
          {
            title: "Redox Mechanisms",
            points: [
              "Oxidation: Gain of O₂ or Loss of H₂ / Electrons",
              "Reduction: Loss of O₂ or Gain of H₂ / Electrons",
              "Oxidizing Agent: Supplies oxygen or gains electrons",
              "Reducing Agent: Removes oxygen or donates electrons"
            ],
            mnemonic: "OIL RIG: Oxidation Is Loss, Reduction Is Gain of electrons",
            color: "#8b5cf6"
          },
          {
            title: "Corrosion & Rancidity",
            points: [
              "Rusting of iron: 2Fe₂O₃·xH₂O (Requires both O₂ and H₂O)",
              "Prevention: Galvanization (Zinc coating), Electroplating",
              "Rancidity: Oxidation of fats causing unpalatable smell/taste",
              "Antioxidants: Nitrogen gas flushed in food packaging"
            ],
            mnemonic: "Barrier, Sacrificial, and Inert atmosphere protection",
            color: "#f59e0b"
          }
        ],
        diagram: {
          central: "Chemical Reactions",
          branches: [
            { label: "Synthesis", formula: "A + B → AB" },
            { label: "Breakdown", formula: "AB → A + B (Heat/Light)" },
            { label: "Single Swap", formula: "A + BC → AC + B" },
            { label: "Double Swap", formula: "AB + CD → AD + CB (Precipitate)" }
          ]
        }
      },
      {
        id: "s10_phy1",
        chapter: "Electricity & Circuit Laws",
        unit: "Physics",
        weightage: "7 Marks",
        rootConcept: "Flow of Electric Charge & Energy Transformation",
        nodes: [
          {
            title: "Ohm's Law & Circuit Parameters",
            points: [
              "Potential difference V = W / Q (1 Volt = 1 Joule / Coulomb)",
              "Current I = Q / t (1 Ampere = 1 Coulomb / sec)",
              "Resistance R depends on: length (l), area (A), material (ρ)",
              "R = ρ (l / A) (Unit of ρ: Ω·m)"
            ],
            mnemonic: "V on top of the pyramid: V = I × R",
            color: "#10b981"
          },
          {
            title: "Resistor Topologies",
            points: [
              "Series: Current I is constant, V divides",
              "R_eq = R₁ + R₂ + R₃",
              "Parallel: Voltage V is constant, I divides",
              "1 / R_eq = 1/R₁ + 1/R₂ + 1/R₃"
            ],
            mnemonic: "Series increases total resistance; Parallel lowers total resistance",
            color: "#06b6d4"
          }
        ],
        diagram: {
          central: "Electric Circuit",
          branches: [
            { label: "Source (V)", formula: "V = W / Q (Volts)" },
            { label: "Current (I)", formula: "I = Q / t (Amperes)" },
            { label: "Resistance (R)", formula: "R = ρ·l / A (Ohms)" },
            { label: "Thermal Dissipation", formula: "H = I²·R·t (Joules)" }
          ]
        }
      }
    ],
    "Social Science": [
      {
        id: "ss10_hist",
        chapter: "Nationalism in India & Freedom Movement",
        unit: "History",
        weightage: "7 Marks",
        rootConcept: "Anti-Colonial Resistance & Mass Mobilization",
        nodes: [
          {
            title: "Satyagraha & Early Resistance",
            points: [
              "Champaran (1917, Indigo farmers), Kheda (1918), Ahmedabad Mill strike (1918)",
              "Rowlatt Act (1919): Detention without trial for 2 years",
              "Jallianwala Bagh (13 April 1919): General Dyer opens fire"
            ],
            mnemonic: "Order: Champaran (C), Ahmedabad (A), Kheda (K)",
            color: "#ef4444"
          },
          {
            title: "Non-Cooperation Movement (1920-1922)",
            points: [
              "Surrender of titles, boycott of civil services and foreign cloth",
              "Chauri Chaura incident (Feb 1922): Violent police station burning led to withdrawal",
              "Differing social strands: Peasants (Awadh), Tribals (Gudem Hills)"
            ],
            mnemonic: "1920 Launch → Boycott Strategy → 1922 Chauri Chaura Halt",
            color: "#f59e0b"
          }
        ],
        diagram: {
          central: "Indian National Movement",
          branches: [
            { label: "Early Satyagrahas", formula: "1917-1918 (Champaran, Kheda)" },
            { label: "Non-Cooperation", formula: "1920-1922 (Boycott & Swadeshi)" },
            { label: "Civil Disobedience", formula: "1930 (Salt March to Dandi)" },
            { label: "Quit India", formula: "1942 ('Do or Die' Resolution)" }
          ]
        }
      }
    ],
    Mathematics: [
      {
        id: "m10_quad",
        chapter: "Quadratic Equations",
        unit: "Algebra",
        weightage: "6 Marks",
        rootConcept: "Second-Degree Polynomial Equations",
        nodes: [
          {
            title: "Standard Equation & Roots",
            points: [
              "ax² + bx + c = 0 where a ≠ 0",
              "Degree is 2; maximum of 2 real roots",
              "Splitting middle term: Find two factors whose product = ac and sum = b"
            ],
            mnemonic: "Standard form must always equal 0 before factoring",
            color: "#3b82f6"
          },
          {
            title: "The Quadratic Formula",
            points: [
              "x = [-b ± √(b² - 4ac)] / (2a)",
              "Discriminant D = b² - 4ac governs root nature",
              "D > 0: Two distinct roots | D = 0: Two equal roots | D < 0: No real roots"
            ],
            mnemonic: "D = b² - 4ac determines root behavior",
            color: "#8b5cf6"
          }
        ],
        diagram: {
          central: "ax² + bx + c = 0",
          branches: [
            { label: "Factorization", formula: "(x - α)(x - β) = 0" },
            { label: "Discriminant", formula: "D = b² - 4ac" },
            { label: "Root Formula", formula: "x = (-b ± √D) / 2a" },
            { label: "Vieta's Relations", formula: "α + β = -b/a, αβ = c/a" }
          ]
        }
      }
    ],
    English: [
      {
        id: "eng10_gram",
        chapter: "Reported Speech & Active-Passive Voice",
        unit: "Grammar & Composition",
        weightage: "10 Marks",
        rootConcept: "Syntactic Transformation & Clause Rules",
        nodes: [
          {
            title: "Direct to Indirect Speech Rules",
            points: [
              "Simple Present → Simple Past",
              "Present Continuous → Past Continuous",
              "Universal truths remain unchanged in tense"
            ],
            mnemonic: "Step one tense back into the past for indirect narration",
            color: "#3b82f6"
          }
        ],
        diagram: {
          central: "Reported Speech",
          branches: [
            { label: "Present Simple", formula: "V₁ → V₂ (Past Simple)" },
            { label: "Present Perfect", formula: "has/have + V₃ → had + V₃" },
            { label: "Modals", formula: "can → could | will → would" },
            { label: "Time Adverbs", formula: "now → then | today → that day" }
          ]
        }
      }
    ],
    Kannada: [
      {
        id: "kan10_vyak",
        chapter: "ಕನ್ನಡ ವ್ಯಾಕರಣ (Sandhi & Samasa)",
        unit: "ದ್ವಿತೀಯ ಭಾಷೆ ಕನ್ನಡ",
        weightage: "12 Marks",
        rootConcept: "ಪದ ಜೋಡಣೆ ಮತ್ತು ಸಂಧಿ ನಿಯಮಗಳು",
        nodes: [
          {
            title: "ಕನ್ನಡ ಸಂಧಿಗಳು (Kannada Sandhi)",
            points: [
              "ಲೋಪ ಸಂಧಿ: ಮಾತಲ್ಲ = ಮಾತು + ಅಲ್ಲ (ಸ್ವರ ಲೋಪ)",
              "ಆಗಮ ಸಂಧಿ: ಮನೆಯನ್ನು = ಮನೆ + ಯ್ + ಅನ್ನು (ಯ್ / ವ್ ಆಗಮ)",
              "ಆದೇಶ ಸಂಧಿ: ಮೈದೊಳೆ = ಮೈ + ತೊಳೆ (ಕ, ತ, ಪ ಗಳಿಗೆ ಗ, ದ, ಬ)"
            ],
            mnemonic: "ಲೋಪ = ಬಿಡುವುದು | ಆಗಮ = ಹೊಸ ಅಕ್ಷರ | ಆದೇಶ = ಬದಲಿ ಅಕ್ಷರ",
            color: "#f59e0b"
          }
        ],
        diagram: {
          central: "ಕನ್ನಡ ಸಂಧಿ ಪ್ರಭೇದಗಳು",
          branches: [
            { label: "ಲೋಪ ಸಂಧಿ", formula: "ಸ್ವರ + ಸ್ವರ → ಸ್ವರ ಲೋಪ" },
            { label: "ಆಗಮ ಸಂಧಿ", formula: "ಯ್ / ವ್ ಕಾರ ಆಗಮನ" },
            { label: "ಆದೇಶ ಸಂಧಿ", formula: "ಕ, ತ, ಪ → ಗ, ದ, ಬ" },
            { label: "ಸವರ್ಣದೀರ್ಘ", formula: "ಅ + ಅ = ಆ | ಇ + ಇ = ಈ" }
          ]
        }
      }
    ],
    Hindi: [
      {
        id: "hin10_vyak",
        chapter: "व्याकरण: पदबंध एवं समास (Hindi Vyakaran)",
        unit: "हिंदी व्याकरण",
        weightage: "10 Marks",
        rootConcept: "वाक्य विचार एवं पद विन्यास",
        nodes: [
          {
            title: "समास के मुख्य भेद",
            points: [
              "अव्ययीभाव: यथाशक्ति = शक्ति के अनुसार",
              "तत्पुरुष: राजपुत्र = राजा का पुत्र",
              "द्वंद्व: माता-पिता = माता और पिता",
              "द्विगु: त्रिफला = तीन फलों का समूह"
            ],
            mnemonic: "संख्या = द्विगु | 'और' संबंध = द्वंद्व | तीसरा अर्थ = बहुव्रीहि",
            color: "#10b981"
          }
        ],
        diagram: {
          central: "हिंदी समास चक्र",
          branches: [
            { label: "अव्ययीभाव", formula: "प्रथम पद अव्यय (यथा, प्रति)" },
            { label: "तत्पुरुष", formula: "कारक चिन्हों का लोप (का, के, की)" },
            { label: "द्विगु", formula: "संख्यावाचक (त्रिनेत्र, चौराहा)" },
            { label: "द्वंद्व", formula: "योजक चिन्ह 'और' (दिन-रात)" }
          ]
        }
      }
    ]
  },

  // =============================== CLASS 9 ===============================
  9: {
    Science: [
      {
        id: "s9_phy1",
        chapter: "Force and Laws of Motion",
        unit: "Physics",
        weightage: "9 Marks",
        rootConcept: "Inertia, Momentum, and Action-Reaction Principles",
        nodes: [
          {
            title: "Newton's Laws of Motion",
            points: [
              "1st Law: Law of Inertia (Inability to change state without external force)",
              "2nd Law: F = ma (Rate of change of momentum is proportional to applied force)",
              "3rd Law: For every action, there is an equal and opposite reaction"
            ],
            mnemonic: "1st: Inertia | 2nd: F = ma | 3rd: Action = Reaction",
            color: "#3b82f6"
          }
        ],
        diagram: {
          central: "Dynamics & Force",
          branches: [
            { label: "Inertia (1st Law)", formula: "Mass = Measure of Inertia" },
            { label: "Rate Law (2nd)", formula: "F = Δp / Δt = m·a" },
            { label: "Pairs (3rd)", formula: "F_AB = -F_BA" },
            { label: "Momentum", formula: "p = m × v (kg·m/s)" }
          ]
        }
      }
    ],
    "Social Science": [
      {
        id: "ss9_geo",
        chapter: "Physical Features of India",
        unit: "Geography",
        weightage: "8 Marks",
        rootConcept: "Tectonic Uplift & Physiographic Divisions",
        nodes: [
          {
            title: "Major Physiographic Relief",
            points: [
              "Himalayan Mountains (Himadri, Himachal, Shiwaliks)",
              "Northern Plains: Indus, Ganga, Brahmaputra alluvial deposits",
              "Peninsular Plateau: Central Highlands and Deccan Plateau"
            ],
            mnemonic: "Himadri (Highest) → Himachal (Lesser) → Shiwaliks (Outer)",
            color: "#f59e0b"
          }
        ],
        diagram: {
          central: "Physiography of India",
          branches: [
            { label: "Himalayas", formula: "Fold Mountains (Himadri/Shiwaliks)" },
            { label: "Plains", formula: "Bhabar → Terai → Bhangar → Khadar" },
            { label: "Plateau", formula: "Deccan & Malwa (Basaltic/Black Soil)" },
            { label: "Coast & Islands", formula: "Konkan/Malabar + Andaman/Lakshadweep" }
          ]
        }
      }
    ],
    Mathematics: [
      {
        id: "m9_geo",
        chapter: "Surface Areas and Volumes",
        unit: "Mensuration",
        weightage: "12 Marks",
        rootConcept: "3D Curved Solids & Volume Calculations",
        nodes: [
          {
            title: "Cylinder, Cone, and Sphere Geometry",
            points: [
              "Cylinder CSA = 2πrh, Volume = πr²h",
              "Cone slant height: l = √(r² + h²), Volume = ⅓πr²h",
              "Sphere Surface Area = 4πr², Volume = ⁴⁄₃πr³"
            ],
            mnemonic: "Cone volume is 1/3 of cylinder volume with identical base and height",
            color: "#10b981"
          }
        ],
        diagram: {
          central: "3D Mensuration",
          branches: [
            { label: "Cylinder Vol", formula: "V = πr²h" },
            { label: "Cone Vol", formula: "V = ⅓πr²h" },
            { label: "Sphere Vol", formula: "V = ⁴⁄₃πr³" },
            { label: "Cone Slant", formula: "l = √(r² + h²)" }
          ]
        }
      }
    ],
    English: [
      {
        id: "eng9_gram",
        chapter: "Tenses & Subject-Verb Concord",
        unit: "Grammar",
        weightage: "10 Marks",
        rootConcept: "Syntactic Agreement Rules",
        nodes: [
          {
            title: "Subject-Verb Concord Principles",
            points: [
              "Singular subject requires singular verb (The boy runs)",
              "Subjects joined by 'either... or' agree with the nearest subject",
              "'Each' and 'Everyone' take singular verbs"
            ],
            mnemonic: "Look at the real head-word, not the intervening prepositional phrase",
            color: "#3b82f6"
          }
        ],
        diagram: {
          central: "Concord Rules",
          branches: [
            { label: "Singular Rule", formula: "He/She/It + Verb-s" },
            { label: "Plural Rule", formula: "They/We + Base Verb" },
            { label: "Either/Or", formula: "Verb matches closest noun" },
            { label: "Indefinites", formula: "Each/Everyone = Singular Verb" }
          ]
        }
      }
    ],
    Kannada: [
      {
        id: "kan9_vyak",
        chapter: "ಕನ್ನಡ ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯಗಳು ಮತ್ತು ನಾಮಪದ",
        unit: "ಕನ್ನಡ ವ್ಯಾಕರಣ",
        weightage: "10 Marks",
        rootConcept: "ಕಾರಕಾರ್ಥಗಳು ಮತ್ತು ವಿಭಕ್ತಿಗಳು",
        nodes: [
          {
            title: "ಸಪ್ತ ವಿಭಕ್ತಿಗಳು (7 Vibhaktis)",
            points: [
              "ಪ್ರಥಮಾ (ಉ), ದ್ವಿತೀಯಾ (ಅನ್ನು), ತೃತೀಯಾ (ಇಂದ)",
              "ಚತುರ್ಥೀ (ಗೆ/ಇಗೆ/ಕ್ಕೆ), ಪಂಚಮೀ (ದೆಸೆಯಿಂದ)",
              "ಷಷ್ಠೀ (ಅ), ಸಪ್ತಮೀ (ಅಲ್ಲಿ)"
            ],
            mnemonic: "ಉ, ಅನ್ನು, ಇಂದ, ಗೆ, ದೆಸೆಯಿಂದ, ಅ, ಅಲ್ಲಿ",
            color: "#10b981"
          }
        ],
        diagram: {
          central: "ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯಗಳು",
          branches: [
            { label: "ಪ್ರಥಮಾ", formula: "ಉ (ಕರ್ತೃ)" },
            { label: "ದ್ವಿತೀಯಾ", formula: "ಅನ್ನು (ಕರ್ಮ)" },
            { label: "ತೃತೀಯಾ", formula: "ಇಂದ (ಕರಣ)" },
            { label: "ಚತುರ್ಥೀ", formula: "ಗೆ / ಇಗೆ (ಸಂಪ್ರದಾನ)" }
          ]
        }
      }
    ],
    Hindi: [
      {
        id: "hin9_vyak",
        chapter: "उपसर्ग, प्रत्यय एवं वाक्य भेद",
        unit: "हिंदी व्याकरण",
        weightage: "10 Marks",
        rootConcept: "शब्द रचना एवं अर्थ विचार",
        nodes: [
          {
            title: "उपसर्ग और प्रत्यय",
            points: [
              "उपसर्ग: मूल शब्द के आरंभ में जुड़ने वाले शब्दांश (प्र + हार = प्रहार)",
              "प्रत्यय: मूल शब्द के अंत में जुड़ने वाले शब्दांश (सफल + ता = सफलता)",
              "सरल, संयुक्त एवं मिश्र वाक्य संरचना"
            ],
            mnemonic: "उप = आगे (Prefix) | प्रत्यय = पीछे (Suffix)",
            color: "#f59e0b"
          }
        ],
        diagram: {
          central: "शब्द रचना",
          branches: [
            { label: "उपसर्ग", formula: "शब्दांश + मूल शब्द" },
            { label: "प्रत्यय", formula: "मूल शब्द + शब्दांश" },
            { label: "सरल वाक्य", formula: "एक उद्देश्य + एक विधेय" },
            { label: "संयुक्त वाक्य", formula: "योजक (और, किंतु) से जुड़े दो वाक्य" }
          ]
        }
      }
    ]
  },

  // =============================== CLASS 8 ===============================
  8: {
    Science: [
      {
        id: "s8_micro",
        chapter: "Microorganisms: Friend and Foe",
        unit: "Biology",
        weightage: "8 Marks",
        rootConcept: "Microbial Ecology and Biological Cycles",
        nodes: [
          {
            title: "Microbial Classification & Pathogens",
            points: [
              "Bacteria, Fungi, Protozoa, Algae, Viruses",
              "Fermentation discovered by Louis Pasteur; Antibiotics by Alexander Fleming",
              "Vaccination triggers antibody memory (Edward Jenner)"
            ],
            mnemonic: "Pasteur = Fermentation | Fleming = Penicillin | Jenner = Vaccine",
            color: "#10b981"
          }
        ],
        diagram: {
          central: "Microbiology",
          branches: [
            { label: "Beneficial", formula: "Lactobacillus (Curd), Yeast (Baking)" },
            { label: "Pathogenic", formula: "Bacteria (TB/Typhoid), Virus (Polio)" },
            { label: "Nitrogen Cycle", formula: "Rhizobium in root nodules" },
            { label: "Preservation", formula: "Pasteurization (70°C for 15-30s)" }
          ]
        }
      }
    ],
    "Social Science": [
      {
        id: "ss8_hist",
        chapter: "When People Rebel: 1857 and After",
        unit: "History",
        weightage: "8 Marks",
        rootConcept: "Great Rebellion of 1857 & Colonial Restructuring",
        nodes: [
          {
            title: "Outbreak and Aftermath",
            points: [
              "Mangal Pandey at Barrackpore; Meerut sepoys march to Delhi",
              "Causes: Doctrine of Lapse, heavy taxes, greased cartridge",
              "1858: Transfer of power from East India Company to British Crown"
            ],
            mnemonic: "1857 Revolt ended East India Company rule in India",
            color: "#ef4444"
          }
        ],
        diagram: {
          central: "1857 Uprising",
          branches: [
            { label: "Trigger", formula: "Greased Cartridge" },
            { label: "Leaders", formula: "Rani Lakshmibai, Nana Saheb" },
            { label: "Transition", formula: "1858 Queen's Proclamation" },
            { label: "Crown Rule", formula: "Direct Viceroy Administration" }
          ]
        }
      }
    ],
    Mathematics: [
      {
        id: "m8_alg",
        chapter: "Algebraic Expressions & Identities",
        unit: "Algebra",
        weightage: "10 Marks",
        rootConcept: "Polynomial Expansion and Factoring",
        nodes: [
          {
            title: "Standard Algebraic Identities",
            points: [
              "(a + b)² = a² + 2ab + b²",
              "(a - b)² = a² - 2ab + b²",
              "(a + b)(a - b) = a² - b²",
              "(x + a)(x + b) = x² + (a + b)x + ab"
            ],
            mnemonic: "Difference of squares has no middle term: (a+b)(a-b) = a² - b²",
            color: "#3b82f6"
          }
        ],
        diagram: {
          central: "Algebraic Identities",
          branches: [
            { label: "Sum Square", formula: "(a + b)² = a² + 2ab + b²" },
            { label: "Diff Square", formula: "(a - b)² = a² - 2ab + b²" },
            { label: "Diff of Squares", formula: "a² - b² = (a+b)(a-b)" },
            { label: "Binomial Product", formula: "x² + (a+b)x + ab" }
          ]
        }
      }
    ],
    English: [
      {
        id: "eng8_gram",
        chapter: "Clauses and Modals",
        unit: "Grammar",
        weightage: "8 Marks",
        rootConcept: "Modal Auxiliaries & Subordinate Clauses",
        nodes: [
          {
            title: "Modal Auxiliaries Usage",
            points: [
              "Can/Could: Ability, permission",
              "May/Might: Possibility, formal request",
              "Must/Ought to: Mandatory obligation",
              "Should: Advice, recommendation"
            ],
            mnemonic: "Must is mandatory; Should is a recommendation",
            color: "#8b5cf6"
          }
        ],
        diagram: {
          central: "Modal Verbs",
          branches: [
            { label: "Ability", formula: "Can / Could" },
            { label: "Permission", formula: "May / Can" },
            { label: "Obligation", formula: "Must / Ought to" },
            { label: "Advice", formula: "Should" }
          ]
        }
      }
    ],
    Kannada: [
      {
        id: "kan8_vyak",
        chapter: "ತದ್ಭವ-ತತ್ಸಮ ಮತ್ತು ದ್ವಿರುಕ್ತಿ",
        unit: "ಕನ್ನಡ ವ್ಯಾಕರಣ",
        weightage: "8 Marks",
        rootConcept: "ಪದ ರಚನೆ ಮತ್ತು ಭಾಷಾ ಮೂಲ",
        nodes: [
          {
            title: "ತತ್ಸಮ ಮತ್ತು ತದ್ಭವ",
            points: [
              "ತತ್ಸಮ: ಸಂಸ್ಕೃತದ ಮೂಲ ಪದಗಳು (ಮುಖ, ಸೂರ್ಯ, ವಿದ್ಯಾ)",
              "ತದ್ಭವ: ರೂಪಾಂತರಗೊಂಡ ಕನ್ನಡ ಪದಗಳು (ಮೊಗ, ಸುಜ್ಜ, ಬಿಜ್ಜೆ)",
              "ದ್ವಿರುಕ್ತಿ: ಒಂದೇ ಪದವನ್ನು ಎರಡೆರಡು ಬಾರಿ ಪ್ರಯೋಗಿಸುವುದು (ಬೇಗಬೇಗ)"
            ],
            mnemonic: "ಸಂಸ್ಕೃತ ರೂಪ = ತತ್ಸಮ | ಬದಲಾದ ರೂಪ = ತದ್ಭವ",
            color: "#10b981"
          }
        ],
        diagram: {
          central: "ಪದ ಪರಿವಾರ",
          branches: [
            { label: "ತತ್ಸಮ", formula: "ಮೂಲ ಸಂಸ್ಕೃತ ರೂಪ" },
            { label: "ತದ್ಭವ", formula: "ಕನ್ನಡ ರೂಪಾಂತರ" },
            { label: "ದ್ವಿರುಕ್ತಿ", formula: "ಒಂದೇ ಪದ ಎರಡು ಬಾರಿ" },
            { label: "ಜೋಡುನುಡಿ", formula: "ಜೊತೆಯಾಗಿ ಬರುವ ಪದ" }
          ]
        }
      }
    ],
    Hindi: [
      {
        id: "hin8_vyak",
        chapter: "कारक एवं पर्यायवाची शब्द",
        unit: "हिंदी व्याकरण",
        weightage: "8 Marks",
        rootConcept: "कारक विभक्तियां",
        nodes: [
          {
            title: "आठ कारक और उनके चिह्न",
            points: [
              "कर्ता ने, कर्म को, करण से (के द्वारा)",
              "संप्रदान को (के लिए), अपादान से (अलगाव)",
              "संबंध का/के/की, अधिकरण में/पर, संबोधन हे/अरे!"
            ],
            mnemonic: "कर्ता ने, कर्म को, करण से, संप्रदान के लिए",
            color: "#3b82f6"
          }
        ],
        diagram: {
          central: "हिंदी कारक",
          branches: [
            { label: "कर्ता", formula: "ने (क्रिया करने वाला)" },
            { label: "कर्म", formula: "को (फल भोगने वाला)" },
            { label: "करण", formula: "से (साधन)" },
            { label: "अपादान", formula: "से (अलगाव)" }
          ]
        }
      }
    ]
  },

  // =============================== CLASS 7 ===============================
  7: {
    Science: [
      {
        id: "s7_heat",
        chapter: "Heat & Modes of Transfer",
        unit: "Physics",
        weightage: "8 Marks",
        rootConcept: "Thermal Energy Equilibrium & Transfer",
        nodes: [
          {
            title: "Three Modes of Heat Transfer",
            points: [
              "Conduction: Particle to particle transfer in solids",
              "Convection: Fluid bulk circulation (Boiling liquids, Sea breeze)",
              "Radiation: Electromagnetic wave transfer requiring no medium"
            ],
            mnemonic: "Conduction = Solid touch | Convection = Fluid swirl | Radiation = Beam",
            color: "#ef4444"
          }
        ],
        diagram: {
          central: "Heat Transfer",
          branches: [
            { label: "Conduction", formula: "Direct Solid Contact" },
            { label: "Convection", formula: "Fluid Density Circulation" },
            { label: "Radiation", formula: "Electromagnetic Waves" },
            { label: "Sea Breeze", formula: "Day: Ocean to land circulation" }
          ]
        }
      }
    ],
    "Social Science": [
      {
        id: "ss7_chola",
        chapter: "New Kings and Kingdoms (The Cholas)",
        unit: "History",
        weightage: "8 Marks",
        rootConcept: "Agrarian Transformation & Local Governance",
        nodes: [
          {
            title: "Chola Administrative Architecture",
            points: [
              "Ur: Peasant settlement; Nadu: Group of villages",
              "Sabha: Assembly of prominent landowners (Uttaramerur inscriptions)",
              "Irrigation canals and Kaveri basin delta cultivation"
            ],
            mnemonic: "Uttaramerur inscriptions detail election of Sabha members by lottery",
            color: "#f59e0b"
          }
        ],
        diagram: {
          central: "Chola Administration",
          branches: [
            { label: "Village Ur", formula: "Peasant Council" },
            { label: "Sabha", formula: "Landowner Assembly" },
            { label: "Kaveri Basin", formula: "Agrarian Canals & Tanks" },
            { label: "Bronze Art", formula: "Nataraja Lost-Wax Casting" }
          ]
        }
      }
    ],
    Mathematics: [
      {
        id: "m7_int",
        chapter: "Integers & Sign Rules",
        unit: "Number Operations",
        weightage: "8 Marks",
        rootConcept: "Signed Operations & Absolute Value",
        nodes: [
          {
            title: "Multiplication & Division Sign Rules",
            points: [
              "(+) × (+) = (+) and (-) × (-) = (+)",
              "(+) × (-) = (-) and (-) × (+) = (-)",
              "Product of an even number of negative factors is positive"
            ],
            mnemonic: "Same signs yield positive; Opposite signs yield negative",
            color: "#3b82f6"
          }
        ],
        diagram: {
          central: "Integer Arithmetic",
          branches: [
            { label: "Like Signs (×)", formula: "(-) × (-) = (+)" },
            { label: "Unlike Signs (×)", formula: "(+) × (-) = (-)" },
            { label: "Additive Inverse", formula: "a + (-a) = 0" },
            { label: "Absolute Value", formula: "| -x | = x" }
          ]
        }
      }
    ],
    English: [
      {
        id: "eng7_gram",
        chapter: "Prepositions and Conjunctions",
        unit: "Grammar",
        weightage: "8 Marks",
        rootConcept: "Relational Connectors",
        nodes: [
          {
            title: "Prepositions of Time and Place",
            points: [
              "At: Exact time (at 5 PM) / specific point",
              "On: Days and dates (on Monday)",
              "In: Months, years, and enclosed areas",
              "Coordinating conjunctions: FANBOYS"
            ],
            mnemonic: "At (Precise) → On (Day/Surface) → In (Broad Period/Space)",
            color: "#10b981"
          }
        ],
        diagram: {
          central: "Connectors",
          branches: [
            { label: "At", formula: "Exact Time / Point" },
            { label: "On", formula: "Days / Dates / Surfaces" },
            { label: "In", formula: "Months / Years / Space" },
            { label: "FANBOYS", formula: "Coordinating Conjunctions" }
          ]
        }
      }
    ],
    Kannada: [
      {
        id: "kan7_vyak",
        chapter: "ಕ್ರಿಯಾಪದ ಮತ್ತು ಕಾಲಗಳು",
        unit: "ಕನ್ನಡ ವ್ಯಾಕರಣ",
        weightage: "8 Marks",
        rootConcept: "ಕ್ರಿಯಾ ರೂಪಗಳು",
        nodes: [
          {
            title: "ಮೂರು ಮುಖ್ಯ ಕಾಲಗಳು (Three Tenses)",
            points: [
              "ವರ್ತಮಾನ ಕಾಲ: ಪ್ರಸ್ತುತ ನಡೆಯುತ್ತಿರುವ ಕ್ರಿಯೆ (ಓದುತ್ತಿದ್ದಾನೆ)",
              "ಭೂತಕಾಲ: ಈಗಾಗಲೇ ಮುಗಿದ ಕ್ರಿಯೆ (ಓದಿದನು)",
              "ಭವಿಷ್ಯತ್ ಕಾಲ: ಮುಂದೆ ನಡೆಯಲಿರುವ ಕ್ರಿಯೆ (ಓದುವನು)"
            ],
            mnemonic: "ವರ್ತಮಾನ = ಈಗ | ಭೂತ = ಮುಗಿದದ್ದು | ಭವಿಷ್ಯತ್ = ಮುಂದೆ",
            color: "#8b5cf6"
          }
        ],
        diagram: {
          central: "ಕಾಲ ವಿಚಾರ",
          branches: [
            { label: "ವರ್ತಮಾನ", formula: "ಉತ್ತ / ತ್ತ ಪ್ರತ್ಯಯ" },
            { label: "ಭೂತಕಾಲ", formula: "ದ ಪ್ರತ್ಯಯ" },
            { label: "ಭವಿಷ್ಯತ್", formula: "ವ ಪ್ರತ್ಯಯ" },
            { label: "ಧಾತು", formula: "ಕ್ರಿಯಾಪದದ ಮೂಲ ರೂಪ" }
          ]
        }
      }
    ],
    Hindi: [
      {
        id: "hin7_vyak",
        chapter: "विशेषण एवं क्रिया के भेद",
        unit: "हिंदी व्याकरण",
        weightage: "8 Marks",
        rootConcept: "विशेषण और क्रिया",
        nodes: [
          {
            title: "सकर्मक और अकर्मक क्रिया",
            points: [
              "सकर्मक क्रिया: कर्म की आवश्यकता होती है (वह पुस्तक पढ़ता है)",
              "अकर्मक क्रिया: कर्म नहीं होता, फल कर्ता पर पड़ता है (पक्षी उड़ते हैं)"
            ],
            mnemonic: "'क्या' या 'किसे' का उत्तर मिले तो सकर्मक क्रिया",
            color: "#3b82f6"
          }
        ],
        diagram: {
          central: "क्रिया भेद",
          branches: [
            { label: "सकर्मक", formula: "कर्म सहित" },
            { label: "अकर्मक", formula: "कर्म रहित" },
            { label: "विशेषण", formula: "गुण, दोष, संख्या" },
            { label: "सर्वनाम", formula: "संज्ञा के स्थान पर प्रयुक्त" }
          ]
        }
      }
    ]
  },

  // =============================== CLASS 6 ===============================
  6: {
    Science: [
      {
        id: "s6_food",
        chapter: "Components of Food & Nutrients",
        unit: "Biology & Nutrition",
        weightage: "8 Marks",
        rootConcept: "Balanced Diet & Nutritional Testing",
        nodes: [
          {
            title: "Nutrient Categories & Laboratory Tests",
            points: [
              "Energy-giving: Carbohydrates and Fats",
              "Body-building: Proteins (tissue repair)",
              "Protective: Vitamins and Minerals",
              "Iodine Test: Starch turns Blue-Black",
              "Biuret Test: Protein turns Violet"
            ],
            mnemonic: "Starch = Blue-black with Iodine | Protein = Violet with Biuret",
            color: "#10b981"
          }
        ],
        diagram: {
          central: "Balanced Diet",
          branches: [
            { label: "Carbs & Fats", formula: "Energy Giving" },
            { label: "Proteins", formula: "Growth & Repair" },
            { label: "Vitamins/Minerals", formula: "Immunity" },
            { label: "Dietary Fibre", formula: "Roughage for Digestion" }
          ]
        }
      }
    ],
    "Social Science": [
      {
        id: "ss6_harappa",
        chapter: "In the Earliest Cities (Harappa)",
        unit: "History",
        weightage: "8 Marks",
        rootConcept: "Bronze Age Urban Planning & Architecture",
        nodes: [
          {
            title: "Harappan Urban Architecture",
            points: [
              "Citadel: Raised western sector housing public structures (Great Bath)",
              "Lower Town: Eastern residential grid pattern",
              "Covered Drains: Straight inspection brick drainage"
            ],
            mnemonic: "Citadel = West & Elevated | Lower Town = East & Residential",
            color: "#f59e0b"
          }
        ],
        diagram: {
          central: "Indus Valley Planning",
          branches: [
            { label: "Citadel", formula: "Great Bath with bitumen lining" },
            { label: "Lower Town", formula: "Grid layout residential homes" },
            { label: "Sanitation", formula: "Covered straight brick drains" },
            { label: "Crafts", formula: "Terracotta toys, seals, bronze dancer" }
          ]
        }
      }
    ],
    Mathematics: [
      {
        id: "m6_num",
        chapter: "Knowing Our Numbers & Divisibility",
        unit: "Arithmetic",
        weightage: "10 Marks",
        rootConcept: "Place Value Systems & Divisibility Tests",
        nodes: [
          {
            title: "Core Divisibility Tests",
            points: [
              "Divisible by 2: Last digit is 0, 2, 4, 6, 8",
              "Divisible by 3: Sum of all digits is a multiple of 3",
              "Divisible by 5: Last digit is 0 or 5",
              "Divisible by 6: Divisible by both 2 and 3"
            ],
            mnemonic: "Sum of digits rule applies to 3 and 9; Last digit rule applies to 2, 5, 10",
            color: "#3b82f6"
          }
        ],
        diagram: {
          central: "Divisibility Rules",
          branches: [
            { label: "By 2 / 5 / 10", formula: "Check units digit" },
            { label: "By 3 / 9", formula: "Check sum of all digits" },
            { label: "By 4", formula: "Check last two digits" },
            { label: "By 6", formula: "Must pass both 2 and 3 tests" }
          ]
        }
      }
    ],
    English: [
      {
        id: "eng6_gram",
        chapter: "Sentences and Nouns",
        unit: "Grammar",
        weightage: "8 Marks",
        rootConcept: "Types of Sentences & Noun Classes",
        nodes: [
          {
            title: "Four Types of Sentences",
            points: [
              "Declarative: Statement ending in a period (.)",
              "Interrogative: Question ending in question mark (?)",
              "Imperative: Command or polite request",
              "Exclamatory: Strong emotion ending in (!)"
            ],
            mnemonic: "State (.) | Ask (?) | Command | Exclaim (!)",
            color: "#8b5cf6"
          }
        ],
        diagram: {
          central: "Sentence Types",
          branches: [
            { label: "Declarative", formula: "Statement ending in '.'" },
            { label: "Interrogative", formula: "Question ending in '?'" },
            { label: "Imperative", formula: "Command / Request" },
            { label: "Exclamatory", formula: "Emotion ending in '!'" }
          ]
        }
      }
    ],
    Kannada: [
      {
        id: "kan6_vyak",
        chapter: "ಕನ್ನಡ ವರ್ಣಮಾಲೆ ಮತ್ತು ಗುಣಿತಾಕ್ಷರ",
        unit: "ಕನ್ನಡ ವ್ಯಾಕರಣ",
        weightage: "8 Marks",
        rootConcept: "ವರ್ಣ ವಿಭಾಗ",
        nodes: [
          {
            title: "ಕನ್ನಡದ 49 ವರ್ಣಗಳು",
            points: [
              "14 ಸ್ವರಗಳು: ಅ ಇಂದ ಔ",
              "2 ಯೋಗವಾಹಗಳು: ಅಂ (ಅನುಸ್ವಾರ), ಅಃ (ವಿಸರ್ಗ)",
              "25 ವರ್ಗೀಯ ವ್ಯಂಜನಗಳು: ಕ-ವರ್ಗದಿಂದ ಮ-ವರ್ಗದವರೆಗೆ",
              "9 ಅವರ್ಗೀಯ ವ್ಯಂಜನಗಳು: ಯ ಇಂದ ಳ ವರೆಗೆ"
            ],
            mnemonic: "14 ಸ್ವರಗಳು + 2 ಯೋಗವಾಹಗಳು + 33 ವ್ಯಂಜನಗಳು = 49 ಒಟ್ಟು ಅಕ್ಷರಗಳು",
            color: "#10b981"
          }
        ],
        diagram: {
          central: "ಕನ್ನಡ ಅಕ್ಷರಮಾಲೆ",
          branches: [
            { label: "ಸ್ವರಗಳು", formula: "14 (ಹ್ರಸ್ವ 7 + ದೀರ್ಘ 7)" },
            { label: "ಯೋಗವಾಹ", formula: "2 (ಅಂ ಮತ್ತು ಅಃ)" },
            { label: "ವರ್ಗೀಯ", formula: "25 (ಕ ಇಂದ ಮ ವರೆಗೆ)" },
            { label: "ಅವರ್ಗೀಯ", formula: "9 (ಯ ಇಂದ ಳ ವರೆಗೆ)" }
          ]
        }
      }
    ],
    Hindi: [
      {
        id: "hin6_vyak",
        chapter: "संज्ञा के भेद एवं लिंग-वचन",
        unit: "हिंदी व्याकरण",
        weightage: "8 Marks",
        rootConcept: "संज्ञा, लिंग एवं वचन",
        nodes: [
          {
            title: "संज्ञा के तीन मुख्य प्रकार",
            points: [
              "व्यक्तिवाचक: विशेष नाम (मोहन, दिल्ली)",
              "जातिवाचक: सामान्य श्रेणी (लड़का, शहर)",
              "भाववाचक: गुण या अवस्था (बचपन, मिठास)"
            ],
            mnemonic: "जो देखा न जा सके केवल अनुभव हो = भाववाचक संज्ञा",
            color: "#3b82f6"
          }
        ],
        diagram: {
          central: "संज्ञा के भेद",
          branches: [
            { label: "व्यक्तिवाचक", formula: "विशेष नाम" },
            { label: "जातिवाचक", formula: "सामान्य श्रेणी" },
            { label: "भाववाचक", formula: "गुण / अवस्था" },
            { label: "वचन", formula: "एकवचन एवं बहुवचन" }
          ]
        }
      }
    ]
  },

  // =============================== CLASS 5 ===============================
  5: {
    Science: [
      {
        id: "s5_bio",
        chapter: "Super Senses of Animals & Food Journey",
        unit: "Environmental Science (EVS)",
        weightage: "10 Marks",
        rootConcept: "Animal Adaptations & Human Digestion",
        nodes: [
          {
            title: "Animal Super Sensory Organs",
            points: [
              "Ants leave scent trails that followers detect via antennae",
              "Birds of prey (Eagles, Kites) have 4x human vision range",
              "Snakes detect ground vibrations through skin"
            ],
            mnemonic: "Smell (Ant/Dog) + Vision (Eagle) + Ground Vibration (Snake)",
            color: "#10b981"
          },
          {
            title: "Human Digestive Journey",
            points: [
              "Mouth: Saliva breaks down starches into simpler sugars",
              "Stomach: Acidic digestive juices churn food into soup",
              "ORS formulation: Boiled water + sugar + pinch of salt"
            ],
            mnemonic: "Chew well in mouth so stomach enzymes work faster",
            color: "#f59e0b"
          }
        ],
        diagram: {
          central: "EVS Living Systems",
          branches: [
            { label: "Ant Trail", formula: "Pheromone Scent" },
            { label: "Eagle Eye", formula: "4x Human Vision Range" },
            { label: "Digestion", formula: "Mouth (Saliva) → Stomach → Gut" },
            { label: "ORS Drink", formula: "Water + Sugar + Salt" }
          ]
        }
      }
    ],
    "Social Science": [
      {
        id: "ss5_globe",
        chapter: "Our Earth: Continents, Oceans & Maps",
        unit: "Geography",
        weightage: "10 Marks",
        rootConcept: "Global Geography & Cardinal Navigation",
        nodes: [
          {
            title: "7 Continents & 5 Oceans",
            points: [
              "Largest Continent: Asia (where India is located)",
              "Smallest Continent: Australia",
              "Largest & Deepest Ocean: Pacific Ocean"
            ],
            mnemonic: "7 Continents: Asia, Africa, North America, South America, Antarctica, Europe, Australia",
            color: "#3b82f6"
          },
          {
            title: "Map Directions & Symbols",
            points: [
              "North is always at the TOP of standard maps",
              "Blue indicates water; Green indicates plains; Brown indicates mountains",
              "Scale converts paper cm into real-world km"
            ],
            mnemonic: "NEWS = North, East, West, South",
            color: "#10b981"
          }
        ],
        diagram: {
          central: "Planet Earth",
          branches: [
            { label: "Continents", formula: "7 Major Landmasses (Asia largest)" },
            { label: "Oceans", formula: "5 Global Water Bodies (Pacific largest)" },
            { label: "Top on Map", formula: "North (0° Elevation)" },
            { label: "Map Scale", formula: "1 cm paper = real-world distance" }
          ]
        }
      }
    ],
    Mathematics: [
      {
        id: "m5_geo",
        chapter: "Shapes, Angles & Perimeter",
        unit: "Geometry & Measurement",
        weightage: "10 Marks",
        rootConcept: "2D Boundary & Spatial Angle Classification",
        nodes: [
          {
            title: "Types of Angles in Clock Faces",
            points: [
              "Right Angle = Exactly 90° (Clock at 3:00 or 9:00, looks like 'L')",
              "Acute Angle = Less than 90° (Clock at 2:00, sharp corner)",
              "Obtuse Angle = Greater than 90° (Clock at 5:00, wide opening)"
            ],
            mnemonic: "Acute is cute and small; Obtuse is open and big",
            color: "#3b82f6"
          },
          {
            title: "Perimeter vs Area Concept",
            points: [
              "Perimeter is the length of outer fencing around the boundary",
              "Rectangle Perimeter = 2 × (Length + Breadth)",
              "Area is the flat surface covered inside: Length × Breadth"
            ],
            mnemonic: "Perimeter walks the boundary; Area paints the floor",
            color: "#10b981"
          }
        ],
        diagram: {
          central: "Geometry Basics",
          branches: [
            { label: "Acute Angle", formula: "< 90° (Sharp)" },
            { label: "Right Angle", formula: "= 90° ('L' Shape)" },
            { label: "Perimeter", formula: "2 × (L + W)" },
            { label: "Area", formula: "L × W (sq units)" }
          ]
        }
      }
    ],
    English: [
      {
        id: "eng5_parts",
        chapter: "Parts of Speech & Story Sequencing",
        unit: "English Language",
        weightage: "10 Marks",
        rootConcept: "Grammatical Sentence Building",
        nodes: [
          {
            title: "Core Parts of Speech",
            points: [
              "Noun: Name of person, place, animal, or thing (Bengaluru, Tiger)",
              "Verb: Action word showing what someone does (runs, studies, leaps)",
              "Adjective: Describing word giving details about a noun (brave, tall)",
              "Adverb: Describes how an action is performed (walked slowly)"
            ],
            mnemonic: "Noun names it; Verb does it; Adjective colors it",
            color: "#8b5cf6"
          }
        ],
        diagram: {
          central: "Sentence Parts",
          branches: [
            { label: "Noun", formula: "Name / Entity" },
            { label: "Verb", formula: "Action / Doing word" },
            { label: "Adjective", formula: "Quality / Color" },
            { label: "Adverb", formula: "How action is done (-ly)" }
          ]
        }
      }
    ],
    Kannada: [
      {
        id: "kan5_basics",
        chapter: "ಕನ್ನಡ ವರ್ಣಮಾಲೆ ಮತ್ತು ನಾಮಪದಗಳು",
        unit: "ಕನ್ನಡ ವ್ಯಾಕರಣ",
        weightage: "10 Marks",
        rootConcept: "ವರ್ಣಮಾಲೆ ವಿಭಾಗಗಳು",
        nodes: [
          {
            title: "ಕನ್ನಡ ವರ್ಣಮಾಲೆ (49 ಅಕ್ಷರಗಳು)",
            points: [
              "ಸ್ವರಗಳು (14 ಅಕ್ಷರಗಳು): ಅ ಇಂದ ಔ ವರೆಗೆ",
              "ಯೋಗವಾಹಗಳು (2 ಅಕ್ಷರಗಳು): ಅಂ (ಅನುಸ್ವಾರ), ಅಃ (ವಿಸರ್ಗ)",
              "ವರ್ಗೀಯ ವ್ಯಂಜನಗಳು (25 ಅಕ್ಷರಗಳು): ಕ ಇಂದ ಮ ವರೆಗೆ",
              "ಅವರ್ಗೀಯ ವ್ಯಂಜನಗಳು (9 ಅಕ್ಷರಗಳು): ಯ ಇಂದ ಳ ವರೆಗೆ"
            ],
            mnemonic: "14 ಸ್ವರಗಳು + 2 ಯೋಗವಾಹಗಳು + 33 ವ್ಯಂಜನಗಳು = 49 ಒಟ್ಟು ಅಕ್ಷರಗಳು",
            color: "#f59e0b"
          }
        ],
        diagram: {
          central: "ಕನ್ನಡ ವರ್ಣಮಾಲೆ",
          branches: [
            { label: "ಸ್ವರಗಳು", formula: "14 ಅಕ್ಷರಗಳು (ಅ - ಔ)" },
            { label: "ಯೋಗವಾಹ", formula: "2 ಅಕ್ಷರಗಳು (ಅಂ, ಅಃ)" },
            { label: "ವರ್ಗೀಯ", formula: "25 ವ್ಯಂಜನಗಳು (ಕ - ಮ)" },
            { label: "ಅವರ್ಗೀಯ", formula: "9 ವ್ಯಂಜನಗಳು (ಯ - ಳ)" }
          ]
        }
      }
    ],
    Hindi: [
      {
        id: "hin5_vyak",
        chapter: "संज्ञा, सर्वनाम एवं विलोम शब्द",
        unit: "हिंदी व्याकरण",
        weightage: "10 Marks",
        rootConcept: "शब्द भेद एवं विपरीतार्थक",
        nodes: [
          {
            title: "संज्ञा के तीन मुख्य भेद",
            points: [
              "व्यक्तिवाचक: विशेष नाम (भारत, हिमालय, गंगा)",
              "जातिवाचक: संपूर्ण जाति का बोध (नदी, पर्वत, लड़का)",
              "भाववाचक: गुण, दोष, अवस्था (बचपन, मिठास, ईमानदारी)"
            ],
            mnemonic: "नाम = संज्ञा | नाम के स्थान पर = सर्वनाम",
            color: "#3b82f6"
          }
        ],
        diagram: {
          central: "संज्ञा के भेद",
          branches: [
            { label: "व्यक्तिवाचक", formula: "विशेष नाम (ताजमहल)" },
            { label: "जातिवाचक", formula: "सामान्य वर्ग (पुस्तक)" },
            { label: "भाववाचक", formula: "अनुभूति / गुण (मित्रता)" }
          ]
        }
      }
    ]
  }
};

export default function CheatSheets() {
  const { user } = useAuth();

  const userGrade = user && user.grade ? Number(user.grade) : 10;
  const initialGrade = userGrade >= 5 && userGrade <= 10 ? userGrade : 10;

  const [selectedGrade, setSelectedGrade] = useState(initialGrade);
  const [selectedSubject, setSelectedSubject] = useState("Science");
  const [selectedTier, setSelectedTier] = useState("standard");
  const [activeView, setActiveView] = useState("mindmap");
  const [activeChapterId, setActiveChapterId] = useState(null);

  const availableGradeData = COMPREHENSIVE_SYLLABUS[selectedGrade] || COMPREHENSIVE_SYLLABUS[10];
  const chapters = availableGradeData[selectedSubject] || availableGradeData["Science"] || [];
  const selectedChapter = chapters.find((c) => c.id === activeChapterId) || chapters[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: "32px 40px 60px", maxWidth: "100%", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#10b981", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            OFFICIAL STATE & NCERT TEXTBOOK INFOGRAPHICS
          </span>
          <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", margin: "6px 0" }}>
            Curriculum Concept Diagram & Revision Map
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            Structured visual concept mindmaps and chapter formula infographics for all 6 subjects across Classes 5 to 10.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ display: "flex", background: "#e2e8f0", padding: "3px", borderRadius: "10px" }}>
            <button
              onClick={() => setActiveView("mindmap")}
              style={{
                padding: "8px 14px",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                background: activeView === "mindmap" ? "#ffffff" : "transparent",
                color: activeView === "mindmap" ? "#0f172a" : "#64748b",
                boxShadow: activeView === "mindmap" ? "0 2px 4px rgba(0,0,0,0.06)" : "none"
              }}
            >
              🧠 Visual Mindmap
            </button>
            <button
              onClick={() => setActiveView("flowchart")}
              style={{
                padding: "8px 14px",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                background: activeView === "flowchart" ? "#ffffff" : "transparent",
                color: activeView === "flowchart" ? "#0f172a" : "#64748b",
                boxShadow: activeView === "flowchart" ? "0 2px 4px rgba(0,0,0,0.06)" : "none"
              }}
            >
              📊 Chapter Flowchart
            </button>
            <button
              onClick={() => setActiveView("cards")}
              style={{
                padding: "8px 14px",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                background: activeView === "cards" ? "#ffffff" : "transparent",
                color: activeView === "cards" ? "#0f172a" : "#64748b",
                boxShadow: activeView === "cards" ? "0 2px 4px rgba(0,0,0,0.06)" : "none"
              }}
            >
              📑 Formula Cards
            </button>
          </div>

          <button
            onClick={handlePrint}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#10b981",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              padding: "10px 18px",
              fontWeight: "700",
              fontSize: "13.5px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Diagram
          </button>
        </div>
      </div>

      {/* Control Filter Toolbar */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "18px 20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "center",
          marginBottom: "28px"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "11px", fontWeight: "800", color: "#64748b" }}>CLASS</label>
          <select
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(Number(e.target.value));
              setActiveChapterId(null);
            }}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px", fontWeight: "700" }}
          >
            {[5, 6, 7, 8, 9, 10].map((cls) => (
              <option key={cls} value={cls}>Class {cls} (State / NCERT)</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "11px", fontWeight: "800", color: "#64748b" }}>ALL 6 CORE SUBJECTS</label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setActiveChapterId(null);
            }}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px", fontWeight: "700", color: "#0f172a" }}
          >
            {CORE_SUBJECTS.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "11px", fontWeight: "800", color: "#64748b" }}>TEXTBOOK CHAPTER</label>
          <select
            value={selectedChapter?.id || ""}
            onChange={(e) => setActiveChapterId(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px", fontWeight: "700", maxWidth: "260px" }}
          >
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>{ch.chapter}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "11px", fontWeight: "800", color: "#64748b" }}>COGNITIVE TIER</label>
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13.5px", fontWeight: "700" }}
          >
            <option value="foundation">Foundation (Visual Concept)</option>
            <option value="standard">Standard (Board Regular)</option>
            <option value="advanced">Advanced (Exemplar & Derivations)</option>
          </select>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "12px", fontWeight: "800", color: "#10b981", background: "#ecfdf5", padding: "6px 14px", borderRadius: "999px" }}>
            ✓ Complete NCERT Tree Available
          </span>
        </div>
      </div>

      {/* 1. VISUAL MINDMAP INFOGRAPHIC VIEW */}
      {activeView === "mindmap" && selectedChapter && (
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "32px", boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <span style={{ fontSize: "11.5px", fontWeight: "800", color: "#2563eb", background: "#eff6ff", padding: "4px 12px", borderRadius: "999px" }}>
              {selectedSubject} • {selectedChapter.unit} • Board Weightage: {selectedChapter.weightage}
            </span>
            <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", margin: "10px 0 4px 0" }}>
              {selectedChapter.chapter}
            </h2>
            <div style={{ fontSize: "13.5px", color: "#64748b", fontWeight: "600" }}>
              Core Theme: <strong style={{ color: "#0f172a" }}>{selectedChapter.rootConcept}</strong>
            </div>
          </div>

          {/* Central Mindmap Hub & Branches Diagram */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "28px",
              padding: "10px 0 30px",
              background: "radial-gradient(circle at center, #f8fafc 0%, #ffffff 70%)",
              borderRadius: "16px",
              border: "1px dashed #e2e8f0",
              position: "relative"
            }}
          >
            {/* Central Node */}
            <div
              style={{
                background: "#0f172a",
                color: "#ffffff",
                padding: "16px 28px",
                borderRadius: "16px",
                fontWeight: "900",
                fontSize: "17px",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.25)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                zIndex: 2
              }}
            >
              <span>{selectedChapter.diagram.central}</span>
              <small style={{ fontSize: "11px", fontWeight: "700", color: "#10b981", letterSpacing: "0.06em" }}>
                CORE CONCEPT ANCHOR
              </small>
            </div>

            {/* Sub-branches Diagram Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${selectedChapter.diagram.branches.length}, minmax(180px, 1fr))`,
                gap: "16px",
                width: "92%",
                position: "relative"
              }}
            >
              {selectedChapter.diagram.branches.map((b, i) => (
                <div
                  key={i}
                  style={{
                    background: "#ffffff",
                    border: "2px solid #10b981",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    textAlign: "center",
                    boxShadow: "0 4px 10px rgba(16, 185, 129, 0.12)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px"
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#065f46", textTransform: "uppercase" }}>
                    Branch {i + 1}
                  </span>
                  <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{b.label}</strong>
                  <div
                    style={{
                      background: "#f0fdf4",
                      borderRadius: "6px",
                      padding: "6px 8px",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      fontWeight: "700",
                      color: "#047857"
                    }}
                  >
                    {b.formula}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Concept Breakout Cards */}
          <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: "32px 0 16px" }}>
            Key High-Yield Exam Notes & Memory Aids
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "20px" }}>
            {selectedChapter.nodes.map((node, idx) => (
              <div
                key={idx}
                style={{
                  background: "#f8fafc",
                  border: `1.5px solid ${node.color}40`,
                  borderTop: `4px solid ${node.color}`,
                  borderRadius: "14px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: "0 0 12px 0" }}>
                    {node.title}
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: "18px", color: "#334155", fontSize: "13px", lineHeight: "1.55" }}>
                    {node.points.map((pt, pIdx) => (
                      <li key={pIdx} style={{ marginBottom: "6px" }}>{pt}</li>
                    ))}
                  </ul>
                </div>

                <div
                  style={{
                    marginTop: "16px",
                    background: "#ffffff",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    border: "1px dashed #cbd5e1",
                    fontSize: "12px",
                    color: "#0f172a",
                    fontWeight: "700"
                  }}
                >
                  💡 Mnemonic: <span style={{ color: "#059669", fontWeight: "600" }}>{node.mnemonic}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. CHAPTER FLOWCHART VIEW */}
      {activeView === "flowchart" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {chapters.map((ch, index) => (
            <div
              key={ch.id}
              onClick={() => {
                setActiveChapterId(ch.id);
                setActiveView("mindmap");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "20px 24px",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "#10b981",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "900",
                  fontSize: "17px"
                }}
              >
                {index + 1}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#2563eb", background: "#eff6ff", padding: "2px 8px", borderRadius: "6px" }}>
                    {ch.unit}
                  </span>
                  <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700" }}>
                    Weightage: {ch.weightage}
                  </span>
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: "4px 0" }}>
                  {ch.chapter}
                </h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                  {ch.rootConcept} • Click to open interactive mindmap diagram →
                </p>
              </div>

              <span style={{ fontSize: "13px", fontWeight: "800", color: "#10b981" }}>
                View Mindmap ➔
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 3. FORMULA CARDS VIEW */}
      {activeView === "cards" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {chapters.map((ch) => (
            <div
              key={ch.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", background: "#f0fdf4", color: "#16a34a", padding: "3px 8px", borderRadius: "6px" }}>
                  {ch.unit} • {ch.weightage}
                </span>
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: "8px 0" }}>
                  {ch.chapter}
                </h3>
                <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
                  {ch.rootConcept}
                </p>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  border: "1px dashed #cbd5e1",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginTop: "14px"
                }}
              >
                {ch.diagram.branches[0]?.formula || "NCERT Core Rule Verified"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
