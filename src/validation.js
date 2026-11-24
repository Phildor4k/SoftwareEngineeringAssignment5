// Shared course and grade validation (REF-201).
// Used by TranscriptStore so addGrade, changeGrade and getGrade
// normalize and validate their inputs in exactly one place.

/** Trim and upper-case a course code. Never throws; may return "". */
export function normalizeCourse(course) {
  return String(course ?? "").trim().toUpperCase();
}

/** Like normalizeCourse, but rejects an empty course name. */
export function requireCourse(course) {
  const normalizedCourse = normalizeCourse(course);
  if (!normalizedCourse) {
    throw new Error("Course name is required");
  }
  return normalizedCourse;
}

/** Convert a grade to a number and require an integer from 0 to 100. */
export function requireGrade(grade) {
  const numericGrade = Number(grade);
  if (!Number.isInteger(numericGrade) || numericGrade < 0 || numericGrade > 100) {
    throw new Error("Grade must be an integer from 0 to 100");
  }
  return numericGrade;
}
