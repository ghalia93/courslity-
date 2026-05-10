// Persists roadmap records and related course assignments.
import pool from "@/db";

let ensurePromise: Promise<void> | null = null;

async function createRoadmapTables() {
  await pool.query(`
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

  await pool.query(`
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

  await pool.query(`
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

export async function ensureRoadmapTables() {
  if (!ensurePromise) {
    ensurePromise = createRoadmapTables().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }

  return ensurePromise;
}

