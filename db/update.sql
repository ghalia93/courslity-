-- Applies incremental schema and seed updates for existing course databases.
USE course_checker;

ALTER TABLE `user`
  MODIFY role ENUM('student','admin','super_admin') NOT NULL DEFAULT 'student';

UPDATE `user`
SET role = 'admin'
WHERE role = '';

ALTER TABLE university ADD COLUMN email_domain VARCHAR(100) NOT NULL DEFAULT '';

ALTER TABLE university
  ADD COLUMN IF NOT EXISTS description TEXT NULL DEFAULT NULL AFTER email_domain;

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

ALTER TABLE feedback
  ADD COLUMN hidden_at TIMESTAMP NULL DEFAULT NULL AFTER created_at;

ALTER TABLE review
  ADD COLUMN hidden_at TIMESTAMP NULL DEFAULT NULL AFTER deleted_at;

CREATE TABLE IF NOT EXISTS university_review (
  university_review_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  university_id INT UNSIGNED NOT NULL,
  overall_rating DECIMAL(3,2) NOT NULL CHECK (overall_rating BETWEEN 0 AND 5),
  academic_quality_rating DECIMAL(3,2) NOT NULL CHECK (academic_quality_rating BETWEEN 1 AND 5),
  professors_rating DECIMAL(3,2) NOT NULL CHECK (professors_rating BETWEEN 1 AND 5),
  facilities_rating DECIMAL(3,2) NOT NULL CHECK (facilities_rating BETWEEN 1 AND 5),
  tuition_value_rating DECIMAL(3,2) NOT NULL CHECK (tuition_value_rating BETWEEN 1 AND 5),
  student_life_rating DECIMAL(3,2) NOT NULL CHECK (student_life_rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  hidden_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (university_review_id),
  UNIQUE KEY uniq_university_review_user_university (user_id, university_id),
  KEY idx_university_review_university (university_id, created_at),
  CONSTRAINT fk_university_review_user
    FOREIGN KEY (user_id) REFERENCES `user`(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_university_review_university
    FOREIGN KEY (university_id) REFERENCES university(university_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS university_review_vote (
  university_review_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  vote_value TINYINT NOT NULL CHECK (vote_value IN (-1, 1)),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (university_review_id, user_id),
  KEY idx_university_review_vote_user (user_id),
  CONSTRAINT fk_university_review_vote_review
    FOREIGN KEY (university_review_id)
    REFERENCES university_review(university_review_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_university_review_vote_user
    FOREIGN KEY (user_id) REFERENCES `user`(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification (
  notification_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(255) NULL DEFAULT NULL,
  read_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id),
  KEY idx_notification_user_read (user_id, read_at, created_at),
  CONSTRAINT fk_notification_user
    FOREIGN KEY (user_id) REFERENCES `user`(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS support_thread (
  thread_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NULL,
  visitor_key VARCHAR(64) NULL,
  visitor_name VARCHAR(120) NULL,
  status ENUM('open','closed') NOT NULL DEFAULT 'open',
  last_message_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  admin_last_opened_at TIMESTAMP NULL DEFAULT NULL,
  participant_last_opened_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (thread_id),
  UNIQUE KEY uniq_support_thread_user (user_id),
  UNIQUE KEY uniq_support_thread_visitor (visitor_key),
  KEY idx_support_thread_last_message (last_message_at),
  CONSTRAINT fk_support_thread_user
    FOREIGN KEY (user_id) REFERENCES `user`(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE support_thread
  ADD COLUMN IF NOT EXISTS admin_last_opened_at TIMESTAMP NULL DEFAULT NULL AFTER last_message_at;

ALTER TABLE support_thread
  ADD COLUMN IF NOT EXISTS participant_last_opened_at TIMESTAMP NULL DEFAULT NULL AFTER admin_last_opened_at;

CREATE TABLE IF NOT EXISTS support_message (
  message_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  thread_id INT UNSIGNED NOT NULL,
  sender_id INT UNSIGNED NULL,
  sender_role ENUM('student','visitor','admin') NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (message_id),
  KEY idx_support_message_thread (thread_id, created_at),
  KEY idx_support_message_sender (sender_id),
  CONSTRAINT fk_support_message_thread
    FOREIGN KEY (thread_id) REFERENCES support_thread(thread_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_support_message_sender
    FOREIGN KEY (sender_id) REFERENCES `user`(user_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

ALTER TABLE course
  ADD COLUMN IF NOT EXISTS video_url VARCHAR(2048) NULL DEFAULT NULL AFTER description,
  ADD COLUMN IF NOT EXISTS video_title VARCHAR(255) NULL DEFAULT NULL AFTER video_url;

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
  title = VALUES(title),
  description = VALUES(description),
  credits = VALUES(credits),
  language = VALUES(language),
  level = VALUES(level);

UPDATE course c
JOIN department d ON d.department_id = c.department_id
JOIN university u ON u.university_id = d.university_id
JOIN (
  SELECT 'CULT200' AS code, 'This course introduces students to the history, culture, philosophy, and scientific achievements of Arab-Islamic civilization. It explores the development of Islamic societies and their contributions to science, literature, mathematics, and architecture, while also discussing the civilization impact on the modern world.' AS description
  UNION ALL SELECT 'MATH225', 'Students learn the fundamentals of linear algebra including matrices, determinants, vectors, eigenvalues, and systems of linear equations. The course emphasizes engineering applications such as computer graphics, circuit analysis, data processing, and machine learning foundations.'
  UNION ALL SELECT 'ENGL201', 'This course develops academic writing and research abilities. Students practice essay writing, technical reports, research documentation, referencing styles, and critical reading. It also strengthens grammar, vocabulary, and communication skills needed in university-level engineering studies.'
  UNION ALL SELECT 'ENGG200', 'An introductory engineering course covering engineering disciplines, problem-solving methods, ethics, teamwork, and project-based thinking. Students are exposed to the engineering design process and gain a basic understanding of how engineering solutions are developed in real-world industries.'
  UNION ALL SELECT 'PHYS220', 'Covers fundamental physics concepts important for engineering students including mechanics, energy, motion, electricity, magnetism, and waves. The course focuses on applying physical laws to engineering systems and practical problem-solving.'
  UNION ALL SELECT 'MATH210', 'A continuation of Calculus I focusing on integration techniques, applications of integration, sequences, infinite series, and differential equations. Engineering applications are emphasized throughout the course.'
  UNION ALL SELECT 'CSCI250L', 'A practical laboratory course accompanying introductory programming. Students implement programming concepts through coding exercises, debugging, problem-solving, and software development tasks.'
  UNION ALL SELECT 'MATH270', 'Introduces methods for solving ordinary differential equations and modeling engineering systems. Topics include first-order and higher-order differential equations, Laplace transforms, and applications in electrical and mechanical systems.'
  UNION ALL SELECT 'CSCI250', 'Introduces programming fundamentals using a high-level programming language. Students learn variables, loops, conditions, functions, arrays, algorithms, and problem-solving techniques used in software development.'
  UNION ALL SELECT 'EENG250', 'Covers the fundamentals of electrical circuits including Ohm''s Law, Kirchhoff''s laws, voltage and current analysis, resistive circuits, and circuit theorems. Students analyze and solve basic electrical engineering problems.'
  UNION ALL SELECT 'CENG250', 'Introduces digital systems and binary logic. Topics include Boolean algebra, logic gates, combinational circuits, number systems, and digital circuit design fundamentals.'
  UNION ALL SELECT 'MATH220', 'Focuses on multivariable calculus including vectors, partial derivatives, multiple integration, vector fields, and applications in engineering and physics.'
  UNION ALL SELECT 'ARAB200', 'Develops Arabic language proficiency while introducing students to classical and modern Arabic literature, writing styles, and cultural expression.'
  UNION ALL SELECT 'ENGL251', 'Enhances oral and written communication skills for professional and academic environments. Students practice presentations, technical communication, teamwork discussions, and professional reporting.'
  UNION ALL SELECT 'CSCI300', 'Introduces object-oriented programming concepts such as classes, inheritance, polymorphism, encapsulation, and abstraction. Students build structured and reusable software applications.'
  UNION ALL SELECT 'EENG300', 'Advanced circuit analysis involving capacitors, inductors, transient response, AC circuits, frequency response, and power analysis.'
  UNION ALL SELECT 'MATH310', 'Covers probability theory, statistical analysis, random variables, distributions, hypothesis testing, and engineering data interpretation.'
  UNION ALL SELECT 'CENG335', 'Advanced digital system design including sequential circuits, counters, registers, finite state machines, memory devices, and programmable logic systems.'
  UNION ALL SELECT 'CENG325', 'Focuses on software engineering principles, application development, software architecture, user interface design, testing, and software lifecycle management.'
  UNION ALL SELECT 'EENG301L', 'Laboratory experiments related to circuit analysis, measurement instruments, AC and DC circuits, and verification of electrical engineering theories.'
  UNION ALL SELECT 'EENG350L', 'Practical experiments involving electronic components such as diodes, transistors, amplifiers, and operational amplifiers.'
  UNION ALL SELECT 'ENGG300', 'Introduces economic analysis techniques for engineering projects including cost estimation, depreciation, interest calculations, investment analysis, and project evaluation.'
  UNION ALL SELECT 'CENG352L', 'Hands-on laboratory work in digital electronics including circuit implementation, simulation, FPGA basics, and troubleshooting digital systems.'
  UNION ALL SELECT 'EENG385', 'Covers continuous and discrete-time signals, system analysis, Fourier transforms, convolution, and signal processing fundamentals.'
  UNION ALL SELECT 'CENG375', 'Introduces database concepts including relational databases, SQL programming, normalization, entity-relationship modeling, and database management systems.'
  UNION ALL SELECT 'CENG380', 'Studies computer hardware interfaces and embedded systems. Topics include assembly language, microcontroller architecture, memory systems, I/O interfacing, and embedded programming.'
  UNION ALL SELECT 'EENG350', 'Covers semiconductor devices, diodes, transistors, amplifiers, operational amplifiers, and electronic circuit analysis.'
  UNION ALL SELECT 'CENG430L', 'Practical training in Linux operating systems including shell commands, scripting, file systems, process management, networking tools, and system administration basics.'
  UNION ALL SELECT 'EENG447', 'Introduces analog communication concepts including modulation, demodulation, signal transmission, noise analysis, and communication system performance.'
  UNION ALL SELECT 'CENG415', 'Covers computer networking concepts such as network architectures, TCP/IP, routing, switching, wireless networks, network security, and internet protocols.'
  UNION ALL SELECT 'CENG420', 'Focuses on front-end and back-end web development using web technologies such as HTML, CSS, JavaScript, databases, and server-side programming.'
  UNION ALL SELECT 'CENG400L', 'Laboratory applications of embedded systems and microcontrollers including sensor interfacing, hardware control, and real-time embedded programming.'
  UNION ALL SELECT 'CENG400', 'Explores computer architecture including CPU design, memory hierarchy, instruction sets, assembly language, pipelining, and hardware-software interaction.'
  UNION ALL SELECT 'CENG435', 'Introduces mobile app development for Android or iOS platforms. Topics include UI design, mobile programming, APIs, databases, and app deployment.'
  UNION ALL SELECT 'CENG450L', 'Practical use of scripting languages such as Python, Bash, or Perl for automation, system tasks, and software tools development.'
  UNION ALL SELECT 'CENG455L', 'Hands-on networking experiments including router configuration, network protocols, packet analysis, and network troubleshooting.'
  UNION ALL SELECT 'CENG495', 'A capstone engineering project where students design and implement a complete hardware and software solution. The course emphasizes research, teamwork, technical documentation, and presentation skills.'
  UNION ALL SELECT 'EENG467L', 'Laboratory experiments related to analog communication systems, modulation techniques, signal analysis, and communication hardware.'
  UNION ALL SELECT 'ENGG450', 'Discusses engineering ethics, legal responsibilities, professional conduct, sustainability, teamwork, and workplace practices for engineers.'
  UNION ALL SELECT 'CENG460', 'Introduces operating system concepts including process management, memory management, file systems, scheduling, synchronization, and system security.'
  UNION ALL SELECT 'CENG470', 'Covers advanced data structures such as linked lists, stacks, queues, trees, graphs, and algorithm analysis including sorting, searching, recursion, and computational complexity.'
) AS course_descriptions ON course_descriptions.code = c.code
SET c.description = course_descriptions.description
WHERE u.name = 'Lebanese International University'
  AND d.name = 'Computer and Communications Engineering';

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

/* LIU Computer Engineering prerequisite relationships. */
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
  SELECT 'MATH160' AS code, 'Pre-Calculus' AS title, 'Builds algebraic, trigonometric, and analytic geometry skills needed for calculus and engineering coursework.' AS description, 3 AS credits, 'English' AS language, 'freshman' AS level
  UNION ALL SELECT 'MATH161', 'Calculus I', 'Introduces limits, derivatives, integrals, and applications of single-variable calculus for science and engineering.', 3, 'English', 'freshman'
  UNION ALL SELECT 'ENGL051', 'English Foundations', 'Develops foundational English reading, grammar, vocabulary, and writing skills for university-level study.', 3, 'English', 'freshman'
  UNION ALL SELECT 'ENGL101', 'English I', 'Builds academic English skills through reading, paragraph writing, grammar practice, and structured communication.', 3, 'English', 'freshman'
  UNION ALL SELECT 'ENGL151', 'English II', 'Continues academic English development with essay writing, critical reading, vocabulary, and clear written expression.', 3, 'English', 'freshman'
  UNION ALL SELECT 'CHEM160', 'General Chemistry', 'Introduces general chemistry concepts including atomic structure, bonding, reactions, stoichiometry, gases, solutions, and laboratory-related problem solving.', 3, 'English', 'freshman'
  UNION ALL SELECT 'PHYS160', 'Physics I', 'Introduces mechanics-based physics concepts including motion, forces, energy, momentum, rotation, and applications for engineering students.', 3, 'English', 'freshman'
  UNION ALL SELECT 'PHYS161', 'Physics I Lab', 'Provides laboratory experiments that reinforce Physics I topics through measurement, data analysis, uncertainty, and scientific reporting.', 1, 'English', 'freshman'
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
  'freshman',
  'Computer Engineering Freshman Prerequisite Roadmap',
  22,
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
  SELECT 'MATH160' AS code, 1 AS year_number, 'fall' AS semester, 10 AS sequence_order
  UNION ALL SELECT 'ENGL051', 1, 'fall', 20
  UNION ALL SELECT 'CHEM160', 1, 'fall', 30
  UNION ALL SELECT 'PHYS160', 1, 'fall', 40
  UNION ALL SELECT 'MATH161', 1, 'spring', 10
  UNION ALL SELECT 'ENGL101', 1, 'spring', 20
  UNION ALL SELECT 'ENGL151', 1, 'spring', 30
  UNION ALL SELECT 'PHYS161', 1, 'spring', 40
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
  AND r.level = 'freshman'
WHERE course_university.name = 'Lebanese International University'
  AND course_department.name = 'Computer and Communications Engineering'
  AND major_university.name = 'Lebanese International University'
  AND major_department.name = 'Computer and Communications Engineering'
  AND c.deleted_at IS NULL
ON DUPLICATE KEY UPDATE
  year_number = VALUES(year_number),
  semester = VALUES(semester),
  sequence_order = VALUES(sequence_order);

INSERT IGNORE INTO course_prerequisite (course_id, prereq_course_id)
SELECT
  target.course_id,
  prereq.course_id
FROM (
  SELECT 'MATH225' AS course_code, 'MATH160' AS prereq_code
  UNION ALL SELECT 'MATH225', 'ENGL051'
  UNION ALL SELECT 'MATH225', 'MATH161'
  UNION ALL SELECT 'ENGL201', 'ENGL151'
  UNION ALL SELECT 'ENGG200', 'MATH160'
  UNION ALL SELECT 'ENGG200', 'CHEM160'
  UNION ALL SELECT 'PHYS220', 'PHYS161'
  UNION ALL SELECT 'PHYS220', 'ENGL101'
  UNION ALL SELECT 'PHYS220', 'PHYS160'
  UNION ALL SELECT 'MATH210', 'MATH161'
  UNION ALL SELECT 'MATH210', 'MATH160'
  UNION ALL SELECT 'CSCI250L', 'ENGL101'
  UNION ALL SELECT 'MATH270', 'MATH210'
  UNION ALL SELECT 'CSCI250', 'ENGL101'
  UNION ALL SELECT 'EENG250', 'PHYS161'
  UNION ALL SELECT 'EENG250', 'PHYS160'
  UNION ALL SELECT 'EENG250', 'MATH161'
  UNION ALL SELECT 'EENG250', 'MATH160'
  UNION ALL SELECT 'EENG250', 'ENGL051'
  UNION ALL SELECT 'CENG250', 'EENG250'
  UNION ALL SELECT 'MATH220', 'MATH210'
  UNION ALL SELECT 'ENGL251', 'ENGL201'
  UNION ALL SELECT 'CSCI300', 'CSCI250L'
  UNION ALL SELECT 'CSCI300', 'CSCI250'
  UNION ALL SELECT 'EENG300', 'EENG250'
  UNION ALL SELECT 'MATH310', 'MATH210'
  UNION ALL SELECT 'MATH310', 'ENGL201'
  UNION ALL SELECT 'CENG335', 'CSCI250'
  UNION ALL SELECT 'CENG335', 'CENG250'
  UNION ALL SELECT 'CENG325', 'CSCI300'
  UNION ALL SELECT 'EENG301L', 'EENG250'
  UNION ALL SELECT 'EENG350L', 'EENG300'
  UNION ALL SELECT 'EENG350L', 'EENG250'
  UNION ALL SELECT 'EENG350L', 'EENG301L'
  UNION ALL SELECT 'ENGG300', 'ENGL201'
  UNION ALL SELECT 'ENGG300', 'MATH225'
  UNION ALL SELECT 'CENG352L', 'CENG250'
  UNION ALL SELECT 'CENG352L', 'EENG301L'
  UNION ALL SELECT 'EENG385', 'MATH225'
  UNION ALL SELECT 'EENG385', 'EENG300'
  UNION ALL SELECT 'CENG375', 'CENG325'
  UNION ALL SELECT 'CENG375', 'CSCI300'
  UNION ALL SELECT 'CENG380', 'CENG250'
  UNION ALL SELECT 'CENG380', 'CENG335'
  UNION ALL SELECT 'CENG380', 'EENG250'
  UNION ALL SELECT 'CENG380', 'CSCI250'
  UNION ALL SELECT 'EENG350', 'ENGG200'
  UNION ALL SELECT 'EENG350', 'CENG250'
  UNION ALL SELECT 'EENG350', 'EENG300'
  UNION ALL SELECT 'EENG350', 'EENG250'
  UNION ALL SELECT 'CENG430L', 'CENG380'
  UNION ALL SELECT 'CENG430L', 'CENG325'
  UNION ALL SELECT 'EENG447', 'MATH310'
  UNION ALL SELECT 'EENG447', 'EENG385'
  UNION ALL SELECT 'CENG415', 'CENG250'
  UNION ALL SELECT 'CENG415', 'CENG325'
  UNION ALL SELECT 'CENG415', 'CSCI250'
  UNION ALL SELECT 'CENG415', 'CSCI300'
  UNION ALL SELECT 'CENG420', 'CENG325'
  UNION ALL SELECT 'CENG420', 'CSCI300'
  UNION ALL SELECT 'CENG420', 'CENG375'
  UNION ALL SELECT 'CENG400L', 'CENG380'
  UNION ALL SELECT 'CENG400', 'CENG335'
  UNION ALL SELECT 'CENG400', 'CENG250'
  UNION ALL SELECT 'CENG400', 'CENG380'
  UNION ALL SELECT 'CENG435', 'CENG325'
  UNION ALL SELECT 'CENG435', 'CSCI300'
  UNION ALL SELECT 'CENG435', 'CENG375'
  UNION ALL SELECT 'CENG450L', 'CENG430L'
  UNION ALL SELECT 'CENG455L', 'CENG415'
  UNION ALL SELECT 'CENG495', 'CENG420'
  UNION ALL SELECT 'CENG495', 'EENG350'
  UNION ALL SELECT 'CENG495', 'EENG447'
  UNION ALL SELECT 'CENG495', 'CENG435'
  UNION ALL SELECT 'CENG495', 'CENG415'
  UNION ALL SELECT 'CENG495', 'CENG380'
  UNION ALL SELECT 'CENG495', 'CENG375'
  UNION ALL SELECT 'EENG467L', 'EENG447'
  UNION ALL SELECT 'ENGG450', 'ENGG300'
  UNION ALL SELECT 'ENGG450', 'ENGL251'
  UNION ALL SELECT 'CENG460', 'CENG380'
  UNION ALL SELECT 'CENG460', 'CSCI300'
  UNION ALL SELECT 'CENG470', 'CENG325'
  UNION ALL SELECT 'CENG470', 'CSCI300'
) AS prereq_data
JOIN course target
  ON target.code = prereq_data.course_code
JOIN department target_department
  ON target_department.department_id = target.department_id
JOIN university target_university
  ON target_university.university_id = target_department.university_id
JOIN course prereq
  ON prereq.code = prereq_data.prereq_code
JOIN department prereq_department
  ON prereq_department.department_id = prereq.department_id
JOIN university prereq_university
  ON prereq_university.university_id = prereq_department.university_id
WHERE target_university.name = 'Lebanese International University'
  AND target_department.name = 'Computer and Communications Engineering'
  AND prereq_university.name = 'Lebanese International University'
  AND prereq_department.name = 'Computer and Communications Engineering'
  AND target.deleted_at IS NULL
  AND prereq.deleted_at IS NULL;

/* Generated majors and starter roadmaps for the seeded course catalog. */
DROP TEMPORARY TABLE IF EXISTS tmp_catalog_major_seed;

/* Official LIU Bachelor of Science in Communications Engineering (BTENG) plan. */
UPDATE course c
JOIN department d ON d.department_id = c.department_id
JOIN university u ON u.university_id = d.university_id
LEFT JOIN course existing
  ON existing.department_id = c.department_id
  AND existing.code = 'EENG388'
  AND existing.course_id <> c.course_id
SET
  c.code = 'EENG388',
  c.title = 'Electromagnetic Fields and Waves',
  c.description = 'Introduces electromagnetic theory, including vector analysis, coordinate systems, divergence, gradient, curl, electrostatics, Coulomb''s law, Gauss''s law, electric forces and potential, magnetostatics, Biot-Savart''s law, Ampere''s law, magnetic forces, Maxwell''s equations, Faraday''s law, and plane wave propagation.',
  c.credits = 3,
  c.language = 'English',
  c.level = 'undergraduate',
  c.deleted_at = NULL
WHERE u.name = 'Lebanese International University'
  AND d.name = 'Computer and Communications Engineering'
  AND REPLACE(c.code, ' ', '') = 'EENG388'
  AND c.code <> 'EENG388'
  AND existing.course_id IS NULL;

INSERT INTO major (department_id, name)
SELECT d.department_id, 'Communication Engineering'
FROM department d
JOIN university u ON u.university_id = d.university_id
WHERE u.name = 'Lebanese International University'
  AND d.name = 'Computer and Communications Engineering'
ON DUPLICATE KEY UPDATE
  is_active = 1;

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
  SELECT 'PHYS220' AS code, 'Physics for Engineers' AS title, 'Introduces engineering students to calculus-based physics, including mechanical oscillations, mechanical waves, interference, reflection and refraction of light, and image formation.' AS description, 3 AS credits, 'English' AS language, 'undergraduate' AS level
  UNION ALL SELECT 'CULT200', 'Introduction to Arab-Islamic Civilization', 'Introduces Arab-Islamic civilization, its historical importance, cultural achievements, and scientific contributions while developing awareness of Arab cultural identity and its role in shaping the future.', 3, 'Arabic', 'undergraduate'
  UNION ALL SELECT 'MATH210', 'Calculus II', 'Continues the calculus sequence with logarithmic, exponential, and trigonometric functions, inverse functions, integration techniques, improper integrals, sequences, series, power series, and polar coordinates.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'ENGG200', 'Introduction to Engineering', 'Introduces the engineering field, the role of engineers, and basic engineering principles. Students apply design concepts by developing a prototype system as part of a team.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'ENGL201', 'Composition and Research Skills', 'Develops academic writing, critical thinking, and research skills through interdisciplinary reading and a research paper using analytical and critical methods.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'MATH225', 'Linear Algebra with Applications', 'Introduces vectors, systems of equations, matrices, determinants, vector spaces, linear transformations, eigenvalues, eigenvectors, diagonalization, and orthogonality with science and engineering applications.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG250', 'Electric Circuits I', 'Introduces electrical and electronic engineering fundamentals, including voltage, current, power, resistance, capacitance, inductance, Kirchhoff''s laws, node and mesh analysis, Thevenin and Norton equivalents, operational amplifier circuits, and first-order RL and RC circuits.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CSCI250', 'Introduction to Programming', 'Introduces structured programming using Java, covering syntax, program structure, data types, control structures, methods, arrays, and strings.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG250', 'Digital Logic I', 'Introduces digital logic operations and design, including Boolean algebra, logic functions, minimization techniques, logic gates, number systems, binary arithmetic, decoders, encoders, comparators, multiplexers, and demultiplexers.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CSCI250L', 'Introduction to Programming Lab', 'Supports Introduction to Programming with hands-on practice in programming problems using data types, selection and repetition structures, methods, and arrays.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'MATH220', 'Calculus III', 'Covers multivariable calculus and vector calculus, including quadric surfaces, partial differentiation, multiple integration, and vector fields.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'MATH270', 'Ordinary Differential Equations', 'Introduces ordinary differential equations and applications, including first-order equations, higher-order equations, systems of differential equations, series solutions, and Laplace transforms.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'ENGL251', 'Communication Skills', 'Focuses on workplace and technical communication through professional writing, editing, and communication practices used in different careers.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'ARAB200', 'Arabic Language and Literature', 'Introduces Arabic language and literature for non-specialists, including grammar, morphology, rhetoric, literary analysis, and communication and expression techniques.', 3, 'Arabic', 'undergraduate'
  UNION ALL SELECT 'CENG325', 'Software Applications and Design', 'Introduces application design and development using object-oriented programming, including design, implementation, testing, graphical user interfaces, debugging, executable creation, UML, and socket programming basics.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CSCI300', 'Intermediate Programming with Objects', 'Focuses on object-oriented programming using Java, including classes, objects, constructors, methods, dependency, aggregation, inheritance, polymorphism, exception handling, and file input/output.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'MATH310', 'Probability and Statistics for Scientists and Engineers', 'Provides probability and statistics concepts for engineering and scientific applications, developing computational, analytical, and interpretation skills for non-deterministic situations.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG300', 'Electric Circuits II', 'Focuses on AC circuit analysis, including ideal and dependent sources, sinusoidal steady-state power calculations, balanced three-phase circuits, and frequency-selective circuits.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG301L', 'Electric Circuits Lab', 'Gives practical experience designing, building, and testing DC and AC circuits using resistors, capacitors, inductors, transformers, operational amplifiers, lab instruments, and circuit simulation software.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG335', 'Digital Logic II', 'Extends Digital Logic I by introducing sequential circuits, including latches, flip-flops, state tables, state equations, Moore and Mealy machines, digital logic design methods, and hardware programming languages.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG375', 'Introduction to Database Systems', 'Introduces database design and programming, including entity-relationship modeling, relational databases, relational algebra, SQL, database creation and querying, programming connections, normalization, transactions, triggers, and assertions.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG350L', 'Electronic Circuits I Lab', 'Covers the design, implementation, and testing of electronic circuits using diodes, BJTs, and MOSFETs, reinforcing theory through circuit characteristics and amplifier configurations.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG380', 'Microprocessors and Microcontrollers', 'Introduces microcontroller design and applications, focusing on AVR architecture, assembly language, C programming, hardware architecture, branching, arithmetic and logic operations, timers, interrupts, parallel I/O, and interfacing.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG352L', 'Digital Logic Circuits Lab', 'Focuses on designing, simulating, and testing digital logic circuits, including combinational logic, decoders, encoders, multiplexers, binary arithmetic circuits, programmable logic, flip-flops, sequential circuits, timing diagrams, and small digital design projects.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG385', 'Signals and Systems', 'Introduces signals and systems, their properties, and behavior in time and frequency domains, including linear time-invariant systems, Fourier series, Fourier transform, and Laplace transform applications.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'ENGG300', 'Engineering Economics', 'Introduces economic principles used in engineering decision-making, including the engineer as decision maker, money, cost analysis, environmental and social factors, and real-world economic problem solving.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG350', 'Electronic Circuits I', 'Covers semiconductor devices and electronic circuits, including PN junctions, diode models, diode applications, BJTs, MOSFETs, DC biasing, small-signal models, and amplifier circuits.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG430L', 'Linux Lab', 'Teaches Linux and Python scripting for the Raspberry Pi platform with emphasis on automation, interfacing, and networking.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG400L', 'Microcontroller Applications Lab', 'Focuses on Arduino microcontroller programming and hardware applications, including Arduino Atmega328P programming, serial and parallel bus interfacing, C programming, Proteus simulation, and ATMEL software tools.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG447', 'Analog Communication Systems', 'Introduces analog communication systems, including linear systems, noiseless modulation, spectral density, correlation of deterministic and random signals, thermal and white noise, linear and angle modulation, interference, feedback demodulators, and noise effects.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG420', 'Web Programming and Technologies', 'Focuses on designing and developing web-based applications, including HTML, CSS, JavaScript, DOM, jQuery, PHP, AJAX, database connectivity, session tracking, HTTP headers, security, and privacy risks.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG435', 'Mobile Application Development', 'Focuses on advanced Android mobile application development, including installation, application structure, user interfaces, data persistence, geolocation, media handling, networking, services, deployment, business models, and current mobile trends.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG415', 'Communication Networks', 'Introduces the design and implementation of computer communication networks, including architectures, protocols, FTP, SMTP, HTTP, reliable data transfer, transport protocols, congestion and flow control, routing, data link protocols, addressing, and local area networks.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG400', 'Computer Organization and Design', 'Introduces computer organization and digital logic design, including computer arithmetic, MIPS processor design, ALU, datapath and control, pipelining, pipeline hazards, interrupts, exceptions, memory hierarchy, caches, and virtual memory.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG450L', 'Scripting Languages Lab', 'Introduces popular scientific scripting languages used in engineering, especially in computer and communications engineering.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG467L', 'Analog Communication Systems Lab', 'Supports Analog Communication Systems through LabVIEW design and simulation of AM, DSB, SSB, and FM modulation and demodulation, plus real-time testing using NI USRP2901.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG460', 'Operating Systems', 'Introduces operating systems at user, application, design, and implementation levels, including structure, process management, scheduling, threads, interprocess communication, deadlocks, synchronization, protection, memory management, and hands-on programming.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG480', 'Introduction to GIS', 'Introduces geographic information systems for engineering applications, including spatial data, digital maps, layers, coordinate systems, geospatial databases, visualization, analysis, and decision support.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'EENG388', 'Electromagnetic Fields and Waves', 'Introduces electromagnetic theory, including vector analysis, coordinate systems, divergence, gradient, curl, electrostatics, Coulomb''s law, Gauss''s law, electric forces and potential, magnetostatics, Biot-Savart''s law, Ampere''s law, magnetic forces, Maxwell''s equations, Faraday''s law, and plane wave propagation.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG495', 'Senior Project', 'Applies undergraduate program knowledge to an open-ended engineering design project. Students work in teams, improve communication skills, use technical literature and software tools, and experience the full design project life cycle.', 3, 'English', 'undergraduate'
  UNION ALL SELECT 'CENG455L', 'Communication Networks Lab', 'Provides practical Internet networking experience using Packet Tracer to build, configure, and manage LAN and WAN networks, switches, routers, IPv4 and IPv6, client/server applications, access lists, and VLAN concepts.', 1, 'English', 'undergraduate'
  UNION ALL SELECT 'ENGG450', 'Engineering Ethics and Professional Practice', 'Studies engineering ethics from historical, philosophical, and professional perspectives, including employee rights, whistleblowing, safety, risk, liability, professional responsibility, conflicts of interest, codes of ethics, legal obligations, environmental responsibility, and ethical case analysis.', 3, 'English', 'undergraduate'
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
  'Official BS in Communications Engineering (BTENG) Roadmap',
  108,
  1,
  NULL
FROM major m
JOIN department d ON d.department_id = m.department_id
JOIN university u ON u.university_id = d.university_id
WHERE u.name = 'Lebanese International University'
  AND d.name = 'Computer and Communications Engineering'
  AND m.name = 'Communication Engineering'
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
  AND m.name = 'Communication Engineering'
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
  SELECT 'PHYS220' AS code, 1 AS year_number, 'fall' AS semester, 10 AS sequence_order
  UNION ALL SELECT 'CULT200', 1, 'fall', 20
  UNION ALL SELECT 'MATH210', 1, 'fall', 30
  UNION ALL SELECT 'ENGG200', 1, 'fall', 40
  UNION ALL SELECT 'ENGL201', 1, 'fall', 50
  UNION ALL SELECT 'MATH225', 1, 'fall', 60
  UNION ALL SELECT 'EENG250', 1, 'spring', 10
  UNION ALL SELECT 'CSCI250', 1, 'spring', 20
  UNION ALL SELECT 'CENG250', 1, 'spring', 30
  UNION ALL SELECT 'CSCI250L', 1, 'spring', 40
  UNION ALL SELECT 'MATH220', 1, 'spring', 50
  UNION ALL SELECT 'MATH270', 1, 'spring', 60
  UNION ALL SELECT 'ENGL251', 1, 'summer', 10
  UNION ALL SELECT 'ARAB200', 1, 'summer', 20
  UNION ALL SELECT 'CENG325', 2, 'fall', 10
  UNION ALL SELECT 'CSCI300', 2, 'fall', 20
  UNION ALL SELECT 'MATH310', 2, 'fall', 30
  UNION ALL SELECT 'EENG300', 2, 'fall', 40
  UNION ALL SELECT 'EENG301L', 2, 'fall', 50
  UNION ALL SELECT 'CENG335', 2, 'fall', 60
  UNION ALL SELECT 'CENG375', 2, 'spring', 10
  UNION ALL SELECT 'EENG350L', 2, 'spring', 20
  UNION ALL SELECT 'CENG380', 2, 'spring', 30
  UNION ALL SELECT 'CENG352L', 2, 'spring', 40
  UNION ALL SELECT 'EENG385', 2, 'spring', 50
  UNION ALL SELECT 'ENGG300', 2, 'spring', 60
  UNION ALL SELECT 'EENG350', 2, 'spring', 70
  UNION ALL SELECT 'CENG430L', 3, 'fall', 10
  UNION ALL SELECT 'CENG400L', 3, 'fall', 20
  UNION ALL SELECT 'EENG447', 3, 'fall', 30
  UNION ALL SELECT 'CENG420', 3, 'fall', 40
  UNION ALL SELECT 'CENG435', 3, 'fall', 50
  UNION ALL SELECT 'CENG415', 3, 'fall', 60
  UNION ALL SELECT 'CENG400', 3, 'fall', 70
  UNION ALL SELECT 'CENG450L', 3, 'spring', 10
  UNION ALL SELECT 'EENG467L', 3, 'spring', 20
  UNION ALL SELECT 'CENG460', 3, 'spring', 30
  UNION ALL SELECT 'CENG480', 3, 'spring', 40
  UNION ALL SELECT 'EENG388', 3, 'spring', 50
  UNION ALL SELECT 'CENG495', 3, 'spring', 60
  UNION ALL SELECT 'CENG455L', 3, 'spring', 70
  UNION ALL SELECT 'ENGG450', 3, 'spring', 80
) AS roadmap_data
JOIN course c ON c.code = roadmap_data.code
JOIN department course_department
  ON course_department.department_id = c.department_id
JOIN university course_university
  ON course_university.university_id = course_department.university_id
JOIN major m ON m.name = 'Communication Engineering'
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

/* Keep major-specific courses from being shown under the wrong LIU CCE major. */
DELETE rc
FROM roadmap_course rc
JOIN roadmap r ON r.roadmap_id = rc.roadmap_id
JOIN major m ON m.major_id = r.major_id
JOIN department d ON d.department_id = m.department_id
JOIN university u ON u.university_id = d.university_id
JOIN course c ON c.course_id = rc.course_id
WHERE u.name = 'Lebanese International University'
  AND d.name = 'Computer and Communications Engineering'
  AND r.level = 'undergraduate'
  AND (
    (m.name = 'Communication Engineering' AND c.code = 'CENG470')
    OR (m.name = 'Computer Engineering' AND c.code IN ('EENG388', 'CENG480'))
  );

UPDATE course
SET description = CASE
  WHEN title LIKE 'Requirement:%'
    OR title LIKE '%Elective%'
    OR title LIKE '%Approved%'
    THEN CONCAT(
      'This curriculum requirement lets students complete the ',
      LOWER(TRIM(REPLACE(title, 'Requirement:', ''))),
      ' component of their program while choosing an approved course that fits their academic plan.'
    )
  WHEN title LIKE '%Lab%'
    OR title LIKE '%Laboratory%'
    THEN CONCAT(
      'This laboratory course gives students hands-on practice with ',
      LOWER(title),
      ', including experiments, technical tools, measurement, implementation, and applied problem solving.'
    )
  WHEN title REGEXP 'Arabic|English|Communication|Langue|Expression'
    THEN 'This course strengthens language, communication, reading, writing, and presentation skills needed for academic and professional work.'
  WHEN title REGEXP 'Calculus|Math|Linear Algebra|Differential|Statistics|Probability|Numerical|Graph'
    THEN 'This course develops mathematical methods for engineering problem solving, including theory, applied examples, analysis, and quantitative reasoning.'
  WHEN title REGEXP 'Physics|Chemistry|Science|Thermodynamics'
    THEN 'This science course covers foundational concepts, laboratory or analytical methods, and applications that support engineering study.'
  WHEN title REGEXP 'Program|Software|Data Structure|Algorithm|Database|Compiler|Operating|Computer'
    THEN CONCAT(
      'This course covers ',
      LOWER(title),
      ' through core computing concepts, programming practice, system design, and applied technical problem solving.'
    )
  WHEN title REGEXP 'Circuit|Electronics|Signal|Communication|Network|Wireless|Telecommunication|Electro'
    THEN CONCAT(
      'This course covers ',
      LOWER(title),
      ' through engineering theory, analysis methods, practical design, and real-world communication or electronic systems.'
    )
  WHEN title REGEXP 'Project|Capstone|Design|Field Training|Stage|Seminar'
    THEN 'This course applies program knowledge through project work, documentation, teamwork, implementation, evaluation, and professional presentation.'
  WHEN title REGEXP 'Ethics|Values|Humanities|Social|Culture|Sustainable'
    THEN 'This course builds broader professional and cultural awareness through ethics, society, communication, responsibility, and reflective academic work.'
  ELSE CONCAT(
    'This course introduces ',
    LOWER(title),
    ' through core concepts, applied examples, practical skills, and problem solving connected to the program.'
  )
END
WHERE description REGEXP 'Source:|PDF|pdf|official roadmap item|supplied by user|catalogue|reference|Foundation .* prerequisite|^waves$|No description';

UPDATE course
SET description = REPLACE(
  description,
  'civilization impact on the modern world',
  'civilization''s impact on the modern world'
);

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
