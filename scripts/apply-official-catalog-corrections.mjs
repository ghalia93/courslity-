import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match) continue;

    const key = match[1].trim();
    if (!key || process.env[key] !== undefined) continue;

    process.env[key] = match[2].trim();
  }
}

loadEnvFile(path.join(projectRoot, ".env.local"));

const SEMESTER_ORDER = { fall: 1, spring: 2, summer: 3 };

function course(code, title, credits) {
  return { code, title, credits };
}

function term(year, semester, courses) {
  return { year, semester, courses };
}

function requirement(code, title, credits) {
  return course(code, `Requirement: ${title}`, credits);
}

const PROGRAMS = [
  {
    university: "American University of Beirut",
    department: "Electrical and Computer Engineering",
    major: "Computer and Communications Engineering",
    title: "Official BE in Computer and Communications Engineering Roadmap",
    totalCredits: 150,
    language: "English",
    source: "AUB Computer and Communications Engineering curriculum supplied by user",
    terms: [
      term(1, "fall", [
        course("FEAA 200", "Introduction to Engineering and Architecture", 3),
        course("EECE 210", "Electric Circuits", 3),
        course("ENGL 203", "Academic English", 3),
        course("MATH 201", "Calculus and Analytic Geometry III", 3),
        course("MATH/CMPS 211", "Discrete Structures", 3),
      ]),
      term(1, "spring", [
        course("EECE 230", "Introduction to Computation and Programming", 3),
        course("EECE 290", "Analog Signal Processing", 3),
        course("MATH 202", "Differential Equations", 3),
        course("MATH 218/219", "Linear Algebra", 3),
        course("PHYS 210", "Introductory Physics II", 3),
        course("PHYS 210L", "Introductory Physics Laboratory II", 1),
      ]),
      term(1, "summer", [
        course("CHEM 201/202", "Chemistry Course", 3),
        course("CHEM 203/205", "Chemistry Laboratory", 2),
        requirement("AUB-HSS-1", "Humanities or Social Sciences Elective", 3),
      ]),
      term(2, "fall", [
        course("EECE 310", "Electronics", 3),
        course("EECE 310L", "Electric Circuits Laboratory", 1),
        course("EECE 320", "Digital Systems Design", 3),
        course("EECE 330", "Data Structures and Algorithms", 3),
        course("EECE 380", "Engineering Electromagnetics", 3),
        course("STAT 230/233", "Introduction to Probability and Random Variables", 3),
      ]),
      term(2, "spring", [
        course("EECE 311", "Electronic Circuits", 3),
        course("EECE 321", "Computer Organization", 3),
        course("EECE 321L", "Computer Organization Laboratory", 1),
        course("EECE 340", "Signals and Systems", 3),
        course("EECE 350", "Computer Networks", 3),
        requirement("AUB-SCI-1", "Science Elective", 3),
      ]),
      term(2, "summer", [
        course("ENGL 206", "Technical English", 3),
        course("ARAB", "Arabic", 3),
        requirement("AUB-CHSI-1", "Cultures and Histories or Societies and Individuals Elective", 3),
      ]),
      term(3, "fall", [
        course("EECE 442", "Communication Systems", 3),
        requirement("AUB-EECE-RE-1", "EECE 3xx/4xx Restricted Elective", 3),
        requirement("AUB-EECE-RE-2", "EECE 3xx/4xx Restricted Elective", 3),
        requirement("AUB-MATH-ELEC", "Math Elective", 3),
        course("INDE 301", "Engineering Economy", 3),
      ]),
      term(3, "spring", [
        requirement("AUB-EECE-RE-3", "EECE 3xx/4xx Restricted Elective", 3),
        requirement("AUB-EECE-RE-4", "EECE 3xx/4xx Restricted Elective", 3),
        requirement("AUB-CEL", "Community Engaged Learning", 3),
        course("EECE 410L", "System Integration Laboratory", 1),
        course("INDE 410", "Human Values", 3),
        requirement("AUB-CHSI-2", "Cultures and Histories or Societies and Individuals Elective", 3),
      ]),
      term(3, "summer", [
        course("EECE 500", "Approved Experience", 6),
      ]),
      term(4, "fall", [
        course("EECE 501", "Final Year Project", 3),
        requirement("AUB-EECE-LAB-1", "EECE Restricted Laboratory", 1),
        requirement("AUB-EECE-ELEC-1", "EECE 3xx/4xx Elective", 3),
        requirement("AUB-EECE-ELEC-2", "EECE Elective", 3),
        requirement("AUB-PREAPP-1", "Pre-Approved Elective", 3),
        requirement("AUB-CHSI-3", "Cultures and Histories or Societies and Individuals Elective", 3),
      ]),
      term(4, "spring", [
        course("EECE 502", "Final Year Project", 4),
        requirement("AUB-EECE-LAB-2", "EECE Elective Laboratory", 1),
        requirement("AUB-EECE-ELEC-3", "EECE Elective", 3),
        requirement("AUB-PREAPP-2", "Pre-Approved Elective", 3),
        requirement("AUB-PREAPP-3", "Pre-Approved Elective", 3),
        requirement("AUB-CHSI-4", "Cultures and Histories or Societies and Individuals Elective", 3),
      ]),
    ],
  },
  {
    university: "Lebanese International University",
    department: "Computer and Communications Engineering",
    major: "Computer Engineering",
    title: "Official BS in Computer Engineering Roadmap",
    totalCredits: 108,
    language: "English",
    source: "CENG-POS.pdf",
    terms: [
      term(1, "fall", [
        course("CULT200", "Introduction to Arab - Islamic Civilization", 3),
        course("MATH225", "Linear Algebra with Applications", 3),
        course("ENGL201", "Composition and Research Skills", 3),
        course("ENGG200", "Introduction to Engineering", 3),
        course("PHYS220", "Physics for Engineers", 3),
        course("MATH210", "Calculus II", 3),
      ]),
      term(1, "spring", [
        course("CSCI250L", "Introduction to Programming Lab", 1),
        course("MATH270", "Ordinary Differential Equations", 3),
        course("CSCI250", "Introduction to Programming", 3),
        course("EENG250", "Electric Circuits I", 3),
        course("CENG250", "Digital Logic I", 3),
        course("MATH220", "Calculus III", 3),
      ]),
      term(1, "summer", [
        course("ARAB200", "Arabic Language and Literature", 3),
        course("ENGL251", "Communication Skills", 3),
      ]),
      term(2, "fall", [
        course("CSCI300", "Intermediate Programming with Objects", 3),
        course("EENG300", "Electric Circuits II", 3),
        course("MATH310", "Probability & Statistics for Scientists & Engineers", 3),
        course("CENG335", "Digital Logic II", 3),
        course("CENG325", "Software Applications and Design", 3),
        course("EENG301L", "Electric Circuits Lab", 1),
      ]),
      term(2, "spring", [
        course("EENG350L", "Electronic Circuits I Lab", 1),
        course("ENGG300", "Engineering Economics", 3),
        course("CENG352L", "Digital Logic Circuits Lab", 1),
        course("EENG385", "Signals and Systems", 3),
        course("CENG375", "Introduction to Database Systems", 3),
        course("CENG380", "Microprocessors and Microcontrollers", 3),
        course("EENG350", "Electronic Circuits I", 3),
      ]),
      term(3, "fall", [
        course("CENG430L", "Linux Lab", 1),
        course("EENG447", "Analog Communication Systems", 3),
        course("CENG415", "Communication Networks", 3),
        course("CENG420", "Web Programming and Technologies", 3),
        course("CENG400L", "Microcontroller Applications Lab", 1),
        course("CENG400", "Computer Organization and Design", 3),
        course("CENG435", "Mobile Application Development", 3),
      ]),
      term(3, "spring", [
        course("CENG450L", "Scripting Languages Lab", 1),
        course("CENG460", "Operating Systems", 3),
        course("CENG470", "Data Structures and Analysis of Algorithms", 3),
        course("CENG455L", "Communication Networks Lab", 1),
        requirement("LIU-CENG-ELEC-3", "Computer Engineering Major Elective", 3),
        course("CENG495", "Senior Project", 3),
        course("EENG467L", "Analog Communication Systems Lab", 1),
        course("ENGG450", "Engineering Ethics and Professional Practice", 3),
      ]),
    ],
  },
  {
    university: "Beirut Arab University",
    department: "Computer Engineering",
    major: "Computer Engineering",
    title: "Official Bachelor of Engineering in Computer Engineering Roadmap",
    totalCredits: 150,
    language: "English",
    source: "Computer-Engineering.pdf",
    terms: [
      term(1, "fall", [
        course("MATH 281", "Linear Algebra", 3),
        course("MATH 282", "Calculus", 3),
        course("PHYS 281", "Electricity and Magnetism", 3),
        course("ENGR 002", "Introduction to Engineering", 2),
        course("MCHE 213", "Dynamics", 3),
        course("ARAB 001", "Arabic Language", 2),
      ]),
      term(1, "spring", [
        course("PHYS 282", "Material Properties and Heat", 3),
        course("MATH 283", "Differential Equations", 3),
        course("COMP 208", "Programming I", 3),
        course("COMP 225", "Digital Systems I", 3),
        course("POWE 212", "Electric Circuits I", 3),
        course("ENGL 001", "English Language", 2),
      ]),
      term(1, "summer", [
        course("ENGL 211", "Advanced Writing", 2),
        course("CHEM 241", "Principles of Chemistry", 3),
        course("BLAW 001", "Human Rights", 1),
        requirement("BAU-GE-1", "General Elective", 3),
      ]),
      term(2, "fall", [
        course("COMP 210", "Programming II", 3),
        course("COMP 215", "Programming for Engineers", 3),
        course("COME 223", "Digital Electronics", 3),
        course("COMP 226", "Digital Systems II", 3),
        course("COMP 231", "Discrete Structures", 3),
        course("ENGL 300", "Speech Communications", 2),
      ]),
      term(2, "spring", [
        course("MATH 284", "Numerical Analysis", 3),
        course("MATH 381", "Probability and Statistics", 3),
        course("COMP 232", "Data Structures", 3),
        course("COMP 311", "Object Oriented Programming", 3),
        course("COMP 325", "Microprocessor Organization and Design", 3),
        course("INME 221", "Engineering Economy", 3),
      ]),
      term(2, "summer", [
        course("MGMT 002", "Entrepreneurship", 2),
        course("CHEM 405", "Solid State Chemistry", 2),
        course("ENGR 001", "Engineering Ethics", 1),
        requirement("BAU-GE-2", "General Elective", 4),
      ]),
      term(3, "fall", [
        course("COMP 337", "Analysis and Design of Algorithms", 3),
        course("COME 411", "Instrumentation", 3),
        course("COMP 361", "Control Systems for Computer Engineers", 3),
        course("COMP 453", "Transmission and Processing of Digital Signals", 3),
        course("COMP 423", "Computer Architecture", 3),
        course("COMP 431", "Queuing and Modeling", 3),
      ]),
      term(3, "spring", [
        course("COMP 364", "Introduction to Artificial Intelligence and Machine Learning", 3),
        course("COMP 428", "Digital Systems Design", 3),
        course("COMP 442", "Software Engineering", 3),
        course("COMP 454", "Computer Networks", 3),
        course("COMP 454L", "Computer Networks Lab", 1),
        course("COMP 344", "Database Systems", 3),
        requirement("BAU-GE-3", "General Elective", 1),
      ]),
      term(3, "summer", [
        course("COMP 499", "Internship (Approved Experience / Independent Study)", 1),
      ]),
      term(4, "fall", [
        course("COMP 500", "Research Methodology", 2),
        course("COMP 501", "Final Year Project I", 1),
        course("COMP 543", "Cryptography and Information Security", 3),
        course("COMP 543L", "Cryptography and Information Security Lab", 1),
        course("COMP 438", "Performance Evaluation", 3),
        course("COMP 444", "System Programming", 3),
      ]),
      term(4, "spring", [
        course("COMP 452", "Compilers", 3),
        course("COMP 502", "Final Year Project II", 3),
        course("COMP 525", "Embedded and Microprocessor Systems", 3),
        course("COMP 443", "Operating Systems", 3),
        course("COMP 455", "Mobile Computing", 3),
      ]),
    ],
  },
  {
    university: "Lebanese American University",
    department: "Electrical and Computer Engineering",
    major: "Computer Engineering",
    title: "Official BE in Computer Engineering Roadmap",
    totalCredits: 150,
    language: "English",
    source: "LAU Academic Catalog 2024-2025 / COE course map",
    terms: [
      term(1, "fall", [
        course("ENG 202", "Advanced Academic English", 3),
        course("PHY 201", "Electricity and Magnetism", 3),
        course("MTH 201", "Calculus III", 3),
        course("MTH 207", "Discrete Structures I", 3),
        course("GNE 212", "Engineering Mechanics", 3),
        course("COE 201", "Computer Proficiency", 1),
      ]),
      term(1, "spring", [
        course("COE 211", "Computer Programming", 4),
        course("MTH 206", "Calculus IV", 3),
        course("MTH 304", "Differential Equations", 3),
        requirement("LAU-LAS-1", "Liberal Arts and Sciences Elective", 3),
        requirement("LAU-LAS-2", "Liberal Arts and Sciences Elective", 3),
      ]),
      term(1, "summer", [
        course("COM 203", "Art of Public Communication", 3),
        requirement("LAU-LAS-3", "Liberal Arts and Sciences Elective", 3),
        requirement("LAU-FREE-1", "Free Elective", 3),
      ]),
      term(2, "fall", [
        course("ELE 300", "Electric Circuits", 3),
        course("ELE 303", "Electrical Circuits Lab", 1),
        course("COE 312", "Data Structures", 3),
        course("COE 321", "Logic Design", 3),
        course("GNE 331", "Probability and Statistics", 3),
        requirement("LAU-LAS-4", "Liberal Arts and Sciences Elective", 3),
      ]),
      term(2, "spring", [
        course("ELE 401", "Electronics I", 3),
        course("ELE 402", "Electronics I Lab", 1),
        course("ELE 430", "Signals and Systems", 3),
        course("COE 313", "Data Structures Lab", 1),
        course("COE 322", "Logic Design Lab", 1),
        course("COE 323", "Microprocessors", 3),
        course("COE 415", "Computer Programming II", 3),
        course("COE 415B", "Computer Programming II Lab", 1),
      ]),
      term(2, "summer", [
        course("GNE 301", "Professional Communication", 2),
        course("GNE 303", "Engineering Ethics", 2),
        course("INE 320", "Engineering Economy I", 3),
      ]),
      term(3, "fall", [
        course("COE 418", "Database Systems", 3),
        course("ELE 537", "Communication Systems", 3),
        course("COE 324", "Microprocessors Lab", 1),
        course("COE 423", "Computer Architecture", 3),
        course("COE 493", "Professionalism in Engineering", 3),
        course("COE 522", "High Performance Computer Architecture", 3),
      ]),
      term(3, "spring", [
        course("COE 424", "Digital Systems", 3),
        course("ELE 540", "Communication Systems Lab", 1),
        course("COE 545", "Information Security", 3),
        course("COE 543", "Intelligent Data Processing & Applications", 3),
        course("COE 546", "Machine Learning", 3),
        course("COE 416", "Software Engineering", 3),
      ]),
      term(3, "summer", [
        course("COE 498", "Professional Experience - Comp", 6),
      ]),
      term(4, "fall", [
        course("ELE 442", "Control Systems", 3),
        course("ELE 443", "Control Systems Lab", 1),
        course("COE 414", "Operating Systems", 3),
        course("COE 425", "Digital Systems Lab", 1),
        course("COE 521", "Embedded Systems", 3),
        course("COE 593", "Computer Engineering Applications", 3),
        course("COE 595", "Capstone Design Project I", 3),
      ]),
      term(4, "spring", [
        course("COE 431", "Computer Networks", 3),
        course("COE 596", "Capstone Design Project II", 3),
        course("GNE 335", "Introduction to Sustainable Engineering", 3),
        course("ELE 531", "Optical Fiber Communications", 3),
        course("ELE 535", "Information and Coding Theory", 3),
      ]),
    ],
  },
  {
    university: "University of Balamand",
    department: "Computer Engineering",
    major: "Computer Engineering",
    title: "Official BE in Computer Engineering Roadmap",
    totalCredits: 146,
    language: "English",
    source: "BEComputer.pdf",
    terms: [
      term(1, "fall", [
        course("CSIS 200", "Introduction to Computers and Programming", 3),
        course("CSIS 285", "Basic Programming Lab", 1),
        course("ELCP 211", "Engineering Drawing", 1),
        course("ELEN 201", "Instrumentation Lab", 1),
        course("ENGL 203", "English Communication Skills III", 3),
        course("MATH 200", "Calculus I", 3),
        course("MATH 211", "Linear Algebra I", 3),
        course("MECH 232", "Thermodynamics", 3),
      ]),
      term(1, "spring", [
        course("CPEN 211", "Introduction to Digital Logic Design", 3),
        course("CSIS 215", "Object-Oriented Programming", 3),
        course("CSIS 286", "Object Oriented Programming Lab", 1),
        course("ELCP 290", "Introduction to the Engineering Design Fundamentals", 1),
        course("ELEN 202", "Electrical Simulation and Design", 1),
        course("ELEN 221", "Circuits Analysis I", 3),
        course("MATH 202", "Calculus II", 3),
        course("MATH 270", "Differential Equations", 3),
      ]),
      term(2, "fall", [
        course("CPEN 202", "Logic Lab", 1),
        course("CPEN 212", "Logic Circuits", 3),
        course("CPEN 220", "Programming for Engineering Solutions", 3),
        course("GENG 221", "Engineering Ethics", 3),
        course("ELEN 231", "Electronics I", 3),
        course("ENGL 2XX", "English Elective", 3),
        course("MATH 230", "Numerical Analysis I", 3),
      ]),
      term(2, "spring", [
        course("CPEN 213", "Microprocessors", 3),
        course("ELEN 222", "Signals and Systems Theory", 3),
        course("CPEN 313", "Computer Embedded System", 3),
        course("GENG 222", "Sustainable Development for Engineers", 3),
        course("ELEN 303", "Circuits Analysis Lab", 1),
        course("ELEN 304", "Electronics Lab", 1),
        course("LISP 200", "Information Skills and Search Techniques", 1),
        course("CPEN 309", "Embedded Controllers Lab", 1),
        course("MATH 246", "Probability for Engineers", 3),
      ]),
      term(3, "fall", [
        course("CPEN 305", "Microcontrollers Lab", 1),
        course("CPEN 307", "PLC Lab", 1),
        course("CPEN 314", "Computer Architecture", 3),
        course("CPEN 324", "Programmable Logic Controllers", 3),
        course("CPEN 241", "Information Networking I", 3),
        course("ELCP 391", "Senior Design 1", 2),
        course("ELEN 341", "Telecommunications", 3),
        course("CSIS 216", "Data Structure", 3),
      ]),
      term(3, "spring", [
        course("CPEN 310", "Cybersecurity Lab", 1),
        course("CPEN 341", "Cybersecurity", 3),
        course("CSPR XXX", "Cultural Studies", 3),
        course("ELCP 392", "Senior Design 2", 2),
        course("ELEN 306", "Telecommunications Lab", 1),
        course("ELEN 326", "Digital Signal Processing", 3),
        course("CSIS 221", "Operating Systems", 3),
      ]),
      term(4, "fall", [
        course("ELEN 400", "Linear Systems", 3),
        course("ELEN 401", "Optimization Theory", 3),
        course("CPEN 441", "Information Networking II", 3),
        course("CSIS 375", "Software Engineering", 3),
        course("CPEN 442", "Network Programming", 3),
      ]),
      term(4, "spring", [
        course("GENG 400", "Engineering Seminars", 1),
        course("GENG 490", "Graduation Project", 3),
        course("CPEN 445", "Biometrics", 3),
        course("CPEN 448", "Cloud Computing and Big Data", 3),
        course("CPEN 546", "Wireless Networks", 3),
      ]),
      term(5, "fall", [
        course("CPEN 480", "Field Training", 3),
      ]),
      term(5, "spring", [
        course("GENG 490R", "Graduation Project (Reactivation)", 0),
        course("CPEN 549", "Intelligent Networks", 3),
        course("CPEN 545", "Cryptography", 3),
      ]),
    ],
  },
  {
    university: "Université Saint-Joseph de Beyrouth",
    department: "Engineering",
    major: "Computer and Communications Engineering",
    title: "Official Diplome d'ingenieur in Computer and Communications Engineering Roadmap",
    totalCredits: 180,
    language: "French",
    source: "USJ ESIB 2024 catalogue",
    terms: [
      term(1, "fall", [
        course("020ELAES1", "Electronique analogique", 6),
        course("020GPRES2", "Gestion de projets", 4),
        course("020INRES1", "Introduction aux reseaux de donnees", 6),
        course("020CPPES1", "Programmation orientee objets", 6),
        course("020STAES1", "Statistiques", 4),
        course("020THSES2", "Theorie du signal", 4),
        course("USJ-VALEURS", "Les valeurs de l'USJ au quotidien", 2),
      ]),
      term(1, "spring", [
        course("020ADUES3", "Administration Unix", 4),
        course("020BDRES2", "Bases de donnees relationnelles", 4),
        course("020CONES3", "Communications analogiques et numeriques", 6),
        course("020ELNES2", "Electronique numerique", 6),
        course("020RCOES2", "Routage et commutation", 4),
        course("020TCOES2", "Techniques d'expression et de communication", 2),
        course("020TROES2", "Theorie des graphes et recherche operationnelle", 4),
        requirement("USJ-ARABE-1", "Langue et culture arabes", 2),
      ]),
      term(2, "fall", [
        course("020ETHES3", "Ethique et entreprise", 4),
        course("020ENTES1/020WRNES1", "Entrepreneurship ou Work Ready Now", 2),
        course("020SDAES3", "Structures de donnees et algorithmes", 4),
        course("020ADPES3", "Analyse de projets", 4),
        course("020AROES3", "Architecture des ordinateurs", 4),
        course("020IA2ES4", "Intelligence artificielle", 4),
        course("020MCOES3", "Modeles de conception", 4),
        course("020BDAES3", "Bases de donnees avancees", 4),
        course("020EFPES4", "Effective Programming", 4),
      ]),
      term(2, "spring", [
        course("020ANGES4", "Anglais", 4),
        course("020PRMES4", "Projet multidisciplinaire", 6),
        course("020APDES4", "Applications distribuees", 4),
        course("020PCOES4", "Principes des compilateurs", 4),
        course("020SSEES4", "Systemes d'exploitation", 4),
        requirement("USJ-OO-2", "Optionnelle ouverte", 2),
        course("020DMOES4", "Developpement pour mobiles", 4),
        course("020CRYES4", "Cryptographie", 4),
      ]),
      term(3, "fall", [
        course("020CMPES5", "Comptabilite", 4),
        course("020DROES5", "Droit des affaires", 2),
        course("020MNGES5", "Management", 2),
        course("020STGES5", "Stage en entreprise", 2),
        course("020GLOES5", "Genie logiciel", 4),
        course("020IAEES5", "Integration des applications d'entreprises", 4),
        course("020PPLES5", "Programmation parallele", 4),
        course("020VIRES5", "Virologie informatique", 4),
        course("020CLDES5", "Cloud et transformation digitale", 4),
        course("020ADWES4", "Administration Windows", 4),
      ]),
      term(3, "spring", [
        course("020PFEES6", "Projet de fin d'etudes", 16),
      ]),
    ],
  },
];

function validateProgram(program) {
  const seenCodes = new Set();
  let total = 0;

  for (const roadmapTerm of program.terms) {
    if (!["fall", "spring", "summer"].includes(roadmapTerm.semester)) {
      throw new Error(`${program.university}: invalid semester ${roadmapTerm.semester}`);
    }

    for (const roadmapCourse of roadmapTerm.courses) {
      if (!roadmapCourse.code || roadmapCourse.code.length > 50) {
        throw new Error(`${program.university}: invalid course code ${roadmapCourse.code}`);
      }

      if (seenCodes.has(roadmapCourse.code)) {
        throw new Error(`${program.university}: duplicate roadmap code ${roadmapCourse.code}`);
      }

      seenCodes.add(roadmapCourse.code);
      total += roadmapCourse.credits;
    }
  }

  if (total !== program.totalCredits) {
    throw new Error(
      `${program.university}: roadmap credits sum to ${total}, expected ${program.totalCredits}`,
    );
  }
}

async function ensureRoadmapTables(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS major (
      major_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      department_id INT UNSIGNED NOT NULL,
      name VARCHAR(255) NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (major_id),
      UNIQUE KEY uniq_major_department_name (department_id, name),
      KEY idx_major_department (department_id),
      CONSTRAINT fk_major_department
        FOREIGN KEY (department_id) REFERENCES department(department_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS roadmap (
      roadmap_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      major_id INT UNSIGNED NOT NULL,
      level ENUM('freshman','undergraduate','graduate','master_degree','doctoral') NOT NULL,
      title VARCHAR(255) NOT NULL DEFAULT '',
      total_credits SMALLINT UNSIGNED NOT NULL DEFAULT 0,
      is_published TINYINT(1) NOT NULL DEFAULT 1,
      created_by INT UNSIGNED NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (roadmap_id),
      UNIQUE KEY uniq_roadmap_major_level (major_id, level),
      KEY idx_roadmap_level (level),
      KEY idx_roadmap_created_by (created_by),
      CONSTRAINT fk_roadmap_major
        FOREIGN KEY (major_id) REFERENCES major(major_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT fk_roadmap_created_by
        FOREIGN KEY (created_by) REFERENCES user(user_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS roadmap_course (
      roadmap_course_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      roadmap_id INT UNSIGNED NOT NULL,
      course_id INT UNSIGNED NOT NULL,
      year_number TINYINT UNSIGNED NOT NULL,
      semester ENUM('fall','spring','summer') NOT NULL,
      sequence_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (roadmap_course_id),
      UNIQUE KEY uniq_roadmap_course (roadmap_id, course_id),
      KEY idx_roadmap_course_term (roadmap_id, year_number, semester, sequence_order),
      KEY idx_roadmap_course_course (course_id),
      CONSTRAINT fk_roadmap_course_roadmap
        FOREIGN KEY (roadmap_id) REFERENCES roadmap(roadmap_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT fk_roadmap_course_course
        FOREIGN KEY (course_id) REFERENCES course(course_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function getUniversityId(connection, name) {
  const [rows] = await connection.query(
    "SELECT university_id FROM university WHERE name = ? AND is_active = 1 LIMIT 1",
    [name],
  );

  if (!rows.length) {
    throw new Error(`University not found: ${name}`);
  }

  return rows[0].university_id;
}

async function ensureDepartment(connection, universityId, name) {
  const [rows] = await connection.query(
    "SELECT department_id FROM department WHERE university_id = ? AND LOWER(name) = LOWER(?) LIMIT 1",
    [universityId, name],
  );

  if (rows.length) {
    await connection.query(
      "UPDATE department SET name = ?, is_active = 1 WHERE department_id = ?",
      [name, rows[0].department_id],
    );
    return rows[0].department_id;
  }

  const [result] = await connection.query(
    "INSERT INTO department (name, university_id, is_active) VALUES (?, ?, 1)",
    [name, universityId],
  );

  return result.insertId;
}

async function ensureMajor(connection, departmentId, name) {
  await connection.query(
    `INSERT INTO major (department_id, name, is_active)
      VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        is_active = 1`,
    [departmentId, name],
  );

  const [rows] = await connection.query(
    "SELECT major_id FROM major WHERE department_id = ? AND name = ? LIMIT 1",
    [departmentId, name],
  );

  if (!rows.length) {
    throw new Error(`Major not found after upsert: ${name}`);
  }

  return rows[0].major_id;
}

async function unpublishOldComputerEngineeringRoadmaps(connection, universityId) {
  await connection.query(
    `UPDATE roadmap r
      INNER JOIN major m ON m.major_id = r.major_id
      INNER JOIN department d ON d.department_id = m.department_id
      SET r.is_published = 0
      WHERE d.university_id = ?
        AND r.level = 'undergraduate'
        AND LOWER(m.name) IN (
          'computer engineering',
          'computer and communications engineering',
          'electrical and computer engineering',
          'genie informatique et communications',
          'génie informatique et communications',
          'genie informatique et communications - genie logiciel',
          'génie informatique et communications - génie logiciel',
          'genie informatique et communications - reseaux',
          'génie informatique et communications - réseaux',
          'genie informatique et communications - reseaux de telecommunications',
          'génie informatique et communications - réseaux de télécommunications'
        )`,
    [universityId],
  );
}

async function ensureRoadmap(connection, majorId, title, totalCredits) {
  await connection.query(
    `INSERT INTO roadmap (major_id, level, title, total_credits, is_published, created_by)
      VALUES (?, 'undergraduate', ?, ?, 1, NULL)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        total_credits = VALUES(total_credits),
        is_published = 1`,
    [majorId, title, totalCredits],
  );

  const [rows] = await connection.query(
    "SELECT roadmap_id FROM roadmap WHERE major_id = ? AND level = 'undergraduate' LIMIT 1",
    [majorId],
  );

  if (!rows.length) {
    throw new Error(`Roadmap not found after upsert for major ${majorId}`);
  }

  return rows[0].roadmap_id;
}

async function upsertCourse(connection, departmentId, program, roadmapCourse) {
  await connection.query(
    `INSERT INTO course
      (code, title, description, credits, language, level, department_id, deleted_at)
      VALUES (?, ?, ?, ?, ?, 'undergraduate', ?, NULL)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        credits = VALUES(credits),
        language = VALUES(language),
        level = VALUES(level),
        deleted_at = NULL`,
    [
      roadmapCourse.code,
      roadmapCourse.title,
      `Official roadmap item for ${program.major}. Source: ${program.source}.`,
      roadmapCourse.credits,
      program.language,
      departmentId,
    ],
  );

  const [rows] = await connection.query(
    "SELECT course_id FROM course WHERE department_id = ? AND code = ? LIMIT 1",
    [departmentId, roadmapCourse.code],
  );

  if (!rows.length) {
    throw new Error(`Course not found after upsert: ${roadmapCourse.code}`);
  }

  return rows[0].course_id;
}

async function applyProgram(connection, program) {
  validateProgram(program);

  const universityId = await getUniversityId(connection, program.university);

  await connection.beginTransaction();
  try {
    await unpublishOldComputerEngineeringRoadmaps(connection, universityId);

    const departmentId = await ensureDepartment(
      connection,
      universityId,
      program.department,
    );
    const majorId = await ensureMajor(connection, departmentId, program.major);
    const roadmapId = await ensureRoadmap(
      connection,
      majorId,
      program.title,
      program.totalCredits,
    );

    await connection.query("DELETE FROM roadmap_course WHERE roadmap_id = ?", [
      roadmapId,
    ]);

    const sortedTerms = [...program.terms].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return SEMESTER_ORDER[a.semester] - SEMESTER_ORDER[b.semester];
    });

    for (const roadmapTerm of sortedTerms) {
      let sequence = 10;

      for (const roadmapCourse of roadmapTerm.courses) {
        const courseId = await upsertCourse(
          connection,
          departmentId,
          program,
          roadmapCourse,
        );

        await connection.query(
          `INSERT INTO roadmap_course
            (roadmap_id, course_id, year_number, semester, sequence_order)
            VALUES (?, ?, ?, ?, ?)`,
          [
            roadmapId,
            courseId,
            roadmapTerm.year,
            roadmapTerm.semester,
            sequence,
          ],
        );
        sequence += 10;
      }
    }

    const [creditRows] = await connection.query(
      `SELECT COALESCE(SUM(c.credits), 0) AS credits, COUNT(*) AS courses
        FROM roadmap_course rc
        INNER JOIN course c ON c.course_id = rc.course_id
        WHERE rc.roadmap_id = ?`,
      [roadmapId],
    );

    const appliedCredits = Number(creditRows[0]?.credits ?? 0);
    const appliedCourses = Number(creditRows[0]?.courses ?? 0);

    if (appliedCredits !== program.totalCredits) {
      throw new Error(
        `${program.university}: applied credits ${appliedCredits}, expected ${program.totalCredits}`,
      );
    }

    await connection.commit();

    return {
      university: program.university,
      department: program.department,
      major: program.major,
      roadmapId,
      courses: appliedCourses,
      credits: appliedCredits,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}

async function softDeleteUnlinkedCourses(connection) {
  const [result] = await connection.query(`
    UPDATE course c
    SET c.deleted_at = CURRENT_TIMESTAMP
    WHERE c.deleted_at IS NULL
      AND NOT EXISTS (
        SELECT 1
        FROM roadmap_course rc
        INNER JOIN roadmap r
          ON r.roadmap_id = rc.roadmap_id
          AND r.is_published = 1
        INNER JOIN major m
          ON m.major_id = r.major_id
          AND m.is_active = 1
        WHERE rc.course_id = c.course_id
          AND m.department_id = c.department_id
      )
  `);

  return Number(result.affectedRows ?? 0);
}

async function countActiveUnlinkedCourses(connection) {
  const [rows] = await connection.query(`
    SELECT COUNT(*) AS count
    FROM course c
    WHERE c.deleted_at IS NULL
      AND NOT EXISTS (
        SELECT 1
        FROM roadmap_course rc
        INNER JOIN roadmap r
          ON r.roadmap_id = rc.roadmap_id
          AND r.is_published = 1
        INNER JOIN major m
          ON m.major_id = r.major_id
          AND m.is_active = 1
        WHERE rc.course_id = c.course_id
          AND m.department_id = c.department_id
      )
  `);

  return Number(rows[0]?.count ?? 0);
}

for (const program of PROGRAMS) {
  validateProgram(program);
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});

try {
  await ensureRoadmapTables(connection);

  const applied = [];
  for (const program of PROGRAMS) {
    applied.push(await applyProgram(connection, program));
  }

  const removedUnlinkedCourses = await softDeleteUnlinkedCourses(connection);
  const remainingUnlinkedCourses = await countActiveUnlinkedCourses(connection);

  if (remainingUnlinkedCourses > 0) {
    throw new Error(
      `There are still ${remainingUnlinkedCourses} active courses without a published major link.`,
    );
  }

  console.table(applied);
  console.log(
    `Soft-deleted ${removedUnlinkedCourses} active course(s) without a published major link.`,
  );
  console.log("Official Computer Engineering catalog corrections applied.");
} finally {
  await connection.end();
}
