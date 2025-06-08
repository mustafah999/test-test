
async function fetchQuestion() {
  document.getElementById("nextBtn").disabled = true;
  const prompt = `
أنت منشئ أسئلة لعبة فكاهية ذكية على نمط "اختبار الغباء المتقدم"، المطلوب منك توليد سؤال واحد فقط في كل مرة، ويجب أن يكون السؤال:
- فيه طابع فكاهي وذكي بنفس الوقت (مش سخيف)
- يتضمن مراوغة أو خُدعة ذكية بسيطة
- غير مكرر وغير مباشر
- يحتوي على 4 خيارات (أ. ب. ج. د.)
- يتضمن الجواب الصحيح + تفسير ساخر أو ظريف يوضح الفكرة

⬇️ صيغة الإخراج المطلوبة:
السؤال: [السؤال هنا]؟
أ. [خيار أ]
ب. [خيار ب]
ج. [خيار ج]
د. [خيار د]
الجواب الصحيح: [أ / ب / ج / د]
التفسير: [تفسير مضحك أو ذكي يوضح لماذا هذا هو الجواب الصحيح]

📌 الآن، أنشئ سؤالًا جديدًا بنفس المستوى.
`;

  try {
    const res = await fetch("https://api.puter.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.choices[0].message.content;

    displayQuestion(text);
  } catch (error) {
    document.getElementById("question").innerText = "فشل توليد السؤال!";
    console.error(error);
  }
}

function displayQuestion(text) {
  const lines = text.trim().split("
");
  const questionText = lines.find((l) => l.startsWith("السؤال:")).split("السؤال:")[1].trim();
  const options = ["أ", "ب", "ج", "د"].map(letter => {
    const line = lines.find((l) => l.startsWith(`${letter}.`));
    return line ? { letter, text: line.split(`${letter}.`)[1].trim() } : null;
  });
  const correct = lines.find((l) => l.startsWith("الجواب الصحيح:")).split(":")[1].trim();
  const explanation = lines.find((l) => l.startsWith("التفسير:")).split(":")[1].trim();

  document.getElementById("question").innerText = questionText;
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.innerText = `${opt.letter}. ${opt.text}`;
    btn.onclick = () => checkAnswer(btn, opt.letter, correct, explanation);
    optionsDiv.appendChild(btn);
  });
}

function checkAnswer(button, selected, correct, explanation) {
  document.querySelectorAll(".option").forEach(btn => {
    btn.disabled = true;
    if (btn.innerText.startsWith(correct)) btn.classList.add("correct");
    if (btn.innerText.startsWith(selected) && selected !== correct) btn.classList.add("wrong");
  });
  document.getElementById("nextBtn").disabled = false;
  showPopup(explanation);
}

function showPopup(explanation) {
  document.getElementById("explanation").innerText = explanation;
  document.getElementById("popup").classList.remove("hidden");
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}

document.getElementById("nextBtn").addEventListener("click", () => {
  fetchQuestion();
});

fetchQuestion();
