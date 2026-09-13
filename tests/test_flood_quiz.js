const assert = require("assert");
const quiz = require("../app/frontend/site/assets/flood-quiz.js");

const ANSWER_KEY = {
  approaching: "higher",
  "moving-water": "hidden-current",
  evacuation: "follow",
  kit: "water",
  electricity: "avoid",
  before: "prepare",
  source: "official",
  after: "hazards",
  vehicle: "do-not-cross",
  purpose: "warn-early",
};

function play(session, pickCorrect) {
  while (session.phase !== "done") {
    const question = quiz.current(session);
    const choice = pickCorrect
      ? question.correctKey
      : question.options.find((option) => option.key !== question.correctKey).key;
    assert.strictEqual(quiz.submit(session), false);
    assert.strictEqual(quiz.next(session), false);
    assert.strictEqual(quiz.select(session, choice), true);
    assert.strictEqual(quiz.submit(session), true);
    const recorded = session.answers[session.index];
    assert.strictEqual(recorded.correct, choice === question.correctKey);
    assert.strictEqual(recorded.pickedKey, choice);
    quiz.next(session);
  }
}

assert.strictEqual(quiz.QUESTIONS.length, 10);
quiz.QUESTIONS.forEach((question) => {
  assert.strictEqual(question.options.length, 4);
  assert.strictEqual(question.options.filter((option) => option.key === question.correctKey).length, 1);
  assert.strictEqual(question.correctKey, ANSWER_KEY[question.id]);
  assert.ok(question.explanation.length > 20);
});

let flips = 0;
for (let run = 0; run < 30; run += 1) {
  const session = quiz.createSession();
  session.questions.forEach((question) => {
    assert.strictEqual(question.options.length, 4);
    assert.deepStrictEqual(question.options.map((option) => option.letter), ["A", "B", "C", "D"]);
    assert.strictEqual(question.options.filter((option) => option.key === question.correctKey).length, 1);
    if (question.options[0].key !== question.correctKey) flips += 1;
  });
}
assert.ok(flips > 0, "answer order should shuffle");

const perfect = quiz.createSession(() => 0.9);
play(perfect, true);
assert.deepStrictEqual(quiz.score(perfect), { correct: 10, incorrect: 0, total: 10, percent: 100 });
assert.strictEqual(quiz.band(10).title, "Flood Ready");
assert.strictEqual(quiz.band(9).title, "Flood Ready");
assert.strictEqual(quiz.band(8).title, "Good Preparedness");
assert.strictEqual(quiz.band(7).title, "Good Preparedness");
assert.strictEqual(quiz.band(6).title, "Needs Improvement");
assert.strictEqual(quiz.band(5).title, "Needs Improvement");
assert.strictEqual(quiz.band(4).title, "Learn Before You Respond");
assert.strictEqual(quiz.band(0).title, "Learn Before You Respond");

const missed = quiz.createSession(() => 0.1);
play(missed, false);
assert.strictEqual(quiz.score(missed).correct, 0);
assert.strictEqual(quiz.score(missed).incorrect, 10);

const retry = quiz.createSession();
quiz.select(retry, quiz.current(retry).options[0].key);
quiz.submit(retry);
const fresh = quiz.createSession();
assert.strictEqual(fresh.phase, "ask");
assert.strictEqual(fresh.index, 0);
assert.deepStrictEqual(fresh.answers, []);
assert.strictEqual(fresh.picked, null);

console.log("flood quiz checks passed");
