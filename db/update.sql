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
ON DUPLICATE KEY UPDATE is_active = 1;

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
  title = VALUES(title),
  description = VALUES(description),
  credits = VALUES(credits),
  language = VALUES(language),
  level = VALUES(level),
  deleted_at = NULL;

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
  title = VALUES(title),
  total_credits = VALUES(total_credits),
  is_published = 1;

DELETE rc
FROM roadmap_course rc
JOIN roadmap r ON r.roadmap_id = rc.roadmap_id
JOIN major m ON m.major_id = r.major_id
JOIN department d ON d.department_id = m.department_id
JOIN university u ON u.university_id = d.university_id
WHERE u.name = 'Lebanese International University'
  AND d.name = 'Computer and Communications Engineering'
  AND m.name = 'Computer Engineering'
  AND r.level = 'undergraduate';

INSERT INTO roadmap_course (
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
