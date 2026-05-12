/* Idempotent Lebanese university academic catalog for Coursality.
   Run this against the configured application database after the base schema.
   The course-to-major relationship is represented through roadmap_course. */

SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

UPDATE department
SET name = 'Engineering'
WHERE LOWER(name) = 'engineering';

DROP TEMPORARY TABLE IF EXISTS tmp_academic_department_seed;
CREATE TEMPORARY TABLE tmp_academic_department_seed (
  university_key VARCHAR(16) NOT NULL,
  department_name VARCHAR(255) NOT NULL,
  PRIMARY KEY (university_key, department_name)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_academic_department_seed (university_key, department_name) VALUES
  ('BAU', 'Mathematics and Computer Science'),
  ('BAU', 'Engineering'),
  ('BAU', 'Business Administration'),
  ('BAU', 'Architecture - Design and Built Environment'),
  ('BAU', 'Health Sciences'),
  ('BAU', 'Pharmacy'),
  ('BAU', 'Law and Political Science'),
  ('BAU', 'Human Sciences'),
  ('AUB', 'Computer Science'),
  ('AUB', 'Engineering'),
  ('AUB', 'Business'),
  ('AUB', 'Arts and Sciences'),
  ('AUB', 'Agriculture and Food Sciences'),
  ('AUB', 'Health Sciences'),
  ('AUB', 'Nursing'),
  ('LAU', 'Computer Science and Mathematics'),
  ('LAU', 'Engineering'),
  ('LAU', 'Business'),
  ('LAU', 'Architecture and Design'),
  ('LAU', 'Arts and Sciences'),
  ('LAU', 'Pharmacy'),
  ('LAU', 'Nursing'),
  ('LIU', 'Computer Science and Information Technology'),
  ('LIU', 'Computer and Communications Engineering'),
  ('LIU', 'Engineering'),
  ('LIU', 'Business'),
  ('LIU', 'Arts and Sciences'),
  ('LIU', 'Pharmacy and Medical Sciences'),
  ('LIU', 'Education'),
  ('USJ', 'Informatique'),
  ('USJ', 'Engineering'),
  ('USJ', 'Business and Management'),
  ('USJ', 'Sciences'),
  ('USJ', 'Medicine and Health Sciences'),
  ('USJ', 'Law and Political Science'),
  ('USJ', 'Humanities'),
  ('UOB', 'Computer Science'),
  ('UOB', 'Engineering'),
  ('UOB', 'Business and Management'),
  ('UOB', 'Arts and Sciences'),
  ('UOB', 'Health Sciences'),
  ('UOB', 'Medicine and Medical Sciences'),
  ('UOB', 'Architecture and Design');

DROP TEMPORARY TABLE IF EXISTS tmp_university_key;
CREATE TEMPORARY TABLE tmp_university_key (
  university_key VARCHAR(16) NOT NULL PRIMARY KEY,
  university_id INT UNSIGNED NOT NULL
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_university_key (university_key, university_id)
SELECT 'BAU', university_id FROM university WHERE name = 'Beirut Arab University' AND is_active = 1
UNION ALL SELECT 'AUB', university_id FROM university WHERE name = 'American University of Beirut' AND is_active = 1
UNION ALL SELECT 'LAU', university_id FROM university WHERE name = 'Lebanese American University' AND is_active = 1
UNION ALL SELECT 'LIU', university_id FROM university WHERE name = 'Lebanese International University' AND is_active = 1
UNION ALL SELECT 'USJ', university_id FROM university WHERE name LIKE 'Universit%Saint-Joseph de Beyrouth' AND is_active = 1
UNION ALL SELECT 'UOB', university_id FROM university WHERE name = 'University of Balamand' AND is_active = 1;

INSERT INTO department (name, university_id)
SELECT seed.department_name, uk.university_id
FROM tmp_academic_department_seed seed
JOIN tmp_university_key uk ON uk.university_key = seed.university_key
WHERE NOT EXISTS (
  SELECT 1
  FROM department d
  WHERE d.university_id = uk.university_id
    AND LOWER(d.name) = LOWER(seed.department_name)
);

DROP TEMPORARY TABLE IF EXISTS tmp_academic_major_seed;
CREATE TEMPORARY TABLE tmp_academic_major_seed (
  university_key VARCHAR(16) NOT NULL,
  department_name VARCHAR(255) NOT NULL,
  major_name VARCHAR(255) NOT NULL,
  major_group VARCHAR(64) NOT NULL,
  code_prefix VARCHAR(16) NOT NULL,
  roadmap_title VARCHAR(255) NOT NULL,
  PRIMARY KEY (university_key, department_name, major_name)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_academic_major_seed (
  university_key, department_name, major_name, major_group, code_prefix, roadmap_title
) VALUES
  ('BAU', 'Mathematics and Computer Science', 'Computer Science', 'computer_science', 'CMPS ', 'Computer Science Undergraduate Roadmap'),
  ('BAU', 'Mathematics and Computer Science', 'Computer Science - Software Engineering Track', 'software_engineering', 'SWE ', 'Software Engineering Track Undergraduate Roadmap'),
  ('BAU', 'Mathematics and Computer Science', 'Computer Science - Artificial Intelligence and Data Science Track', 'data_science', 'DSCI ', 'Artificial Intelligence and Data Science Track Undergraduate Roadmap'),
  ('BAU', 'Mathematics and Computer Science', 'Mathematics', 'mathematics', 'MATH ', 'Mathematics Undergraduate Roadmap'),
  ('BAU', 'Engineering', 'Biomedical Engineering', 'biomedical_engineering', 'BME ', 'Biomedical Engineering Undergraduate Roadmap'),
  ('BAU', 'Engineering', 'Chemical Engineering', 'chemical_engineering', 'CHE ', 'Chemical Engineering Undergraduate Roadmap'),
  ('BAU', 'Engineering', 'Civil Engineering', 'civil_engineering', 'CIVE ', 'Civil Engineering Undergraduate Roadmap'),
  ('BAU', 'Engineering', 'Communications and Electronics Engineering', 'communications_engineering', 'COME ', 'Communications and Electronics Engineering Undergraduate Roadmap'),
  ('BAU', 'Engineering', 'Computer Engineering', 'computer_engineering', 'COMP ', 'Computer Engineering Undergraduate Roadmap'),
  ('BAU', 'Engineering', 'Electrical Power and Machines Engineering', 'electrical_engineering', 'ELEC ', 'Electrical Power and Machines Engineering Undergraduate Roadmap'),
  ('BAU', 'Engineering', 'Industrial Engineering', 'industrial_engineering', 'INDE ', 'Industrial Engineering Undergraduate Roadmap'),
  ('BAU', 'Engineering', 'Mechanical Engineering', 'mechanical_engineering', 'MECH ', 'Mechanical Engineering Undergraduate Roadmap'),
  ('BAU', 'Engineering', 'Petroleum Engineering', 'petroleum_engineering', 'PETE ', 'Petroleum Engineering Undergraduate Roadmap'),
  ('BAU', 'Engineering', 'Renewable Energy Engineering', 'renewable_energy', 'RNEE ', 'Renewable Energy Engineering Undergraduate Roadmap'),
  ('BAU', 'Business Administration', 'Accounting', 'accounting', 'BACC ', 'Accounting Undergraduate Roadmap'),
  ('BAU', 'Business Administration', 'Banking and Finance', 'finance', 'BFIN ', 'Banking and Finance Undergraduate Roadmap'),
  ('BAU', 'Business Administration', 'Economics', 'economics', 'BECO ', 'Economics Undergraduate Roadmap'),
  ('BAU', 'Business Administration', 'Management', 'management', 'BMGT ', 'Management Undergraduate Roadmap'),
  ('BAU', 'Business Administration', 'Marketing', 'marketing', 'BMKT ', 'Marketing Undergraduate Roadmap'),
  ('BAU', 'Business Administration', 'Management Information Systems', 'mis', 'BMIS ', 'Management Information Systems Undergraduate Roadmap'),
  ('BAU', 'Architecture - Design and Built Environment', 'Architecture', 'architecture', 'ARCH ', 'Architecture Undergraduate Roadmap'),
  ('BAU', 'Architecture - Design and Built Environment', 'Graphic Design', 'design', 'GDES ', 'Graphic Design Undergraduate Roadmap'),
  ('BAU', 'Architecture - Design and Built Environment', 'Interior Design', 'design', 'IDES ', 'Interior Design Undergraduate Roadmap'),
  ('BAU', 'Architecture - Design and Built Environment', 'Fashion Design', 'design', 'FDES ', 'Fashion Design Undergraduate Roadmap'),
  ('BAU', 'Health Sciences', 'Nursing', 'nursing', 'NURS ', 'Nursing Undergraduate Roadmap'),
  ('BAU', 'Health Sciences', 'Nutrition and Dietetics', 'nutrition', 'NUTR ', 'Nutrition and Dietetics Undergraduate Roadmap'),
  ('BAU', 'Health Sciences', 'Medical Laboratory Sciences', 'health_sciences', 'MLSC ', 'Medical Laboratory Sciences Undergraduate Roadmap'),
  ('BAU', 'Health Sciences', 'Physical Therapy', 'health_sciences', 'PHYT ', 'Physical Therapy Undergraduate Roadmap'),
  ('BAU', 'Pharmacy', 'Pharmacy', 'pharmacy', 'PHAR ', 'Pharmacy Undergraduate Roadmap'),
  ('BAU', 'Law and Political Science', 'Law', 'law', 'LAW ', 'Law Undergraduate Roadmap'),
  ('BAU', 'Law and Political Science', 'Political Science', 'political_science', 'POLS ', 'Political Science Undergraduate Roadmap'),
  ('BAU', 'Human Sciences', 'English Language and Literature', 'humanities', 'ENGL ', 'English Language and Literature Undergraduate Roadmap'),
  ('BAU', 'Human Sciences', 'Psychology', 'psychology', 'PSYC ', 'Psychology Undergraduate Roadmap'),
  ('BAU', 'Human Sciences', 'Education', 'education', 'EDUC ', 'Education Undergraduate Roadmap'),

  ('AUB', 'Computer Science', 'Computer Science', 'computer_science', 'CMPS ', 'Computer Science Undergraduate Roadmap'),
  ('AUB', 'Computer Science', 'Data Science', 'data_science', 'DSCI ', 'Data Science Undergraduate Roadmap'),
  ('AUB', 'Engineering', 'Computer and Communications Engineering', 'computer_engineering', 'CCE ', 'Computer and Communications Engineering Undergraduate Roadmap'),
  ('AUB', 'Engineering', 'Electrical and Computer Engineering', 'electrical_engineering', 'EECE ', 'Electrical and Computer Engineering Undergraduate Roadmap'),
  ('AUB', 'Engineering', 'Civil Engineering', 'civil_engineering', 'CIVE ', 'Civil Engineering Undergraduate Roadmap'),
  ('AUB', 'Engineering', 'Mechanical Engineering', 'mechanical_engineering', 'MECH ', 'Mechanical Engineering Undergraduate Roadmap'),
  ('AUB', 'Engineering', 'Chemical Engineering', 'chemical_engineering', 'CHEN ', 'Chemical Engineering Undergraduate Roadmap'),
  ('AUB', 'Engineering', 'Industrial Engineering', 'industrial_engineering', 'INDE ', 'Industrial Engineering Undergraduate Roadmap'),
  ('AUB', 'Engineering', 'Architecture', 'architecture', 'ARCH ', 'Architecture Undergraduate Roadmap'),
  ('AUB', 'Business', 'Business Administration', 'business_admin', 'BUSS ', 'Business Administration Undergraduate Roadmap'),
  ('AUB', 'Business', 'Accounting', 'accounting', 'ACCT ', 'Accounting Undergraduate Roadmap'),
  ('AUB', 'Business', 'Finance', 'finance', 'FINA ', 'Finance Undergraduate Roadmap'),
  ('AUB', 'Business', 'Marketing', 'marketing', 'MKTG ', 'Marketing Undergraduate Roadmap'),
  ('AUB', 'Business', 'Business Analytics', 'data_science', 'BANA ', 'Business Analytics Undergraduate Roadmap'),
  ('AUB', 'Business', 'Management', 'management', 'MGMT ', 'Management Undergraduate Roadmap'),
  ('AUB', 'Arts and Sciences', 'Biology', 'basic_sciences', 'BIOL ', 'Biology Undergraduate Roadmap'),
  ('AUB', 'Arts and Sciences', 'Chemistry', 'basic_sciences', 'CHEM ', 'Chemistry Undergraduate Roadmap'),
  ('AUB', 'Arts and Sciences', 'Mathematics', 'mathematics', 'MATH ', 'Mathematics Undergraduate Roadmap'),
  ('AUB', 'Arts and Sciences', 'Economics', 'economics', 'ECON ', 'Economics Undergraduate Roadmap'),
  ('AUB', 'Arts and Sciences', 'Psychology', 'psychology', 'PSYC ', 'Psychology Undergraduate Roadmap'),
  ('AUB', 'Arts and Sciences', 'Political Studies', 'political_science', 'PSPA ', 'Political Studies Undergraduate Roadmap'),
  ('AUB', 'Agriculture and Food Sciences', 'Agribusiness', 'business_admin', 'AGBU ', 'Agribusiness Undergraduate Roadmap'),
  ('AUB', 'Agriculture and Food Sciences', 'Food Science and Management', 'nutrition', 'FOOD ', 'Food Science and Management Undergraduate Roadmap'),
  ('AUB', 'Agriculture and Food Sciences', 'Nutrition and Dietetics', 'nutrition', 'NFSC ', 'Nutrition and Dietetics Undergraduate Roadmap'),
  ('AUB', 'Health Sciences', 'Environmental Health', 'health_sciences', 'ENHL ', 'Environmental Health Undergraduate Roadmap'),
  ('AUB', 'Health Sciences', 'Medical Laboratory Sciences', 'health_sciences', 'MLSC ', 'Medical Laboratory Sciences Undergraduate Roadmap'),
  ('AUB', 'Nursing', 'Nursing', 'nursing', 'NURS ', 'Nursing Undergraduate Roadmap'),

  ('LAU', 'Computer Science and Mathematics', 'Computer Science', 'computer_science', 'CSC ', 'Computer Science Undergraduate Roadmap'),
  ('LAU', 'Computer Science and Mathematics', 'Bioinformatics', 'bioinformatics', 'BIOI ', 'Bioinformatics Undergraduate Roadmap'),
  ('LAU', 'Computer Science and Mathematics', 'Mathematics', 'mathematics', 'MTH ', 'Mathematics Undergraduate Roadmap'),
  ('LAU', 'Computer Science and Mathematics', 'Data Science', 'data_science', 'DSAI ', 'Data Science Undergraduate Roadmap'),
  ('LAU', 'Engineering', 'Computer Engineering', 'computer_engineering', 'COE ', 'Computer Engineering Undergraduate Roadmap'),
  ('LAU', 'Engineering', 'Civil Engineering', 'civil_engineering', 'CIE ', 'Civil Engineering Undergraduate Roadmap'),
  ('LAU', 'Engineering', 'Electrical Engineering', 'electrical_engineering', 'ELE ', 'Electrical Engineering Undergraduate Roadmap'),
  ('LAU', 'Engineering', 'Mechanical Engineering', 'mechanical_engineering', 'MEE ', 'Mechanical Engineering Undergraduate Roadmap'),
  ('LAU', 'Engineering', 'Industrial Engineering', 'industrial_engineering', 'INE ', 'Industrial Engineering Undergraduate Roadmap'),
  ('LAU', 'Engineering', 'Mechatronics Engineering', 'mechatronics', 'MCE ', 'Mechatronics Engineering Undergraduate Roadmap'),
  ('LAU', 'Business', 'Business Studies', 'business_admin', 'BUS ', 'Business Studies Undergraduate Roadmap'),
  ('LAU', 'Business', 'Economics', 'economics', 'ECO ', 'Economics Undergraduate Roadmap'),
  ('LAU', 'Business', 'Hospitality and Tourism Management', 'hospitality', 'HTM ', 'Hospitality and Tourism Management Undergraduate Roadmap'),
  ('LAU', 'Business', 'Accounting and Finance', 'finance', 'FIN ', 'Accounting and Finance Undergraduate Roadmap'),
  ('LAU', 'Business', 'Marketing', 'marketing', 'MKT ', 'Marketing Undergraduate Roadmap'),
  ('LAU', 'Business', 'Management', 'management', 'MGT ', 'Management Undergraduate Roadmap'),
  ('LAU', 'Architecture and Design', 'Architecture', 'architecture', 'ARC ', 'Architecture Undergraduate Roadmap'),
  ('LAU', 'Architecture and Design', 'Graphic Design', 'design', 'GRA ', 'Graphic Design Undergraduate Roadmap'),
  ('LAU', 'Architecture and Design', 'Interior Design', 'design', 'INT ', 'Interior Design Undergraduate Roadmap'),
  ('LAU', 'Architecture and Design', 'Fashion Design', 'design', 'FAS ', 'Fashion Design Undergraduate Roadmap'),
  ('LAU', 'Arts and Sciences', 'Biology', 'basic_sciences', 'BIO ', 'Biology Undergraduate Roadmap'),
  ('LAU', 'Arts and Sciences', 'Chemistry', 'basic_sciences', 'CHM ', 'Chemistry Undergraduate Roadmap'),
  ('LAU', 'Arts and Sciences', 'Communication', 'humanities', 'COM ', 'Communication Undergraduate Roadmap'),
  ('LAU', 'Arts and Sciences', 'Education', 'education', 'EDU ', 'Education Undergraduate Roadmap'),
  ('LAU', 'Arts and Sciences', 'English', 'humanities', 'ENG ', 'English Undergraduate Roadmap'),
  ('LAU', 'Pharmacy', 'Pharmacy', 'pharmacy', 'PHR ', 'Pharmacy Undergraduate Roadmap'),
  ('LAU', 'Nursing', 'Nursing', 'nursing', 'NUR ', 'Nursing Undergraduate Roadmap'),

  ('LIU', 'Computer Science and Information Technology', 'Computer Science', 'computer_science', 'CSCI', 'Computer Science Undergraduate Roadmap'),
  ('LIU', 'Computer Science and Information Technology', 'Information Technology', 'information_technology', 'INFT', 'Information Technology Undergraduate Roadmap'),
  ('LIU', 'Computer Science and Information Technology', 'Data Science', 'data_science', 'DSCI', 'Data Science Undergraduate Roadmap'),
  ('LIU', 'Computer and Communications Engineering', 'Computer Engineering', 'computer_engineering', 'CENG', 'Computer Engineering Undergraduate Roadmap'),
  ('LIU', 'Computer and Communications Engineering', 'Communication Engineering', 'communications_engineering', 'TCOM', 'Communication Engineering Undergraduate Roadmap'),
  ('LIU', 'Engineering', 'Biomedical Engineering', 'biomedical_engineering', 'BMED', 'Biomedical Engineering Undergraduate Roadmap'),
  ('LIU', 'Engineering', 'Electrical Engineering', 'electrical_engineering', 'EENG', 'Electrical Engineering Undergraduate Roadmap'),
  ('LIU', 'Engineering', 'Architecture Engineering', 'architecture', 'AREN', 'Architecture Engineering Undergraduate Roadmap'),
  ('LIU', 'Business', 'International Business Management', 'business_admin', 'BUSN', 'International Business Management Undergraduate Roadmap'),
  ('LIU', 'Business', 'Accounting Information Systems', 'accounting', 'ACCT', 'Accounting Information Systems Undergraduate Roadmap'),
  ('LIU', 'Business', 'Management Information Systems', 'mis', 'MINS', 'Management Information Systems Undergraduate Roadmap'),
  ('LIU', 'Business', 'Banking and Finance', 'finance', 'FINA', 'Banking and Finance Undergraduate Roadmap'),
  ('LIU', 'Business', 'Marketing', 'marketing', 'MKTG', 'Marketing Undergraduate Roadmap'),
  ('LIU', 'Arts and Sciences', 'Graphic Design', 'design', 'GRDE', 'Graphic Design Undergraduate Roadmap'),
  ('LIU', 'Arts and Sciences', 'Interior Design', 'design', 'INDE', 'Interior Design Undergraduate Roadmap'),
  ('LIU', 'Arts and Sciences', 'Mathematics', 'mathematics', 'MATH', 'Mathematics Undergraduate Roadmap'),
  ('LIU', 'Arts and Sciences', 'Communication Arts', 'humanities', 'COMM', 'Communication Arts Undergraduate Roadmap'),
  ('LIU', 'Pharmacy and Medical Sciences', 'Clinical Pharmacy', 'pharmacy', 'PHAR', 'Clinical Pharmacy Undergraduate Roadmap'),
  ('LIU', 'Pharmacy and Medical Sciences', 'Biomedical Science', 'health_sciences', 'BMSC', 'Biomedical Science Undergraduate Roadmap'),
  ('LIU', 'Pharmacy and Medical Sciences', 'Nutrition and Dietetics', 'nutrition', 'NUTR', 'Nutrition and Dietetics Undergraduate Roadmap'),
  ('LIU', 'Education', 'Teaching English as a Second Language', 'education', 'EDUC', 'Teaching English as a Second Language Undergraduate Roadmap'),

  ('USJ', 'Informatique', 'Informatique', 'computer_science', 'INF ', 'Informatique Undergraduate Roadmap'),
  ('USJ', 'Informatique', 'Science des donnees', 'data_science', 'DS ', 'Science des donnees Undergraduate Roadmap'),
  ('USJ', 'Informatique', 'Cybersecurity', 'information_technology', 'CYB ', 'Cybersecurity Undergraduate Roadmap'),
  ('USJ', 'Engineering', 'Genie informatique et communications - Genie logiciel', 'software_engineering', 'GIC ', 'Genie logiciel Undergraduate Roadmap'),
  ('USJ', 'Engineering', 'Genie informatique et communications - Reseaux', 'communications_engineering', 'NET ', 'Reseaux Undergraduate Roadmap'),
  ('USJ', 'Engineering', 'Genie civil', 'civil_engineering', 'CIV ', 'Genie civil Undergraduate Roadmap'),
  ('USJ', 'Engineering', 'Genie electrique', 'electrical_engineering', 'ELEC ', 'Genie electrique Undergraduate Roadmap'),
  ('USJ', 'Engineering', 'Genie mecanique', 'mechanical_engineering', 'MEC ', 'Genie mecanique Undergraduate Roadmap'),
  ('USJ', 'Business and Management', 'Gestion et management', 'management', 'GEST ', 'Gestion et management Undergraduate Roadmap'),
  ('USJ', 'Business and Management', 'Bachelor in Business Administration', 'business_admin', 'BBA ', 'Business Administration Undergraduate Roadmap'),
  ('USJ', 'Business and Management', 'Finance and Accounting', 'finance', 'FIN ', 'Finance and Accounting Undergraduate Roadmap'),
  ('USJ', 'Business and Management', 'Marketing', 'marketing', 'MKT ', 'Marketing Undergraduate Roadmap'),
  ('USJ', 'Business and Management', 'Entrepreneurship and New Technologies', 'business_admin', 'ENT ', 'Entrepreneurship and New Technologies Undergraduate Roadmap'),
  ('USJ', 'Sciences', 'Biochemistry', 'basic_sciences', 'BCH ', 'Biochemistry Undergraduate Roadmap'),
  ('USJ', 'Sciences', 'Life and Earth Sciences', 'basic_sciences', 'SVT ', 'Life and Earth Sciences Undergraduate Roadmap'),
  ('USJ', 'Sciences', 'Mathematics', 'mathematics', 'MATH ', 'Mathematics Undergraduate Roadmap'),
  ('USJ', 'Medicine and Health Sciences', 'Medicine', 'medicine', 'MED ', 'Medicine Undergraduate Roadmap'),
  ('USJ', 'Medicine and Health Sciences', 'Nursing Sciences', 'nursing', 'NURS ', 'Nursing Sciences Undergraduate Roadmap'),
  ('USJ', 'Medicine and Health Sciences', 'Nutrition and Dietetics', 'nutrition', 'NUTR ', 'Nutrition and Dietetics Undergraduate Roadmap'),
  ('USJ', 'Medicine and Health Sciences', 'Physiotherapy', 'health_sciences', 'PHYS ', 'Physiotherapy Undergraduate Roadmap'),
  ('USJ', 'Law and Political Science', 'Law', 'law', 'DROIT ', 'Law Undergraduate Roadmap'),
  ('USJ', 'Law and Political Science', 'Political Science', 'political_science', 'POL ', 'Political Science Undergraduate Roadmap'),
  ('USJ', 'Humanities', 'Psychology', 'psychology', 'PSY ', 'Psychology Undergraduate Roadmap'),
  ('USJ', 'Humanities', 'Education', 'education', 'EDU ', 'Education Undergraduate Roadmap'),
  ('USJ', 'Humanities', 'Translation', 'translation', 'TRAD ', 'Translation Undergraduate Roadmap'),

  ('UOB', 'Computer Science', 'Computer Science - Software Engineering', 'software_engineering', 'CSC ', 'Computer Science - Software Engineering Undergraduate Roadmap'),
  ('UOB', 'Computer Science', 'Computer Science - Information Systems', 'information_technology', 'CIS ', 'Computer Science - Information Systems Undergraduate Roadmap'),
  ('UOB', 'Engineering', 'Chemical Engineering', 'chemical_engineering', 'CHE ', 'Chemical Engineering Undergraduate Roadmap'),
  ('UOB', 'Engineering', 'Civil Engineering', 'civil_engineering', 'CIE ', 'Civil Engineering Undergraduate Roadmap'),
  ('UOB', 'Engineering', 'Computer Engineering', 'computer_engineering', 'COE ', 'Computer Engineering Undergraduate Roadmap'),
  ('UOB', 'Engineering', 'Electrical Engineering', 'electrical_engineering', 'ELE ', 'Electrical Engineering Undergraduate Roadmap'),
  ('UOB', 'Engineering', 'Mechanical Engineering', 'mechanical_engineering', 'MEE ', 'Mechanical Engineering Undergraduate Roadmap'),
  ('UOB', 'Engineering', 'Engineering Management', 'industrial_engineering', 'EMG ', 'Engineering Management Undergraduate Roadmap'),
  ('UOB', 'Business and Management', 'Business Administration', 'business_admin', 'BUS ', 'Business Administration Undergraduate Roadmap'),
  ('UOB', 'Business and Management', 'Accounting and Auditing', 'accounting', 'ACC ', 'Accounting and Auditing Undergraduate Roadmap'),
  ('UOB', 'Business and Management', 'Banking and Finance', 'finance', 'FIN ', 'Banking and Finance Undergraduate Roadmap'),
  ('UOB', 'Business and Management', 'Management and Entrepreneurship', 'management', 'MGT ', 'Management and Entrepreneurship Undergraduate Roadmap'),
  ('UOB', 'Business and Management', 'Marketing and Innovation', 'marketing', 'MKT ', 'Marketing and Innovation Undergraduate Roadmap'),
  ('UOB', 'Business and Management', 'Economics', 'economics', 'ECO ', 'Economics Undergraduate Roadmap'),
  ('UOB', 'Business and Management', 'Tourism and Hotel Management', 'hospitality', 'THM ', 'Tourism and Hotel Management Undergraduate Roadmap'),
  ('UOB', 'Arts and Sciences', 'Biology', 'basic_sciences', 'BIO ', 'Biology Undergraduate Roadmap'),
  ('UOB', 'Arts and Sciences', 'Chemistry', 'basic_sciences', 'CHM ', 'Chemistry Undergraduate Roadmap'),
  ('UOB', 'Arts and Sciences', 'Mathematics', 'mathematics', 'MTH ', 'Mathematics Undergraduate Roadmap'),
  ('UOB', 'Arts and Sciences', 'English', 'humanities', 'ENG ', 'English Undergraduate Roadmap'),
  ('UOB', 'Arts and Sciences', 'Education', 'education', 'EDU ', 'Education Undergraduate Roadmap'),
  ('UOB', 'Health Sciences', 'Nursing', 'nursing', 'NUR ', 'Nursing Undergraduate Roadmap'),
  ('UOB', 'Health Sciences', 'Public Health', 'health_sciences', 'PUBH ', 'Public Health Undergraduate Roadmap'),
  ('UOB', 'Health Sciences', 'Medical Laboratory Sciences', 'health_sciences', 'MLS ', 'Medical Laboratory Sciences Undergraduate Roadmap'),
  ('UOB', 'Medicine and Medical Sciences', 'Medicine', 'medicine', 'MED ', 'Medicine Undergraduate Roadmap'),
  ('UOB', 'Medicine and Medical Sciences', 'Biomedical Sciences', 'health_sciences', 'BMS ', 'Biomedical Sciences Undergraduate Roadmap'),
  ('UOB', 'Architecture and Design', 'Architecture', 'architecture', 'ARC ', 'Architecture Undergraduate Roadmap'),
  ('UOB', 'Architecture and Design', 'Interior Design', 'design', 'INT ', 'Interior Design Undergraduate Roadmap'),
  ('UOB', 'Architecture and Design', 'Graphic Design', 'design', 'GRD ', 'Graphic Design Undergraduate Roadmap');

INSERT INTO major (department_id, name)
SELECT d.department_id, seed.major_name
FROM tmp_academic_major_seed seed
JOIN tmp_university_key uk ON uk.university_key = seed.university_key
JOIN department d
  ON d.university_id = uk.university_id
  AND LOWER(d.name) = LOWER(seed.department_name)
  AND d.is_active = 1
WHERE NOT EXISTS (
  SELECT 1
  FROM major m
  WHERE m.department_id = d.department_id
    AND LOWER(m.name) = LOWER(seed.major_name)
);

DROP TEMPORARY TABLE IF EXISTS tmp_academic_course_template;
CREATE TEMPORARY TABLE tmp_academic_course_template (
  major_group VARCHAR(64) NOT NULL,
  code_suffix VARCHAR(12) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  credits TINYINT UNSIGNED NOT NULL,
  language VARCHAR(20) NOT NULL DEFAULT 'English',
  level VARCHAR(32) NOT NULL DEFAULT 'undergraduate',
  year_number TINYINT UNSIGNED NOT NULL,
  semester VARCHAR(20) NOT NULL,
  sequence_order SMALLINT UNSIGNED NOT NULL,
  PRIMARY KEY (major_group, code_suffix)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tmp_academic_course_template (
  major_group, code_suffix, title, description, credits, language, level,
  year_number, semester, sequence_order
) VALUES
  ('computer_science', '101', 'Introduction to Programming', 'Problem solving, program design, variables, control flow, functions, arrays, testing, and debugging through a modern programming language.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('computer_science', '201', 'Object-Oriented Programming', 'Objects, classes, encapsulation, inheritance, polymorphism, exceptions, file processing, and modular application design.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('computer_science', '220', 'Discrete Structures', 'Logic, proofs, sets, relations, functions, counting, graphs, trees, and discrete models used in computing.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('computer_science', '301', 'Data Structures and Algorithms', 'Stacks, queues, lists, trees, hashing, graphs, sorting, searching, algorithm design, and complexity analysis.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('computer_science', '330', 'Database Systems', 'Entity relationship modeling, relational design, SQL, normalization, indexing, transactions, and database-backed applications.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('computer_science', '401', 'Operating Systems', 'Processes, threads, synchronization, scheduling, memory management, file systems, protection, and operating-system programming.', 3, 'English', 'undergraduate', 3, 'spring', 1),
  ('computer_science', '430', 'Computer Networks', 'Layered architectures, reliable transport, routing, switching, wireless networks, network services, and security fundamentals.', 3, 'English', 'undergraduate', 4, 'fall', 1),
  ('computer_science', '490', 'Senior Software Project', 'A team capstone that integrates requirements, design, implementation, testing, documentation, presentation, and deployment.', 3, 'English', 'undergraduate', 4, 'spring', 1),

  ('software_engineering', '101', 'Programming Fundamentals', 'Algorithmic thinking, structured programming, data representation, functions, arrays, debugging, and coding style.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('software_engineering', '210', 'Software Construction', 'Version control, modular design, object-oriented construction, APIs, code reviews, and automated testing practice.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('software_engineering', '250', 'Requirements Engineering', 'Stakeholder analysis, elicitation, use cases, user stories, modeling, validation, and requirements documentation.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('software_engineering', '320', 'Software Architecture and Design Patterns', 'Architectural styles, design principles, reusable patterns, quality attributes, and maintainable system structure.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('software_engineering', '360', 'Software Quality Assurance', 'Unit, integration, system, regression, and acceptance testing, test automation, quality metrics, and continuous integration.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('software_engineering', '490', 'Software Engineering Capstone', 'A full-cycle software project covering planning, design, implementation, testing, deployment, and professional documentation.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('data_science', '101', 'Programming for Data Science', 'Programming foundations for data work, including scripts, data structures, files, libraries, and reproducible notebooks.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('data_science', '210', 'Probability and Statistics for Data Science', 'Probability models, random variables, distributions, estimation, hypothesis testing, and statistical reasoning.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('data_science', '240', 'Data Management', 'Data modeling, SQL, data cleaning, transformation pipelines, warehouses, and responsible data handling.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('data_science', '310', 'Machine Learning', 'Regression, classification, clustering, model evaluation, feature engineering, and applied machine learning workflows.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('data_science', '350', 'Data Visualization', 'Visual encoding, dashboards, exploratory graphics, storytelling with data, and interactive visualization tools.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('data_science', '480', 'Data Science Capstone', 'A capstone analytics project from question framing and data acquisition through modeling, communication, and ethics.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('information_technology', '101', 'Information Technology Fundamentals', 'Computer systems, operating environments, networks, cloud services, security basics, and IT professional practice.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('information_technology', '210', 'Web Technologies', 'Client and server web development, markup, styling, scripting, HTTP, APIs, sessions, and secure deployment basics.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('information_technology', '240', 'Systems Administration', 'Operating system administration, shell scripting, users, services, backups, monitoring, and automation.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('information_technology', '310', 'Network Administration', 'Switching, routing, IP addressing, network services, wireless configuration, troubleshooting, and documentation.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('information_technology', '350', 'Information Security', 'Security principles, identity management, access control, cryptography basics, secure configuration, and incident response.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('information_technology', '470', 'IT Project', 'A practical IT project involving infrastructure planning, implementation, testing, documentation, and service handover.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('bioinformatics', '101', 'Introduction to Bioinformatics', 'Biological data types, sequence databases, alignment, genomic resources, and computational thinking for life sciences.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('bioinformatics', '210', 'Programming for Bioinformatics', 'Programming and scripting for biological data analysis, file formats, automation, and reproducible workflows.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('bioinformatics', '230', 'Molecular Biology for Bioinformatics', 'DNA, RNA, proteins, gene expression, molecular techniques, and biological foundations for computational analysis.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('bioinformatics', '310', 'Genomics and Sequence Analysis', 'Genome organization, sequence alignment, variant analysis, annotation, and comparative genomics.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('bioinformatics', '340', 'Biostatistics', 'Statistical methods for biological experiments, inference, regression, experimental design, and data interpretation.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('bioinformatics', '480', 'Bioinformatics Capstone', 'An applied project using computational methods to analyze biological or biomedical data.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('mathematics', '101', 'Calculus I', 'Limits, continuity, differentiation, applications of derivatives, integration, and mathematical reasoning.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('mathematics', '201', 'Calculus II', 'Techniques of integration, sequences, series, polar coordinates, and applications of integral calculus.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('mathematics', '220', 'Linear Algebra', 'Systems of equations, matrices, determinants, vector spaces, eigenvalues, eigenvectors, and linear transformations.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('mathematics', '310', 'Differential Equations', 'First-order and higher-order differential equations, systems, Laplace transforms, and mathematical modeling.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('mathematics', '330', 'Probability and Statistics', 'Probability, random variables, distributions, estimation, testing, regression, and statistical applications.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('mathematics', '420', 'Numerical Analysis', 'Numerical methods for equations, interpolation, differentiation, integration, linear systems, and error analysis.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('computer_engineering', '101', 'Introduction to Computer Engineering', 'Engineering design, computing systems, digital technologies, teamwork, ethics, and technical communication.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('computer_engineering', '220', 'Digital Logic Design', 'Number systems, Boolean algebra, combinational and sequential circuits, flip-flops, registers, and HDL basics.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('computer_engineering', '260', 'Electric Circuits', 'Circuit variables, Kirchhoff laws, nodal and mesh analysis, transient response, op-amps, and AC circuit analysis.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('computer_engineering', '320', 'Computer Organization', 'Instruction sets, datapaths, control, pipelining, memory hierarchy, I/O, and hardware software interaction.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('computer_engineering', '370', 'Microprocessors and Embedded Systems', 'Microcontroller architecture, assembly and C programming, interrupts, timers, peripherals, and embedded interfacing.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('computer_engineering', '430', 'Computer Networks', 'Network architectures, protocols, addressing, routing, switching, transport, applications, and network security.', 3, 'English', 'undergraduate', 3, 'spring', 1),
  ('computer_engineering', '490', 'Computer Engineering Senior Project', 'A capstone design project integrating hardware, software, testing, documentation, and public presentation.', 3, 'English', 'undergraduate', 4, 'spring', 1),

  ('communications_engineering', '101', 'Introduction to Communications Engineering', 'Signals, systems, communication services, spectrum, engineering design, and professional practice.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('communications_engineering', '240', 'Signals and Systems', 'Continuous and discrete signals, linear time-invariant systems, convolution, Fourier series, and Fourier transforms.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('communications_engineering', '300', 'Electronic Circuits', 'Diodes, transistors, amplifiers, biasing, small-signal models, and analog circuit applications.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('communications_engineering', '330', 'Analog and Digital Communications', 'Modulation, noise, information transmission, sampling, pulse coding, digital modulation, and link performance.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('communications_engineering', '410', 'Wireless and Mobile Networks', 'Cellular systems, wireless propagation, multiple access, mobility management, and modern mobile network services.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('communications_engineering', '490', 'Communications Engineering Senior Project', 'A capstone project in communications, networking, signal processing, or wireless systems.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('electrical_engineering', '101', 'Introduction to Electrical Engineering', 'Electrical engineering fields, basic circuits, measurement, design, ethics, and engineering communication.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('electrical_engineering', '210', 'Circuit Analysis', 'Resistive and dynamic circuits, dependent sources, operational amplifiers, transient response, and sinusoidal steady state.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('electrical_engineering', '260', 'Electronics', 'Semiconductor devices, diode circuits, BJTs, MOSFETs, amplifiers, biasing, and electronic circuit design.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('electrical_engineering', '320', 'Power Systems', 'Three-phase systems, transformers, power flow, transmission lines, protection, and electrical power distribution.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('electrical_engineering', '360', 'Control Systems', 'Modeling, feedback, stability, root locus, frequency response, and controller design.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('electrical_engineering', '490', 'Electrical Engineering Senior Project', 'A capstone design project in power, electronics, control, communications, or embedded electrical systems.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('civil_engineering', '101', 'Introduction to Civil Engineering', 'Civil engineering disciplines, infrastructure systems, design process, surveying basics, ethics, and safety.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('civil_engineering', '210', 'Engineering Mechanics', 'Statics, force systems, equilibrium, trusses, frames, friction, centroids, and moments of inertia.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('civil_engineering', '240', 'Surveying', 'Measurement, leveling, traversing, coordinate systems, mapping, site data, and field surveying practice.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('civil_engineering', '310', 'Structural Analysis', 'Analysis of beams, frames, trusses, deflection, influence lines, and structural behavior under loads.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('civil_engineering', '350', 'Geotechnical Engineering', 'Soil classification, compaction, permeability, consolidation, shear strength, foundations, and earth-retaining structures.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('civil_engineering', '490', 'Civil Engineering Senior Project', 'A capstone civil infrastructure project integrating analysis, design, management, sustainability, and presentation.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('mechanical_engineering', '101', 'Introduction to Mechanical Engineering', 'Mechanical systems, engineering design, CAD awareness, experimentation, teamwork, and professional ethics.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('mechanical_engineering', '210', 'Statics and Dynamics', 'Particle and rigid-body statics, kinematics, kinetics, work-energy, impulse-momentum, and engineering applications.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('mechanical_engineering', '250', 'Thermodynamics', 'Properties, first and second laws, cycles, entropy, energy conversion, and thermodynamic systems.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('mechanical_engineering', '310', 'Fluid Mechanics', 'Fluid properties, hydrostatics, control-volume analysis, pipe flow, dimensional analysis, and turbomachinery basics.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('mechanical_engineering', '360', 'Machine Design', 'Design of mechanical components, failure theories, fatigue, shafts, bearings, gears, and mechanical assemblies.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('mechanical_engineering', '490', 'Mechanical Engineering Senior Project', 'A capstone design-build project involving analysis, prototyping, testing, documentation, and presentation.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('chemical_engineering', '101', 'Introduction to Chemical Engineering', 'Material balances, process variables, chemical process industries, safety, sustainability, and engineering calculations.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('chemical_engineering', '220', 'Chemical Process Calculations', 'Material and energy balances for reacting and nonreacting systems, recycle, bypass, purge, and process units.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('chemical_engineering', '260', 'Transport Phenomena', 'Momentum, heat, and mass transfer fundamentals for chemical and process engineering systems.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('chemical_engineering', '330', 'Chemical Reaction Engineering', 'Reaction kinetics, reactor design, conversion, rate laws, catalysis, and ideal reactor models.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('chemical_engineering', '380', 'Process Control', 'Dynamic modeling, feedback control, instrumentation, controllers, stability, and process automation.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('chemical_engineering', '490', 'Chemical Engineering Design Project', 'A capstone process design project covering simulation, economics, safety, environmental impact, and presentation.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('industrial_engineering', '101', 'Introduction to Industrial Engineering', 'Systems thinking, productivity, operations, human factors, quality, analytics, and industrial engineering practice.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('industrial_engineering', '220', 'Engineering Economy', 'Time value of money, cost estimation, alternatives, depreciation, sensitivity, and economic decision analysis.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('industrial_engineering', '260', 'Operations Research', 'Linear programming, optimization models, sensitivity analysis, networks, integer programming, and decision support.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('industrial_engineering', '320', 'Quality Engineering', 'Statistical process control, process capability, acceptance sampling, quality systems, and continuous improvement.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('industrial_engineering', '360', 'Supply Chain Management', 'Forecasting, inventory, logistics, procurement, production planning, and supply-chain coordination.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('industrial_engineering', '490', 'Industrial Engineering Capstone', 'An applied project improving a system through analysis, optimization, implementation planning, and presentation.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('biomedical_engineering', '101', 'Introduction to Biomedical Engineering', 'Biomedical engineering fields, physiology, medical devices, design, ethics, safety, and healthcare technology.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('biomedical_engineering', '220', 'Biomedical Instrumentation', 'Sensors, measurement systems, bioelectric signals, amplifiers, filtering, safety, and clinical instrumentation.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('biomedical_engineering', '260', 'Biomaterials', 'Material properties, biocompatibility, polymers, metals, ceramics, degradation, and biomedical applications.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('biomedical_engineering', '330', 'Biomechanics', 'Mechanics of tissues, musculoskeletal systems, motion, stress, strain, and biomedical device design.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('biomedical_engineering', '360', 'Medical Imaging Systems', 'X-ray, CT, MRI, ultrasound, image formation, processing, safety, and diagnostic applications.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('biomedical_engineering', '490', 'Biomedical Engineering Capstone', 'A healthcare technology design project involving requirements, prototyping, testing, ethics, and presentation.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('petroleum_engineering', '101', 'Introduction to Petroleum Engineering', 'Petroleum systems, drilling, reservoirs, production, safety, environmental impact, and energy industry practice.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('petroleum_engineering', '220', 'Reservoir Engineering', 'Reservoir rock and fluid properties, material balance, flow in porous media, recovery, and reservoir performance.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('petroleum_engineering', '260', 'Drilling Engineering', 'Drilling systems, well planning, drilling fluids, hydraulics, casing, well control, and drilling safety.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('petroleum_engineering', '330', 'Production Engineering', 'Well performance, artificial lift, surface facilities, completion methods, stimulation, and production optimization.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('petroleum_engineering', '360', 'Petroleum Economics', 'Reserve estimation, project evaluation, risk, fiscal systems, pricing, and petroleum investment decisions.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('petroleum_engineering', '490', 'Petroleum Engineering Capstone', 'A reservoir, drilling, or production project integrating technical analysis, economics, safety, and presentation.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('renewable_energy', '101', 'Introduction to Renewable Energy', 'Energy systems, solar, wind, hydro, storage, efficiency, sustainability, and renewable energy policy.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('renewable_energy', '220', 'Solar Energy Systems', 'Solar radiation, photovoltaic cells, system components, sizing, grid connection, and performance evaluation.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('renewable_energy', '260', 'Wind Energy Systems', 'Wind resources, turbines, aerodynamics, generators, siting, control, and wind farm performance.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('renewable_energy', '330', 'Power Electronics for Energy Systems', 'Converters, inverters, control, grid integration, batteries, and renewable-energy power conditioning.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('renewable_energy', '360', 'Energy Storage and Smart Grids', 'Battery systems, storage sizing, smart-grid technologies, demand response, and distributed energy resources.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('renewable_energy', '490', 'Renewable Energy Capstone', 'A design project for a renewable-energy system with technical, economic, environmental, and social analysis.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('mechatronics', '101', 'Introduction to Mechatronics', 'Mechanical, electrical, and computing integration, sensors, actuators, control, design, and prototyping.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('mechatronics', '220', 'Sensors and Actuators', 'Sensor principles, signal conditioning, actuators, motors, measurement, calibration, and embedded interfaces.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('mechatronics', '260', 'Digital Control Systems', 'Discrete control, feedback, modeling, stability, controllers, and implementation in mechatronic systems.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('mechatronics', '330', 'Robotics', 'Robot kinematics, dynamics, sensing, path planning, control, and robotic applications.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('mechatronics', '360', 'Embedded Mechatronic Systems', 'Microcontrollers, real-time programming, electromechanical integration, communication, and system testing.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('mechatronics', '490', 'Mechatronics Capstone', 'A multidisciplinary capstone involving mechanical design, electronics, control, software, testing, and presentation.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('architecture', '101', 'Architectural Design Studio I', 'Foundational design studio exploring space, form, scale, context, representation, and design critique.', 4, 'English', 'undergraduate', 1, 'fall', 1),
  ('architecture', '120', 'Architectural Representation', 'Freehand drawing, orthographic projection, model making, digital representation, and visual communication.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('architecture', '210', 'Building Construction', 'Materials, assemblies, structural systems, detailing, building envelopes, and construction documentation.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('architecture', '260', 'History of Architecture', 'Architectural history, theory, cultural context, typologies, and precedent analysis.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('architecture', '330', 'Environmental Systems in Buildings', 'Thermal comfort, daylighting, ventilation, energy, sustainability, and building environmental performance.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('architecture', '490', 'Architectural Design Thesis', 'An integrative design project addressing context, program, technology, representation, and critical argument.', 4, 'English', 'undergraduate', 3, 'spring', 1),

  ('design', '101', 'Design Fundamentals', 'Visual principles, color, composition, typography, form, design process, critique, and portfolio development.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('design', '130', 'Drawing and Digital Media', 'Drawing, image editing, layout, vector graphics, digital production, and visual communication workflows.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('design', '210', 'Design Studio I', 'Applied studio projects developing concept, research, iteration, presentation, and critique skills.', 4, 'English', 'undergraduate', 2, 'fall', 1),
  ('design', '260', 'History of Design', 'Design movements, cultural contexts, visual culture, materials, production, and contemporary practice.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('design', '330', 'Branding and User Experience', 'Identity systems, user research, interaction flows, prototyping, usability, and visual communication.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('design', '490', 'Senior Design Project', 'A portfolio-level capstone developing research, concept, production, documentation, and public presentation.', 4, 'English', 'undergraduate', 3, 'spring', 1),

  ('business_admin', '101', 'Introduction to Business', 'Business functions, organizations, entrepreneurship, ethics, globalization, and the economic environment of firms.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('business_admin', '210', 'Principles of Management', 'Planning, organizing, leadership, control, decision making, teams, culture, and contemporary management practice.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('business_admin', '230', 'Business Statistics', 'Descriptive statistics, probability, sampling, estimation, hypothesis testing, regression, and business applications.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('business_admin', '310', 'Operations Management', 'Process design, capacity, forecasting, inventory, quality, supply chains, and operational improvement.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('business_admin', '360', 'Strategic Management', 'Industry analysis, competitive advantage, strategy formulation, implementation, governance, and business cases.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('business_admin', '490', 'Business Capstone', 'An integrative business project using analysis, strategy, finance, marketing, operations, and presentation skills.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('accounting', '101', 'Financial Accounting', 'Accounting cycle, statements, assets, liabilities, equity, revenue recognition, and financial reporting fundamentals.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('accounting', '210', 'Managerial Accounting', 'Cost behavior, budgeting, variance analysis, decision making, performance measurement, and responsibility accounting.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('accounting', '260', 'Intermediate Accounting', 'Revenue, receivables, inventories, long-lived assets, liabilities, equity, and financial statement presentation.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('accounting', '320', 'Auditing', 'Audit planning, evidence, internal control, risk assessment, sampling, audit reports, and professional ethics.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('accounting', '360', 'Taxation', 'Tax systems, income determination, deductions, compliance, planning, and local tax applications.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('accounting', '470', 'Accounting Information Systems', 'Transaction cycles, controls, databases, enterprise systems, documentation, and accounting technology.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('finance', '101', 'Principles of Finance', 'Time value of money, risk and return, financial statements, valuation, budgeting, and financial decision making.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('finance', '220', 'Corporate Finance', 'Capital budgeting, cost of capital, capital structure, payout policy, working capital, and corporate valuation.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('finance', '260', 'Financial Markets and Institutions', 'Money and capital markets, banks, central banking, financial instruments, regulation, and market structure.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('finance', '320', 'Investments', 'Securities, portfolio theory, asset pricing, bonds, equities, derivatives, and investment strategy.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('finance', '360', 'Banking Operations', 'Bank products, credit analysis, risk management, liquidity, compliance, and banking technology.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('finance', '470', 'International Finance', 'Exchange rates, international markets, hedging, multinational finance, balance of payments, and country risk.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('economics', '101', 'Microeconomics', 'Markets, supply and demand, elasticity, consumer choice, production, market structures, and public policy.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('economics', '201', 'Macroeconomics', 'National income, inflation, unemployment, money, banking, fiscal policy, monetary policy, and growth.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('economics', '260', 'Econometrics', 'Regression, inference, model specification, data analysis, forecasting, and empirical economic research.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('economics', '310', 'International Economics', 'Trade theory, trade policy, exchange rates, balance of payments, and international economic institutions.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('economics', '340', 'Development Economics', 'Economic development, poverty, inequality, institutions, education, health, migration, and policy evaluation.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('economics', '470', 'Applied Economics Seminar', 'Applied economic analysis of local and regional issues using theory, data, policy, and research writing.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('marketing', '101', 'Principles of Marketing', 'Consumer behavior, segmentation, targeting, positioning, product, pricing, channels, promotion, and marketing ethics.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('marketing', '220', 'Consumer Behavior', 'Motivation, perception, learning, attitudes, culture, groups, decision processes, and consumer research.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('marketing', '260', 'Marketing Research', 'Research design, sampling, surveys, qualitative methods, analysis, interpretation, and reporting.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('marketing', '310', 'Digital Marketing', 'Search, social media, content, analytics, email, mobile channels, campaigns, and online brand management.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('marketing', '350', 'Brand Management', 'Brand strategy, identity, equity, positioning, portfolios, communication, and brand performance measurement.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('marketing', '470', 'Marketing Strategy', 'Integrated marketing planning, competitive analysis, implementation, budgeting, metrics, and strategic cases.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('management', '101', 'Organizational Behavior', 'Individual behavior, motivation, teams, leadership, communication, culture, conflict, and organizational change.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('management', '220', 'Human Resource Management', 'Recruitment, selection, training, performance, compensation, labor relations, diversity, and HR strategy.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('management', '260', 'Entrepreneurship', 'Opportunity recognition, business models, customer discovery, validation, finance, growth, and entrepreneurial ecosystems.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('management', '310', 'Project Management', 'Scope, schedule, cost, risk, quality, communication, agile methods, and stakeholder management.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('management', '350', 'Leadership and Change', 'Leadership theories, power, influence, organizational change, culture, ethics, and transformation.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('management', '470', 'Management Consulting Project', 'A client-style project involving diagnosis, analysis, recommendations, implementation planning, and presentation.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('mis', '101', 'Information Systems in Business', 'Business processes, information systems, enterprise applications, data, digital transformation, and IS strategy.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('mis', '210', 'Business Programming', 'Programming logic, scripts, data handling, automation, and application development for business problems.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('mis', '260', 'Database Management', 'Data modeling, SQL, normalization, transactions, reporting, and database applications for organizations.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('mis', '320', 'Systems Analysis and Design', 'Requirements, process modeling, data modeling, interface design, implementation planning, and documentation.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('mis', '360', 'Enterprise Systems', 'ERP, CRM, SCM, business intelligence, integration, configuration, and enterprise process improvement.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('mis', '470', 'MIS Capstone', 'An information systems project integrating analysis, design, implementation, data, security, and business value.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('hospitality', '101', 'Introduction to Hospitality and Tourism', 'Hospitality sectors, tourism systems, guest service, sustainability, operations, and career pathways.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('hospitality', '210', 'Hotel Operations', 'Front office, housekeeping, rooms division, service standards, revenue, quality, and operational controls.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('hospitality', '240', 'Food and Beverage Management', 'Restaurant operations, menu planning, purchasing, service systems, cost control, and sanitation.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('hospitality', '310', 'Tourism Marketing', 'Destination marketing, tourism demand, segmentation, digital promotion, branding, and tourism experiences.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('hospitality', '350', 'Event Management', 'Event planning, budgeting, logistics, risk, sponsorship, production, and post-event evaluation.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('hospitality', '470', 'Hospitality Internship and Project', 'Supervised professional practice with reflective reporting and an applied improvement project.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('pharmacy', '101', 'Introduction to Pharmacy', 'Pharmacy profession, drug discovery, dosage forms, patient care, ethics, and healthcare systems.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('pharmacy', '220', 'Pharmaceutical Chemistry', 'Drug structures, physicochemical properties, medicinal chemistry principles, and structure activity relationships.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('pharmacy', '260', 'Pharmaceutics', 'Dosage forms, formulation, drug delivery, stability, compounding, and manufacturing principles.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('pharmacy', '330', 'Pharmacology', 'Drug actions, mechanisms, therapeutic uses, adverse effects, interactions, and clinical applications.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('pharmacy', '360', 'Clinical Pharmacy Practice', 'Medication therapy management, patient counseling, drug information, care planning, and interprofessional practice.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('pharmacy', '490', 'Pharmacy Practice Experience', 'Supervised experiential practice with patient care, dispensing, documentation, and professional reflection.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('health_sciences', '101', 'Introduction to Health Sciences', 'Healthcare systems, public health, human biology, ethics, research, and health professions.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('health_sciences', '210', 'Human Anatomy and Physiology', 'Structure and function of body systems, homeostasis, laboratory observation, and clinical relevance.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('health_sciences', '240', 'Epidemiology', 'Disease frequency, study designs, measures of association, bias, screening, and outbreak investigation.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('health_sciences', '310', 'Health Research Methods', 'Research design, ethics, sampling, data collection, analysis, and scientific reporting in health fields.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('health_sciences', '350', 'Healthcare Quality and Safety', 'Quality improvement, patient safety, risk management, accreditation, teamwork, and healthcare indicators.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('health_sciences', '470', 'Health Sciences Practicum', 'Field or laboratory practice integrating technical skills, ethics, documentation, and professional communication.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('nursing', '101', 'Foundations of Nursing', 'Nursing roles, patient-centered care, safety, communication, vital signs, assessment, and professional standards.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('nursing', '210', 'Health Assessment', 'Comprehensive assessment, interviewing, physical examination, documentation, clinical reasoning, and patient education.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('nursing', '240', 'Adult Health Nursing', 'Care of adults with common medical-surgical conditions, clinical judgment, medication safety, and interventions.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('nursing', '310', 'Maternal and Child Health Nursing', 'Nursing care for women, newborns, children, and families across health and illness contexts.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('nursing', '350', 'Community Health Nursing', 'Population health, health promotion, prevention, home care, community assessment, and public health nursing.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('nursing', '470', 'Nursing Leadership Practicum', 'Clinical leadership, delegation, quality, safety, evidence-based practice, and transition to professional nursing.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('nutrition', '101', 'Introduction to Nutrition', 'Nutrients, dietary guidelines, metabolism basics, food sources, health promotion, and nutrition assessment.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('nutrition', '210', 'Food Science', 'Food composition, processing, preservation, safety, quality, sensory evaluation, and food systems.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('nutrition', '240', 'Human Nutrition and Metabolism', 'Macronutrients, micronutrients, digestion, absorption, metabolism, energy balance, and nutritional requirements.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('nutrition', '310', 'Clinical Nutrition', 'Medical nutrition therapy, assessment, diet planning, counseling, and nutrition care for disease states.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('nutrition', '350', 'Community Nutrition', 'Nutrition programs, public health policy, food security, education, assessment, and community interventions.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('nutrition', '470', 'Nutrition Practicum', 'Supervised nutrition practice integrating assessment, counseling, program planning, ethics, and reporting.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('medicine', '101', 'Foundations of Medicine', 'Human biology, healthcare systems, professionalism, ethics, communication, and early clinical exposure.', 4, 'English', 'undergraduate', 1, 'fall', 1),
  ('medicine', '210', 'Human Anatomy', 'Gross anatomy, embryology basics, imaging anatomy, laboratory dissection, and clinical correlations.', 4, 'English', 'undergraduate', 1, 'spring', 1),
  ('medicine', '240', 'Physiology', 'Function of organ systems, homeostatic mechanisms, integration, laboratory measurement, and clinical application.', 4, 'English', 'undergraduate', 2, 'fall', 1),
  ('medicine', '310', 'Pathology', 'Mechanisms of disease, inflammation, neoplasia, organ pathology, and clinicopathologic correlation.', 4, 'English', 'undergraduate', 2, 'spring', 1),
  ('medicine', '350', 'Pharmacology for Medical Sciences', 'Drug mechanisms, therapeutic classes, adverse reactions, interactions, and clinical prescribing principles.', 4, 'English', 'undergraduate', 3, 'fall', 1),
  ('medicine', '470', 'Clinical Skills and Ethics', 'History taking, physical examination, clinical reasoning, communication, ethics, and patient safety.', 4, 'English', 'undergraduate', 3, 'spring', 1),

  ('law', '101', 'Introduction to Law', 'Legal systems, sources of law, legal reasoning, institutions, rights, obligations, and legal research.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('law', '210', 'Civil Law', 'Persons, obligations, contracts, liability, property concepts, and civil law reasoning.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('law', '240', 'Constitutional Law', 'Constitutional principles, state institutions, rights, judicial review, and constitutional interpretation.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('law', '310', 'Commercial Law', 'Merchants, companies, commercial transactions, negotiable instruments, insolvency, and business regulation.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('law', '350', 'Criminal Law', 'Offenses, criminal responsibility, defenses, sanctions, criminal procedure basics, and case analysis.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('law', '470', 'Legal Clinic and Research', 'Supervised legal research, client interviewing, drafting, ethics, advocacy, and public-interest practice.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('political_science', '101', 'Introduction to Political Science', 'Political institutions, ideologies, power, governance, comparative politics, and international relations.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('political_science', '210', 'Comparative Politics', 'Comparative methods, regimes, parties, elections, state formation, democratization, and political development.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('political_science', '240', 'International Relations', 'Theories of international relations, security, diplomacy, international organizations, conflict, and cooperation.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('political_science', '310', 'Public Policy', 'Policy process, agenda setting, analysis, implementation, evaluation, and public-sector decision making.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('political_science', '350', 'Middle East Politics', 'Political history, institutions, conflicts, social movements, regional relations, and contemporary policy issues.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('political_science', '470', 'Political Research Seminar', 'A research seminar using theory, methods, evidence, writing, and presentation in political science.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('humanities', '101', 'Academic Reading and Writing', 'Critical reading, argument, research, documentation, revision, and academic writing across disciplines.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('humanities', '210', 'Introduction to Humanities', 'Literature, history, philosophy, arts, culture, interpretation, and humanistic inquiry.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('humanities', '240', 'Communication Studies', 'Interpersonal, organizational, media, and intercultural communication theories and applied communication practice.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('humanities', '310', 'Research Methods in Humanities', 'Qualitative research, archives, textual analysis, ethics, interpretation, and scholarly writing.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('humanities', '350', 'Modern Arab Society and Culture', 'Modern cultural, social, and intellectual developments in Arab societies with emphasis on Lebanon and the region.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('humanities', '470', 'Senior Seminar in Humanities', 'An advanced seminar requiring independent research, critical analysis, writing, and oral presentation.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('psychology', '101', 'Introduction to Psychology', 'Biological, cognitive, developmental, social, personality, and clinical foundations of psychology.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('psychology', '210', 'Developmental Psychology', 'Human development from infancy through adulthood, including cognitive, emotional, social, and biological change.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('psychology', '240', 'Research Methods in Psychology', 'Experimental and nonexperimental methods, measurement, ethics, statistics basics, and psychological reporting.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('psychology', '310', 'Abnormal Psychology', 'Psychological disorders, assessment, diagnostic systems, etiology, treatment approaches, and stigma.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('psychology', '350', 'Social Psychology', 'Attitudes, persuasion, groups, prejudice, attraction, aggression, helping, and social influence.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('psychology', '470', 'Psychology Practicum', 'Applied observation or field experience with ethical reflection, supervision, reporting, and professional skills.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('education', '101', 'Foundations of Education', 'History, philosophy, sociology, policy, equity, curriculum, and the role of schools in society.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('education', '210', 'Educational Psychology', 'Learning theories, development, motivation, classroom management, assessment, and inclusive education.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('education', '240', 'Curriculum and Instruction', 'Curriculum design, instructional strategies, lesson planning, differentiation, and learning objectives.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('education', '310', 'Assessment and Evaluation', 'Classroom assessment, test construction, rubrics, feedback, grading, data use, and program evaluation.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('education', '350', 'Educational Technology', 'Digital learning tools, instructional media, online learning, accessibility, and technology integration.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('education', '470', 'Teaching Practicum', 'Supervised classroom practice with planning, teaching, assessment, reflection, and professional portfolio development.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('basic_sciences', '101', 'General Biology and Chemistry', 'Foundations of biological organization, chemistry of life, laboratory safety, measurement, and scientific reasoning.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('basic_sciences', '210', 'Cell Biology', 'Cell structure, membranes, organelles, signaling, metabolism, cell cycle, and laboratory methods.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('basic_sciences', '240', 'Organic Chemistry', 'Structure, bonding, stereochemistry, reaction mechanisms, functional groups, and synthesis basics.', 3, 'English', 'undergraduate', 2, 'fall', 1),
  ('basic_sciences', '310', 'Genetics', 'Mendelian genetics, molecular genetics, gene expression, inheritance, variation, and genetic technologies.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('basic_sciences', '350', 'Scientific Research Methods', 'Experimental design, literature review, data analysis, ethics, lab notebooks, and scientific communication.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('basic_sciences', '470', 'Senior Science Project', 'Independent laboratory or field research with proposal, analysis, written report, and oral presentation.', 3, 'English', 'undergraduate', 3, 'spring', 1),

  ('translation', '101', 'Introduction to Translation Studies', 'Translation theories, language transfer, equivalence, context, ethics, and professional translation practice.', 3, 'English', 'undergraduate', 1, 'fall', 1),
  ('translation', '210', 'Arabic-English Translation', 'Translation between Arabic and English across general, media, cultural, and academic texts.', 3, 'English', 'undergraduate', 1, 'spring', 1),
  ('translation', '240', 'French-Arabic Translation', 'Translation between French and Arabic with attention to terminology, style, grammar, and cultural context.', 3, 'French', 'undergraduate', 2, 'fall', 1),
  ('translation', '310', 'Specialized Translation', 'Legal, business, technical, medical, and institutional translation with terminology management.', 3, 'English', 'undergraduate', 2, 'spring', 1),
  ('translation', '350', 'Interpreting Skills', 'Consecutive interpreting, note-taking, memory, reformulation, public speaking, and professional conduct.', 3, 'English', 'undergraduate', 3, 'fall', 1),
  ('translation', '470', 'Translation Project', 'A supervised translation portfolio involving research, terminology, revision, quality assurance, and client-ready delivery.', 3, 'English', 'undergraduate', 3, 'spring', 1);

INSERT INTO course (
  code, title, description, credits, language, level, department_id
)
SELECT DISTINCT
  CONCAT(seed.code_prefix, template.code_suffix) AS code,
  template.title,
  template.description,
  template.credits,
  template.language,
  template.level,
  d.department_id
FROM tmp_academic_major_seed seed
JOIN tmp_university_key uk ON uk.university_key = seed.university_key
JOIN department d
  ON d.university_id = uk.university_id
  AND LOWER(d.name) = LOWER(seed.department_name)
  AND d.is_active = 1
JOIN tmp_academic_course_template template ON template.major_group = seed.major_group
WHERE NOT EXISTS (
  SELECT 1
  FROM course c
  WHERE c.department_id = d.department_id
    AND LOWER(c.code) = LOWER(CONCAT(seed.code_prefix, template.code_suffix))
);

INSERT INTO roadmap (
  major_id, level, title, total_credits, is_published, created_by
)
SELECT
  m.major_id,
  'undergraduate',
  seed.roadmap_title,
  SUM(template.credits),
  1,
  NULL
FROM tmp_academic_major_seed seed
JOIN tmp_university_key uk ON uk.university_key = seed.university_key
JOIN department d
  ON d.university_id = uk.university_id
  AND LOWER(d.name) = LOWER(seed.department_name)
  AND d.is_active = 1
JOIN major m
  ON m.department_id = d.department_id
  AND LOWER(m.name) = LOWER(seed.major_name)
  AND m.is_active = 1
JOIN tmp_academic_course_template template ON template.major_group = seed.major_group
WHERE NOT EXISTS (
  SELECT 1
  FROM roadmap r
  WHERE r.major_id = m.major_id
    AND r.level = 'undergraduate'
)
GROUP BY m.major_id, seed.roadmap_title;

INSERT IGNORE INTO roadmap_course (
  roadmap_id, course_id, year_number, semester, sequence_order
)
SELECT
  r.roadmap_id,
  c.course_id,
  template.year_number,
  template.semester,
  template.sequence_order
FROM tmp_academic_major_seed seed
JOIN tmp_university_key uk ON uk.university_key = seed.university_key
JOIN department d
  ON d.university_id = uk.university_id
  AND LOWER(d.name) = LOWER(seed.department_name)
  AND d.is_active = 1
JOIN major m
  ON m.department_id = d.department_id
  AND LOWER(m.name) = LOWER(seed.major_name)
  AND m.is_active = 1
JOIN roadmap r
  ON r.major_id = m.major_id
  AND r.level = 'undergraduate'
  AND r.created_by IS NULL
JOIN tmp_academic_course_template template ON template.major_group = seed.major_group
JOIN course c
  ON c.department_id = d.department_id
  AND LOWER(c.code) = LOWER(CONCAT(seed.code_prefix, template.code_suffix))
  AND c.deleted_at IS NULL;

UPDATE roadmap r
JOIN (
  SELECT
    r2.roadmap_id,
    SUM(c.credits) AS total_credits
  FROM tmp_academic_major_seed seed
  JOIN tmp_university_key uk ON uk.university_key = seed.university_key
  JOIN department d
    ON d.university_id = uk.university_id
    AND LOWER(d.name) = LOWER(seed.department_name)
    AND d.is_active = 1
  JOIN major m
    ON m.department_id = d.department_id
    AND LOWER(m.name) = LOWER(seed.major_name)
    AND m.is_active = 1
  JOIN roadmap r2
    ON r2.major_id = m.major_id
    AND r2.level = 'undergraduate'
    AND r2.created_by IS NULL
  JOIN roadmap_course rc ON rc.roadmap_id = r2.roadmap_id
  JOIN course c ON c.course_id = rc.course_id AND c.deleted_at IS NULL
  GROUP BY r2.roadmap_id
) totals ON totals.roadmap_id = r.roadmap_id
SET r.total_credits = totals.total_credits,
    r.is_published = 1;

DROP TEMPORARY TABLE IF EXISTS tmp_academic_course_template;
DROP TEMPORARY TABLE IF EXISTS tmp_academic_major_seed;
DROP TEMPORARY TABLE IF EXISTS tmp_academic_department_seed;
DROP TEMPORARY TABLE IF EXISTS tmp_university_key;

COMMIT;
SET FOREIGN_KEY_CHECKS = 1;
