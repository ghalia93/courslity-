-- Applies incremental schema and seed updates for existing course databases.
USE course_checker;

ALTER TABLE `user`
  MODIFY role ENUM('student','admin','super_admin') NOT NULL DEFAULT 'student';

UPDATE `user`
SET role = 'admin'
WHERE role = '';

ALTER TABLE university ADD COLUMN email_domain VARCHAR(100) NOT NULL DEFAULT '';

ALTER TABLE course
  MODIFY level ENUM('freshman','undergraduate','graduate','master_degree','doctoral','professional') NOT NULL;

UPDATE course SET level = 'graduate' WHERE level = 'professional';

ALTER TABLE course
  MODIFY level ENUM('freshman','undergraduate','graduate','master_degree','doctoral') NOT NULL;

UPDATE university SET email_domain = 'student.bau.edu.lb' WHERE name = 'Beirut Arab University';
UPDATE university SET email_domain = 'mail.aub.edu' WHERE name = 'American University of Beirut';
UPDATE university SET email_domain = 'students.lau.edu.lb' WHERE name = 'Lebanese American University';
UPDATE university SET email_domain = 'students.liu.edu.lb' WHERE name = 'Lebanese International University';
UPDATE university SET email_domain = 'net.usj.edu.lb' WHERE name = 'Université Saint-Joseph de Beyrouth';
UPDATE university SET email_domain = 'balamand.edu.lb' WHERE name = 'University of Balamand';

ALTER TABLE feedback
  MODIFY user_id INT UNSIGNED NULL;

ALTER TABLE feedback
  DROP FOREIGN KEY fk_feedback_user;

ALTER TABLE feedback
  ADD CONSTRAINT fk_feedback_user
    FOREIGN KEY (user_id) REFERENCES user(user_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

ALTER TABLE feedback
  ADD COLUMN kind ENUM('feedback','problem') NOT NULL DEFAULT 'feedback' AFTER user_id;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO department (name, university_id)
SELECT 'Computer and Communications Engineering', u.university_id
FROM university u
WHERE u.name = 'Lebanese International University'
  AND NOT EXISTS (
    SELECT 1
    FROM department d
    WHERE d.university_id = u.university_id
      AND d.name = 'Computer and Communications Engineering'
  );

UPDATE department d
JOIN university u ON u.university_id = d.university_id
SET d.is_active = 1
WHERE u.name = 'Lebanese International University'
  AND d.name = 'Computer and Communications Engineering';

INSERT INTO major (department_id, name)
SELECT d.department_id, 'Computer Engineering'
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE u.name = 'Lebanese International University'
  AND d.name = 'Computer and Communications Engineering'
ON DUPLICATE KEY UPDATE major_id = major_id;

INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT
  course_data.code,
  course_data.title,
  course_data.description,
  course_data.credits,
  course_data.language,
  course_data.level,
  d.department_id
FROM (
  SELECT 'CSCI250' AS code, 'Introduction to Programming' AS title, 'Introduces structured Java programming, including syntax, program structure, simple data types, control structures, methods, arrays, and strings.' AS description, 3 AS credits, 'English' AS language, 'undergraduate' AS level
  UNION ALL SELECT 'CSCI250L', 'Introduction to Programming Lab', 'A co-requisite lab for CSCI250 where students practice programming fundamentals through exercises using data types, selection, repetition, methods, and arrays.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'CSCI300', 'Intermediate Programming with Objects', 'Emphasizes object-oriented programming in Java, including classes, objects, constructors, methods, dependency, aggregation, inheritance, polymorphism, exceptions, and file I/O.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'ENGG200', 'Introduction to Engineering', 'Introduces engineering work, fundamental principles, structured design, team prototyping, and technical presentation skills.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'ENGG300', 'Engineering Economics', 'Covers engineering economic decision-making, the impact of money on analysis, and environmental and social factors in practical engineering choices.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'MATH210', 'Calculus II', 'Continues calculus with logarithmic, exponential, and trigonometric functions, integration techniques, improper integrals, sequences, series, and polar coordinates.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'MATH220', 'Calculus III', 'Covers multivariable and vector calculus, including quadric surfaces, partial differentiation, multiple integration, and vector fields.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'MATH225', 'Linear Algebra with Applications', 'Introduces vectors, systems of equations, matrices, determinants, vector spaces, transformations, eigenvalues, diagonalization, and orthogonality.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'MATH270', 'Ordinary Differential Equations', 'Introduces ordinary differential equations and applications, including first and higher order equations, systems, series solutions, and Laplace transforms.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'MATH310', 'Probability & Statistics for Scientists & Engineers', 'Develops probabilistic and statistical concepts with computational and analytic skills for scientific, engineering, and real-world applications.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'PHYS220', 'Physics for Engineers', 'Provides calculus-based physics for engineering students, including oscillations, mechanical waves, interference, reflection, refraction, and image formation.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG250', 'Digital Logic I', 'Introduces digital logic operations and design, including Boolean algebra, logic functions, minimization, number systems, arithmetic, and combinational circuits.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG325', 'Software Applications and Design', 'Introduces object-oriented application design and development, including implementation, debugging, testing, graphical interfaces, executable creation, UML, and socket programming basics.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG335', 'Digital Logic II', 'Extends digital logic into sequential circuits, including latches, flip-flops, state tables, state equations, Moore and Mealy machines, and hardware description languages.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG352L', 'Digital Logic Circuits Lab', 'Provides experiments in designing, simulating, and testing combinational and sequential digital circuits, including decoders, multiplexers, arithmetic circuits, and flip-flops.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG375', 'Introduction to Database Systems', 'Introduces database design and programming, including ER modeling, the relational model, SQL, Java database connectivity, normalization, transactions, and triggers.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG380', 'Microprocessors and Microcontrollers', 'Introduces microcontroller design and applications using AVR architecture, assembly and C programming, timers, interrupts, parallel I/O, and interfacing.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG400', 'Computer Organization and Design', 'Covers computer organization and digital design, including arithmetic, MIPS processor design, ALU, datapath and control, pipelining, hazards, interrupts, caches, and virtual memory.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG400L', 'Microcontroller Applications Lab', 'Covers Arduino microcontroller programming and hardware applications, including serial and parallel interfacing, C programming, Proteus simulation, and Atmel tools.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG415', 'Communication Networks', 'Introduces computer communication networks, protocols and applications, architectures, reliable transfer, transport, congestion and flow control, routing, data link protocols, addressing, and LANs.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG420', 'Web Programming and Technologies', 'Focuses on web application development with HTML, CSS, JavaScript, DOM, JQuery, PHP, AJAX, database connectivity, sessions, HTTP headers, security, and privacy.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG430L', 'Linux Lab', 'Teaches Linux and Python scripting for Raspberry Pi, with emphasis on automation, interfacing, and networking tasks.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG435', 'Mobile Application Development', 'Develops advanced Android applications, including environment setup, user interfaces, persistence, geolocation, media handling, networking, services, deployment, and mobile business trends.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG450L', 'Scripting Languages Lab', 'Introduces scientific and engineering scripting languages for modeling, simulation, analysis, and algorithmic problem solving.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG455L', 'Communication Networks Lab', 'Provides practical Internet networking experience using packet simulation and real LAN concepts, including switches, routers, IPv4/IPv6, WAN configuration, and client/server applications.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG495', 'Senior Project', 'A capstone project integrating topics from the curriculum through research, experimentation, implementation, technical writing, demonstration, and presentation.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG250', 'Electric Circuits I', 'Introduces electrical and electronics engineering circuit principles, including voltage, current, power, passive elements, Kirchhoff laws, node and mesh analysis, equivalent circuits, op-amps, and first-order responses.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG300', 'Electric Circuits II', 'Introduces AC circuit analysis with ideal and dependent sources, sinusoidal steady-state power, balanced three-phase circuits, and frequency selective circuits.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG301L', 'Electric Circuits Lab', 'Reinforces DC and AC circuit concepts through experiments using resistors, capacitors, inductors, transformers, op-amps, lab instruments, LTspice, filters, and op-amp applications.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG350', 'Electronic Circuits I', 'Covers semiconductors, P-N junctions, diode models and applications, BJT structure and biasing, small-signal BJT amplifiers, MOSFET structure, biasing, and amplifiers.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG350L', 'Electronic Circuits I Lab', 'Provides experiments for designing, building, and testing diode, BJT, and MOSFET circuits and amplifier configurations.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG385', 'Signals and Systems', 'Introduces signals and systems, time and frequency domain analysis, LTI systems, Fourier series, Fourier transform, and Laplace transform applications.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG447', 'Analog Communication Systems', 'Covers analog communication principles, linear systems, modulation, spectral density, random signals, noise models, demodulation, and noise effects.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG467L', 'Analog Communication Systems Lab', 'Uses LabVIEW and radio hardware to design, simulate, and test analog communication systems and modulation schemes in time and frequency domains.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'ARAB200', 'Arabic Language and Literature', 'Develops Arabic language and literature skills for non-specialists through grammar, morphology, rhetoric, literary analysis, expression, and communication techniques.', 3, 'Arabic', 'undergraduate'
  UNION ALL SELECT 'CULT200', 'Introduction to Arab - Islamic Civilization', 'Introduces Arab-Islamic civilization, its historical, scientific, cultural, and intellectual achievements, and its relevance to civilizational awareness.', 3, 'Arabic', 'undergraduate'
  UNION ALL SELECT 'ENGG450', 'Engineering Ethics and Professional Practice', 'Studies ethical theories and professional engineering responsibilities, including safety, risk, liability, employee rights, codes of ethics, legal duties, environmental responsibility, and case analysis.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'ENGL201', 'Composition and Research Skills', 'Builds critical thinking and academic writing through reading, text response, research, analysis, and production of a research paper.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'ENGL251', 'Communication Skills', 'Develops workplace and technical communication, editing, and professional writing through analysis and practice with workplace writing models.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'GE*****', 'General Education Elective', 'A student-selected general education elective used to complete the LIU Computer Engineering curriculum requirements.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG460', 'Operating Systems', 'Introduces operating systems at user, application, design, and implementation levels, including structure, process management, scheduling, threads, IPC, deadlocks, synchronization, protection, memory management, and hands-on programming.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG470', 'Data Structures and Analysis of Algorithms', 'Introduces stacks, queues, lists, trees, graphs, abstraction, sorting, searching, selection, worst and average case analysis, recurrences, asymptotic analysis, divide-and-conquer, and greedy algorithms.', 3, 'English', 'undergraduate'
) AS course_data
JOIN department d ON d.name = 'Computer and Communications Engineering'
JOIN university u ON u.university_id = d.university_id
WHERE u.name = 'Lebanese International University'
ON DUPLICATE KEY UPDATE
  course_id = course_id;

INSERT INTO roadmap (
  major_id,
  level,
  title,
  total_credits,
  is_published,
  created_by
)
SELECT
  m.major_id,
  'undergraduate',
  'Computer Engineering Undergraduate Roadmap',
  108,
  1,
  NULL
FROM major m
JOIN department d ON d.department_id = m.department_id
JOIN university u ON u.university_id = d.university_id
WHERE u.name = 'Lebanese International University'
  AND d.name = 'Computer and Communications Engineering'
  AND m.name = 'Computer Engineering'
ON DUPLICATE KEY UPDATE
  roadmap_id = roadmap_id;

INSERT IGNORE INTO roadmap_course (
  roadmap_id,
  course_id,
  year_number,
  semester,
  sequence_order
)
SELECT
  r.roadmap_id,
  c.course_id,
  roadmap_data.year_number,
  roadmap_data.semester,
  roadmap_data.sequence_order
FROM (
  SELECT 'CSCI250' AS code, 1 AS year_number, 'fall' AS semester, 1 AS sequence_order
  UNION ALL SELECT 'CSCI250L', 1, 'fall', 2
  UNION ALL SELECT 'ENGG200', 1, 'fall', 3
  UNION ALL SELECT 'MATH210', 1, 'fall', 4
  UNION ALL SELECT 'PHYS220', 1, 'fall', 5
  UNION ALL SELECT 'ENGL201', 1, 'fall', 6
  UNION ALL SELECT 'CSCI300', 1, 'spring', 1
  UNION ALL SELECT 'CENG250', 1, 'spring', 2
  UNION ALL SELECT 'EENG250', 1, 'spring', 3
  UNION ALL SELECT 'MATH220', 1, 'spring', 4
  UNION ALL SELECT 'MATH225', 1, 'spring', 5
  UNION ALL SELECT 'ENGL251', 1, 'spring', 6
  UNION ALL SELECT 'ARAB200', 1, 'summer', 1
  UNION ALL SELECT 'CULT200', 1, 'summer', 2
  UNION ALL SELECT 'GE*****', 1, 'summer', 3
  UNION ALL SELECT 'CENG325', 2, 'fall', 1
  UNION ALL SELECT 'CENG335', 2, 'fall', 2
  UNION ALL SELECT 'CENG352L', 2, 'fall', 3
  UNION ALL SELECT 'EENG300', 2, 'fall', 4
  UNION ALL SELECT 'EENG301L', 2, 'fall', 5
  UNION ALL SELECT 'MATH270', 2, 'fall', 6
  UNION ALL SELECT 'MATH310', 2, 'fall', 7
  UNION ALL SELECT 'CENG375', 2, 'spring', 1
  UNION ALL SELECT 'CENG380', 2, 'spring', 2
  UNION ALL SELECT 'EENG350', 2, 'spring', 3
  UNION ALL SELECT 'EENG350L', 2, 'spring', 4
  UNION ALL SELECT 'EENG385', 2, 'spring', 5
  UNION ALL SELECT 'ENGG300', 2, 'spring', 6
  UNION ALL SELECT 'CENG400L', 2, 'summer', 1
  UNION ALL SELECT 'CENG430L', 2, 'summer', 2
  UNION ALL SELECT 'CENG470', 2, 'summer', 3
  UNION ALL SELECT 'CENG400', 3, 'fall', 1
  UNION ALL SELECT 'CENG415', 3, 'fall', 2
  UNION ALL SELECT 'CENG420', 3, 'fall', 3
  UNION ALL SELECT 'CENG450L', 3, 'fall', 4
  UNION ALL SELECT 'EENG447', 3, 'fall', 5
  UNION ALL SELECT 'EENG467L', 3, 'fall', 6
  UNION ALL SELECT 'CENG435', 3, 'spring', 1
  UNION ALL SELECT 'CENG455L', 3, 'spring', 2
  UNION ALL SELECT 'CENG460', 3, 'spring', 3
  UNION ALL SELECT 'ENGG450', 3, 'spring', 4
  UNION ALL SELECT 'CENG495', 3, 'summer', 1
) AS roadmap_data
JOIN course c ON c.code = roadmap_data.code
JOIN department course_department
  ON course_department.department_id = c.department_id
JOIN university course_university
  ON course_university.university_id = course_department.university_id
JOIN major m ON m.name = 'Computer Engineering'
JOIN department major_department
  ON major_department.department_id = m.department_id
JOIN university major_university
  ON major_university.university_id = major_department.university_id
JOIN roadmap r
  ON r.major_id = m.major_id
  AND r.level = 'undergraduate'
WHERE course_university.name = 'Lebanese International University'
  AND course_department.name = 'Computer and Communications Engineering'
  AND major_university.name = 'Lebanese International University'
  AND major_department.name = 'Computer and Communications Engineering'
  AND c.deleted_at IS NULL
ORDER BY
  roadmap_data.year_number,
  FIELD(roadmap_data.semester, 'fall', 'spring', 'summer'),
  roadmap_data.sequence_order;

/* Generated majors and starter roadmaps for the seeded course catalog. */
DROP TEMPORARY TABLE IF EXISTS tmp_catalog_major_seed;

/* Realistic departments, majors, courses, and starter roadmaps for every active university. */
-- BEGIN CATALOG EXPANSION
DROP TEMPORARY TABLE IF EXISTS tmp_full_catalog_department_seed;
CREATE TEMPORARY TABLE tmp_full_catalog_department_seed (
  university_name VARCHAR(255) NOT NULL,
  department_name VARCHAR(255) NOT NULL,
  department_kind VARCHAR(50) NOT NULL,
  PRIMARY KEY (university_name, department_name)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_full_catalog_department_seed (
  university_name,
  department_name,
  department_kind
) VALUES
  ('Beirut Arab University', 'Mathematics and Computer Science', 'computing'),
  ('Beirut Arab University', 'Engineering', 'engineering'),
  ('Beirut Arab University', 'Business Administration', 'business'),
  ('American University of Beirut', 'Computer Science', 'computing'),
  ('American University of Beirut', 'Engineering', 'engineering'),
  ('American University of Beirut', 'Business', 'business'),
  ('Lebanese American University', 'Computer Science and Mathematics', 'computing'),
  ('Lebanese American University', 'Engineering', 'engineering'),
  ('Lebanese American University', 'Business', 'business'),
  ('Lebanese International University', 'Computer Science and Information Technology', 'computing'),
  ('Lebanese International University', 'Engineering', 'engineering'),
  ('Lebanese International University', 'Business', 'business'),
  ('Université Saint-Joseph de Beyrouth', 'Informatique', 'computing'),
  ('Université Saint-Joseph de Beyrouth', 'Engineering', 'engineering'),
  ('Université Saint-Joseph de Beyrouth', 'Business and Management', 'business'),
  ('University of Balamand', 'Computer Science', 'computing'),
  ('University of Balamand', 'Engineering', 'engineering'),
  ('University of Balamand', 'Business and Management', 'business');

INSERT INTO tmp_full_catalog_department_seed (
  university_name,
  department_name,
  department_kind
)
SELECT u.name, 'Computer Science', 'computing'
FROM university u
WHERE u.is_active = 1
  AND NOT EXISTS (
    SELECT 1
    FROM tmp_full_catalog_department_seed seed
    WHERE seed.university_name = u.name
      AND seed.department_kind = 'computing'
  );

INSERT INTO tmp_full_catalog_department_seed (
  university_name,
  department_name,
  department_kind
)
SELECT u.name, 'Engineering', 'engineering'
FROM university u
WHERE u.is_active = 1
  AND NOT EXISTS (
    SELECT 1
    FROM tmp_full_catalog_department_seed seed
    WHERE seed.university_name = u.name
      AND seed.department_kind = 'engineering'
  );

INSERT INTO tmp_full_catalog_department_seed (
  university_name,
  department_name,
  department_kind
)
SELECT u.name, 'Business', 'business'
FROM university u
WHERE u.is_active = 1
  AND NOT EXISTS (
    SELECT 1
    FROM tmp_full_catalog_department_seed seed
    WHERE seed.university_name = u.name
      AND seed.department_kind = 'business'
  );

INSERT INTO department (name, university_id)
SELECT
  seed.department_name,
  u.university_id
FROM tmp_full_catalog_department_seed seed
JOIN university u
  ON u.name = seed.university_name
  AND u.is_active = 1
WHERE NOT EXISTS (
  SELECT 1
  FROM department existing_department
  WHERE existing_department.university_id = u.university_id
    AND LOWER(existing_department.name) = LOWER(seed.department_name)
);

DROP TEMPORARY TABLE IF EXISTS tmp_full_catalog_major_template;
CREATE TEMPORARY TABLE tmp_full_catalog_major_template (
  department_kind VARCHAR(50) NOT NULL,
  major_name VARCHAR(255) NOT NULL,
  roadmap_title VARCHAR(255) NOT NULL,
  PRIMARY KEY (department_kind, major_name)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_full_catalog_major_template (
  department_kind,
  major_name,
  roadmap_title
) VALUES
  ('computing', 'Computer Science', 'Computer Science Undergraduate Roadmap'),
  ('computing', 'Data Science', 'Data Science Undergraduate Roadmap'),
  ('engineering', 'Computer Engineering', 'Computer Engineering Undergraduate Roadmap'),
  ('engineering', 'Civil Engineering', 'Civil Engineering Undergraduate Roadmap'),
  ('business', 'Business Administration', 'Business Administration Undergraduate Roadmap'),
  ('business', 'Finance', 'Finance Undergraduate Roadmap');

INSERT INTO major (department_id, name)
SELECT
  d.department_id,
  major_template.major_name
FROM tmp_full_catalog_department_seed seed
JOIN university u
  ON u.name = seed.university_name
  AND u.is_active = 1
JOIN department d
  ON d.university_id = u.university_id
  AND LOWER(d.name) = LOWER(seed.department_name)
  AND d.is_active = 1
JOIN tmp_full_catalog_major_template major_template
  ON major_template.department_kind = seed.department_kind
WHERE NOT EXISTS (
  SELECT 1
  FROM major existing_major
  WHERE existing_major.department_id = d.department_id
    AND LOWER(existing_major.name) = LOWER(major_template.major_name)
);

DROP TEMPORARY TABLE IF EXISTS tmp_full_catalog_course_template;
CREATE TEMPORARY TABLE tmp_full_catalog_course_template (
  department_kind VARCHAR(50) NOT NULL,
  major_name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  credits TINYINT UNSIGNED NOT NULL,
  language VARCHAR(20) NOT NULL,
  level VARCHAR(32) NOT NULL,
  year_number TINYINT UNSIGNED NOT NULL,
  semester VARCHAR(20) NOT NULL,
  sequence_order SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (department_kind, major_name, code)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_full_catalog_course_template (
  department_kind,
  major_name,
  code,
  title,
  description,
  credits,
  language,
  level,
  year_number,
  semester,
  sequence_order
) VALUES
  ('computing', 'Computer Science', 'CS 101', 'Introduction to Programming', 'Introduces problem solving, program structure, variables, control flow, functions, arrays, and debugging through practical programming exercises.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('computing', 'Computer Science', 'CS 201', 'Data Structures', 'Covers lists, stacks, queues, trees, hashing, recursion, sorting, searching, and algorithmic analysis for software development.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('computing', 'Computer Science', 'CS 301', 'Database Systems', 'Introduces relational modeling, SQL, normalization, transactions, indexing, and application-level database design.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('computing', 'Computer Science', 'CS 320', 'Software Engineering', 'Covers requirements, design, implementation, testing, version control, teamwork, and maintainable software project delivery.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('computing', 'Data Science', 'DS 201', 'Data Analytics', 'Introduces data collection, cleaning, descriptive analytics, visualization, and reproducible analysis with practical data sets.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('computing', 'Data Science', 'DS 220', 'Probability for Data Science', 'Covers probability models, random variables, distributions, sampling, estimation, and uncertainty for data-driven decisions.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('computing', 'Data Science', 'DS 310', 'Machine Learning', 'Introduces supervised and unsupervised learning, model evaluation, regression, classification, clustering, and applied machine-learning workflows.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('computing', 'Data Science', 'DS 330', 'Data Visualization', 'Covers visual encoding, dashboard design, exploratory graphics, storytelling with data, and interactive visualization tools.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('engineering', 'Computer Engineering', 'ENGR 101', 'Introduction to Engineering', 'Introduces engineering disciplines, design thinking, technical communication, ethics, teamwork, and project-based problem solving.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('engineering', 'Computer Engineering', 'ENGR 210', 'Engineering Mathematics', 'Builds mathematical foundations for engineering, including calculus applications, vectors, matrices, and differential equations.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('engineering', 'Computer Engineering', 'CENG 220', 'Digital Logic', 'Covers number systems, Boolean algebra, logic gates, combinational circuits, flip-flops, registers, and sequential logic design.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('engineering', 'Computer Engineering', 'CENG 320', 'Computer Organization', 'Studies processor datapaths, instruction sets, memory hierarchy, assembly basics, input/output, and hardware/software interaction.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('engineering', 'Civil Engineering', 'CIVE 201', 'Engineering Mechanics', 'Introduces statics, force systems, equilibrium, trusses, frames, friction, centroids, and moments of inertia.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('engineering', 'Civil Engineering', 'CIVE 220', 'Surveying', 'Covers measurement, leveling, traversing, mapping, coordinate systems, site data, and field surveying practice.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('engineering', 'Civil Engineering', 'CIVE 310', 'Structural Analysis', 'Develops analysis of beams, frames, trusses, influence lines, deflection, and structural behavior under loads.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('engineering', 'Civil Engineering', 'CIVE 330', 'Construction Materials', 'Studies concrete, steel, asphalt, timber, aggregates, testing methods, specifications, and material selection in construction.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('business', 'Business Administration', 'BUS 101', 'Principles of Management', 'Introduces planning, organizing, leadership, control, decision making, organizational structure, and management in contemporary workplaces.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('business', 'Business Administration', 'BUS 220', 'Organizational Behavior', 'Explores motivation, teams, communication, leadership, culture, decision making, and individual behavior in organizations.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('business', 'Business Administration', 'MKT 201', 'Principles of Marketing', 'Covers consumer behavior, segmentation, branding, product strategy, pricing, channels, promotion, and marketing planning.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('business', 'Business Administration', 'OPMT 301', 'Operations Management', 'Introduces process design, capacity, quality, forecasting, inventory, supply chains, and operational performance improvement.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('business', 'Finance', 'FIN 201', 'Financial Management', 'Introduces time value of money, financial statements, risk and return, budgeting, capital structure, and financial decisions.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('business', 'Finance', 'ACCT 201', 'Financial Accounting', 'Covers accounting cycles, statements, assets, liabilities, equity, revenue recognition, and financial reporting fundamentals.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('business', 'Finance', 'ECON 201', 'Microeconomics', 'Studies markets, supply and demand, elasticity, consumer choice, production, market structures, and public policy applications.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('business', 'Finance', 'FIN 320', 'Investments', 'Covers securities, portfolio risk, diversification, valuation, market efficiency, bonds, equities, and investment strategy.', 3, 'English', 'undergraduate', 2, 'spring', 1);

INSERT INTO course (
  code,
  title,
  description,
  credits,
  language,
  level,
  department_id
)
SELECT DISTINCT
  course_template.code,
  course_template.title,
  course_template.description,
  course_template.credits,
  course_template.language,
  course_template.level,
  d.department_id
FROM tmp_full_catalog_department_seed seed
JOIN university u
  ON u.name = seed.university_name
  AND u.is_active = 1
JOIN department d
  ON d.university_id = u.university_id
  AND LOWER(d.name) = LOWER(seed.department_name)
  AND d.is_active = 1
JOIN tmp_full_catalog_course_template course_template
  ON course_template.department_kind = seed.department_kind
WHERE NOT EXISTS (
  SELECT 1
  FROM course existing_course
  WHERE existing_course.department_id = d.department_id
    AND LOWER(existing_course.code) = LOWER(course_template.code)
);

INSERT INTO roadmap (
  major_id,
  level,
  title,
  total_credits,
  is_published,
  created_by
)
SELECT
  m.major_id,
  'undergraduate',
  major_template.roadmap_title,
  SUM(course_template.credits),
  1,
  NULL
FROM tmp_full_catalog_department_seed seed
JOIN university u
  ON u.name = seed.university_name
  AND u.is_active = 1
JOIN department d
  ON d.university_id = u.university_id
  AND LOWER(d.name) = LOWER(seed.department_name)
  AND d.is_active = 1
JOIN tmp_full_catalog_major_template major_template
  ON major_template.department_kind = seed.department_kind
JOIN major m
  ON m.department_id = d.department_id
  AND LOWER(m.name) = LOWER(major_template.major_name)
  AND m.is_active = 1
JOIN tmp_full_catalog_course_template course_template
  ON course_template.department_kind = seed.department_kind
  AND course_template.major_name = major_template.major_name
WHERE NOT EXISTS (
  SELECT 1
  FROM roadmap existing_roadmap
  WHERE existing_roadmap.major_id = m.major_id
    AND existing_roadmap.level = 'undergraduate'
)
GROUP BY
  m.major_id,
  major_template.roadmap_title;

INSERT IGNORE INTO roadmap_course (
  roadmap_id,
  course_id,
  year_number,
  semester,
  sequence_order
)
SELECT
  r.roadmap_id,
  c.course_id,
  course_template.year_number,
  course_template.semester,
  course_template.sequence_order
FROM tmp_full_catalog_department_seed seed
JOIN university u
  ON u.name = seed.university_name
  AND u.is_active = 1
JOIN department d
  ON d.university_id = u.university_id
  AND LOWER(d.name) = LOWER(seed.department_name)
  AND d.is_active = 1
JOIN tmp_full_catalog_major_template major_template
  ON major_template.department_kind = seed.department_kind
JOIN major m
  ON m.department_id = d.department_id
  AND LOWER(m.name) = LOWER(major_template.major_name)
  AND m.is_active = 1
JOIN roadmap r
  ON r.major_id = m.major_id
  AND r.level = 'undergraduate'
  AND r.created_by IS NULL
  AND r.title = major_template.roadmap_title
JOIN tmp_full_catalog_course_template course_template
  ON course_template.department_kind = seed.department_kind
  AND course_template.major_name = major_template.major_name
JOIN course c
  ON c.department_id = d.department_id
  AND LOWER(c.code) = LOWER(course_template.code)
  AND c.deleted_at IS NULL;

DROP TEMPORARY TABLE IF EXISTS tmp_full_catalog_course_template;
DROP TEMPORARY TABLE IF EXISTS tmp_full_catalog_major_template;
DROP TEMPORARY TABLE IF EXISTS tmp_full_catalog_department_seed;
-- END CATALOG EXPANSION
CREATE TEMPORARY TABLE tmp_catalog_major_seed (
  university_name VARCHAR(255) NOT NULL,
  department_name VARCHAR(255) NOT NULL,
  major_name VARCHAR(255) NOT NULL,
  roadmap_title VARCHAR(255) NOT NULL,
  PRIMARY KEY (university_name, department_name, major_name)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_catalog_major_seed (
  university_name,
  department_name,
  major_name,
  roadmap_title
) VALUES
  ('Beirut Arab University', 'Mathematics and Computer Science', 'Computer Science', 'Computer Science Undergraduate Roadmap'),
  ('American University of Beirut', 'Computer Science', 'Computer Science', 'Computer Science Undergraduate Roadmap'),
  ('Lebanese American University', 'Computer Science and Mathematics', 'Computer Science', 'Computer Science Undergraduate Roadmap'),
  ('Lebanese International University', 'Computer Science and Information Technology', 'Computer Science', 'Computer Science Undergraduate Roadmap'),
  ('Université Saint-Joseph de Beyrouth', 'Informatique', 'Informatique', 'Informatique Undergraduate Roadmap'),
  ('University of Balamand', 'Computer Science', 'Computer Science', 'Computer Science Undergraduate Roadmap');

INSERT INTO major (department_id, name)
SELECT
  d.department_id,
  seed.major_name
FROM tmp_catalog_major_seed seed
JOIN university u ON u.name = seed.university_name
JOIN department d
  ON d.university_id = u.university_id
  AND d.name = seed.department_name
ON DUPLICATE KEY UPDATE major_id = major_id;

INSERT INTO roadmap (
  major_id,
  level,
  title,
  total_credits,
  is_published,
  created_by
)
SELECT
  m.major_id,
  'undergraduate',
  seed.roadmap_title,
  COALESCE(SUM(c.credits), 0),
  1,
  NULL
FROM tmp_catalog_major_seed seed
JOIN university u ON u.name = seed.university_name
JOIN department d
  ON d.university_id = u.university_id
  AND d.name = seed.department_name
JOIN major m
  ON m.department_id = d.department_id
  AND m.name = seed.major_name
JOIN course c
  ON c.department_id = d.department_id
  AND c.deleted_at IS NULL
GROUP BY
  m.major_id,
  seed.roadmap_title
HAVING COUNT(c.course_id) > 0
ON DUPLICATE KEY UPDATE
  roadmap_id = roadmap_id;

SET @catalog_key := '';
SET @catalog_rank := 0;

INSERT IGNORE INTO roadmap_course (
  roadmap_id,
  course_id,
  year_number,
  semester,
  sequence_order
)
SELECT
  r.roadmap_id,
  numbered.course_id,
  FLOOR((numbered.rank_number - 1) / 10) + 1 AS year_number,
  CASE
    WHEN MOD(FLOOR((numbered.rank_number - 1) / 5), 2) = 0 THEN 'fall'
    ELSE 'spring'
  END AS semester,
  MOD(numbered.rank_number - 1, 5) + 1 AS sequence_order
FROM (
  SELECT
    ranked.course_id,
    ranked.major_id,
    ranked.rank_number
  FROM (
    SELECT
      ordered.course_id,
      ordered.major_id,
      @catalog_rank := IF(@catalog_key = ordered.catalog_key, @catalog_rank + 1, 1) AS rank_number,
      @catalog_key := ordered.catalog_key AS assigned_catalog_key
    FROM (
      SELECT
        c.course_id,
        m.major_id,
        CONCAT(u.university_id, ':', d.department_id, ':', m.major_id) AS catalog_key,
        u.name AS university_name,
        d.name AS department_name,
        m.name AS major_name,
        c.level,
        c.code
      FROM tmp_catalog_major_seed seed
      JOIN university u ON u.name = seed.university_name
      JOIN department d
        ON d.university_id = u.university_id
        AND d.name = seed.department_name
      JOIN major m
        ON m.department_id = d.department_id
        AND m.name = seed.major_name
      JOIN course c
        ON c.department_id = d.department_id
        AND c.deleted_at IS NULL
      ORDER BY
        u.name ASC,
        d.name ASC,
        m.name ASC,
        FIELD(c.level, 'freshman', 'undergraduate', 'graduate', 'master_degree', 'doctoral') ASC,
        c.code ASC,
        c.course_id ASC
    ) ordered
  ) ranked
) numbered
JOIN roadmap r
  ON r.major_id = numbered.major_id
  AND r.level = 'undergraduate';

DROP TEMPORARY TABLE IF EXISTS tmp_catalog_major_seed;
