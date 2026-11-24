import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import { TranscriptStore } from "../src/transcriptStore.js";

describe("TranscriptStore", () => {
  let store;

  beforeEach(() => {
    store = new TranscriptStore();
  });

  test("adds students and returns their transcripts", () => {
    const studentID = store.addStudent("Ada");

    assert.equal(studentID, 1);
    assert.deepEqual(store.getTranscript(studentID), {
      student: { studentID, studentName: "Ada" },
      grades: [],
    });
  });

  test("adds and changes a course grade", () => {
    const studentID = store.addStudent("Lin");

    assert.deepEqual(store.addGrade(studentID, "cs360", "85"), {
      studentID,
      course: "CS360",
      grade: 85,
    });
    assert.deepEqual(store.changeGrade(studentID, "CS360", 92), {
      studentID,
      course: "CS360",
      grade: 92,
    });
  });

  test("rejects invalid student, course, and grade inputs", () => {
    const studentID = store.addStudent("Noah");

    assert.throws(() => store.addStudent("   "), /Student name is required/);
    assert.throws(() => store.addGrade(studentID, "", 90), /Course name is required/);
    assert.throws(
      () => store.addGrade(studentID, "CS360", 101),
      /Grade must be an integer from 0 to 100/,
    );
  });

  test("supports exact-name lookup and deletion", () => {
    const firstID = store.addStudent("Grace Lee");
    const secondID = store.addStudent("Grace Hall");

    assert.deepEqual(store.getStudentIDs("Grace Lee"), [firstID]);
    store.deleteStudent(secondID);
    assert.deepEqual(store.getStudentIDs(), [firstID]);
    assert.throws(() => store.deleteStudent(secondID), /Student not found/);
  });

  test("REF-201: addGrade and changeGrade share the same course and grade validation", () => {
    const studentID = store.addStudent("Ivy");
    store.addGrade(studentID, "CS360", 80);

    for (const write of [
      (course, grade) => store.addGrade(studentID, course, grade),
      (course, grade) => store.changeGrade(studentID, course, grade),
    ]) {
      assert.throws(() => write("   ", 90), /Course name is required/);
      assert.throws(() => write(undefined, 90), /Course name is required/);
      for (const badGrade of [-1, 101, 9.5, "abc", NaN]) {
        assert.throws(
          () => write("CS360", badGrade),
          /Grade must be an integer from 0 to 100/,
        );
      }
    }
    assert.equal(store.getGrade(studentID, " cs360 "), 80);
  });
});
