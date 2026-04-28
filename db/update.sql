USE course_checker;

ALTER TABLE `user`
  MODIFY role ENUM('student','admin','super_admin') NOT NULL DEFAULT 'student';

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

