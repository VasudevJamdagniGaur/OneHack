(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.SobekQuiz = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const LETTERS = ["A", "B", "C", "D"];
  const QUESTIONS = [
    {
      id: "approaching",
      prompt: "What is the safest action if floodwater is rapidly approaching your home?",
      correctKey: "higher",
      explanation: "Moving to higher ground or an official evacuation location reduces exposure to rapidly rising floodwater.",
      options: [
        { key: "higher", text: "Move to higher ground or an official evacuation location" },
        { key: "check-depth", text: "Go outside to check how deep the water is" },
        { key: "wait-river", text: "Wait beside the river until the water stops" },
        { key: "drive-through", text: "Drive through the floodwater before it gets deeper" },
      ],
    },
    {
      id: "moving-water",
      prompt: "Why should you avoid walking or driving through moving floodwater?",
      correctKey: "hidden-current",
      explanation: "Floodwater can conceal holes, debris, damaged roads, and strong currents. Even shallow moving water can be dangerous.",
      options: [
        { key: "hidden-current", text: "It can hide dangerous conditions and strong currents" },
        { key: "phones", text: "It always damages mobile phones" },
        { key: "permanent", text: "It makes roads permanently unusable" },
        { key: "sunset", text: "It only becomes dangerous after sunset" },
      ],
    },
    {
      id: "evacuation",
      prompt: "What should you do when an official evacuation order is issued for your area?",
      correctKey: "follow",
      explanation: "Official evacuation instructions are issued to move people away from areas considered unsafe.",
      options: [
        { key: "follow", text: "Follow the evacuation instructions and move to the designated safe location" },
        { key: "neighbours", text: "Wait until your neighbours leave first" },
        { key: "stay", text: "Stay home unless water enters the building" },
        { key: "ignore", text: "Ignore it if the weather looks clear" },
      ],
    },
    {
      id: "kit",
      prompt: "Which item is most useful to keep in a basic flood emergency kit?",
      correctKey: "water",
      explanation: "Safe drinking water is an essential emergency supply and should be included in a preparedness kit.",
      options: [
        { key: "water", text: "Drinking water" },
        { key: "decor", text: "Decorative items" },
        { key: "furniture", text: "Extra furniture" },
        { key: "glass", text: "Glass containers" },
      ],
    },
    {
      id: "electricity",
      prompt: "If electrical equipment or wiring has been exposed to floodwater, what should you do?",
      correctKey: "avoid",
      explanation: "Floodwater and electricity can create a serious electrocution hazard. Avoid contact and follow official or qualified electrical safety guidance.",
      options: [
        { key: "avoid", text: "Avoid touching it and keep away from the area" },
        { key: "touch", text: "Touch the equipment to check whether it still works" },
        { key: "pour", text: "Pour water over it to cool it down" },
        { key: "switch", text: "Switch appliances on one by one" },
      ],
    },
    {
      id: "before",
      prompt: "What is one of the most important things to do before a flood-prone period?",
      correctKey: "prepare",
      explanation: "Preparing supplies and knowing where to go before flooding occurs helps reduce confusion and delay during an emergency.",
      options: [
        { key: "prepare", text: "Prepare an emergency kit and know your evacuation route" },
        { key: "outside", text: "Store important documents outside in the open" },
        { key: "remove-water", text: "Remove all drinking water from your home" },
        { key: "wait", text: "Wait for flooding to begin before making a plan" },
      ],
    },
    {
      id: "source",
      prompt: "Which source should you prioritize when receiving an emergency flood warning?",
      correctKey: "official",
      explanation: "Official disaster-management authorities are the appropriate source for verified emergency warnings and instructions.",
      options: [
        { key: "official", text: "An official government disaster-management or emergency authority" },
        { key: "social", text: "An unverified social-media post" },
        { key: "anonymous", text: "An anonymous message" },
        { key: "forwarded", text: "A forwarded message with no source" },
      ],
    },
    {
      id: "after",
      prompt: "After a flood, why should you avoid entering floodwater unless authorities say it is safe?",
      correctKey: "hazards",
      explanation: "Floodwater can contain contaminants, debris, unstable surfaces, and electrical hazards even when those dangers are not visible.",
      options: [
        { key: "hazards", text: "Floodwater may contain contamination, debris, hidden hazards, or electrical dangers" },
        { key: "clean", text: "Floodwater is always clean after rainfall" },
        { key: "clear", text: "Floodwater is safe if it looks clear" },
        { key: "vehicles", text: "Floodwater only damages vehicles" },
      ],
    },
    {
      id: "vehicle",
      prompt: "If your vehicle reaches a flooded road and you cannot clearly determine whether it is safe to cross, what is the safest choice?",
      correctKey: "do-not-cross",
      explanation: "If the safety of the crossing is uncertain, entering the floodwater creates unnecessary risk. Use a safer route and follow official instructions.",
      options: [
        { key: "do-not-cross", text: "Do not attempt to cross and follow a safer route or official guidance" },
        { key: "accelerate", text: "Accelerate and cross quickly" },
        { key: "follow-car", text: "Follow the vehicle in front regardless of conditions" },
        { key: "stop-deep", text: "Stop in the deepest part and wait" },
      ],
    },
    {
      id: "purpose",
      prompt: "What is the main purpose of a flood early-warning system such as SobekAI?",
      correctKey: "warn-early",
      explanation: "An early-warning system helps identify and communicate increasing risk so people and authorities have more time to respond.",
      options: [
        { key: "warn-early", text: "Detect and communicate increasing flood risk early so people can take appropriate action" },
        { key: "guarantee", text: "Guarantee that flooding will never happen" },
        { key: "replace", text: "Replace emergency-response organizations" },
        { key: "control", text: "Control rivers and stop rainfall" },
      ],
    },
  ];

  function shuffle(items, random) {
    const copy = items.map((item) => ({ ...item }));
    const roll = random || Math.random;
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(roll() * (index + 1));
      const current = copy[index];
      copy[index] = copy[swap];
      copy[swap] = current;
    }
    return copy.map((option, index) => ({ ...option, letter: LETTERS[index] }));
  }

  function createSession(random) {
    return {
      index: 0,
      phase: "ask",
      picked: null,
      answers: [],
      questions: QUESTIONS.map((question) => ({
        id: question.id,
        prompt: question.prompt,
        explanation: question.explanation,
        correctKey: question.correctKey,
        options: shuffle(question.options, random),
      })),
    };
  }

  function current(session) {
    return session.questions[session.index];
  }

  function select(session, optionKey) {
    if (!session || session.phase !== "ask") return false;
    const question = current(session);
    if (!question.options.some((option) => option.key === optionKey)) return false;
    session.picked = optionKey;
    return true;
  }

  function submit(session) {
    if (!session || session.phase !== "ask" || !session.picked) return false;
    const question = current(session);
    session.answers[session.index] = {
      questionId: question.id,
      pickedKey: session.picked,
      correct: session.picked === question.correctKey,
    };
    session.phase = "review";
    return true;
  }

  function next(session) {
    if (!session || session.phase !== "review") return false;
    if (session.index >= session.questions.length - 1) {
      session.phase = "done";
      return true;
    }
    session.index += 1;
    session.phase = "ask";
    session.picked = null;
    return true;
  }

  function score(session) {
    const correct = session.answers.filter((answer) => answer && answer.correct).length;
    const answered = session.answers.filter(Boolean).length;
    return {
      correct,
      incorrect: answered - correct,
      total: QUESTIONS.length,
      percent: Math.round((correct / QUESTIONS.length) * 100),
    };
  }

  function band(correct) {
    if (correct >= 9) {
      return {
        title: "Flood Ready",
        body: "You have a strong understanding of flood safety and emergency preparedness.",
      };
    }
    if (correct >= 7) {
      return {
        title: "Good Preparedness",
        body: "You understand the key flood-safety principles, but there is still room to improve.",
      };
    }
    if (correct >= 5) {
      return {
        title: "Needs Improvement",
        body: "Review the Flood Academy lessons and try the quiz again.",
      };
    }
    return {
      title: "Learn Before You Respond",
      body: "Review the flood-safety guidance before relying on your current knowledge during an emergency.",
    };
  }

  return {
    QUESTIONS,
    createSession,
    current,
    select,
    submit,
    next,
    score,
    band,
  };
});
