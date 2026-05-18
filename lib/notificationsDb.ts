// Notification table helpers for student-facing alerts.
import pool from "@/db";

let notificationTablesEnsured = false;

export async function ensureNotificationTables() {
  if (notificationTablesEnsured) return;

  await pool.query(`
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
        FOREIGN KEY (user_id) REFERENCES \`user\`(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  notificationTablesEnsured = true;
}

function courseSlug(code: string) {
  return code.trim().toLowerCase().replace(/\s+/g, "-");
}

export async function notifyStudentsAboutCourse({
  universityId,
  courseCode,
  courseTitle,
}: {
  universityId: number;
  courseCode: string;
  courseTitle: string;
}) {
  await ensureNotificationTables();

  await pool.query(
    `INSERT INTO notification (user_id, title, message, link)
      SELECT
        u.user_id,
        'New course added',
        ?,
        ?
      FROM \`user\` u
      WHERE u.university_id = ?
        AND u.role = 'student'
        AND u.deleted_at IS NULL`,
    [
      `${courseCode} - ${courseTitle} was added to your university courses.`,
      `/courses/${courseSlug(courseCode)}`,
      universityId,
    ],
  );
}
