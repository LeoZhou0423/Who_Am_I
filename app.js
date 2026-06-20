const STORAGE_KEY = 'doodle-self-state-v1';

const state = {
  current: 'landing',
  selected: new Set(),
  quiz: {
    scaleIds: [],
    scaleIndex: 0,
    questionIndex: 0,
    answers: {}
  },
  results: null,
  writing: Array(20).fill('')
};

class ScoringEngine {
  calculate(scaleId, answers) {
    const scale = SCALES.find((s) => s.id === scaleId);
    if (!scale) return null;

    if (scale.id === 'bigfive') {
      const dims = {};
      scale.dimensions.forEach((d) => (dims[d.key] = { sum: 0, count: 0 }));
      scale.questions.forEach((q, idx) => {
        let score = answers[idx];
        if (q.reverse) score = 6 - score;
        dims[q.dim].sum += score;
        dims[q.dim].count += 1;
      });
      const result = {};
      const details = [];
      scale.dimensions.forEach((d) => {
        const avg = dims[d.key].sum / dims[d.key].count;
        result[d.key] = parseFloat(avg.toFixed(2));
        details.push({ key: d.key, name: d.name, avg, color: d.color });
      });
      return { result, details, raw: null, avg: null, ...scale.scoring.interpret(result) };
    }

    if (scale.id === 'mlq') {
      const dims = {};
      scale.dimensions.forEach((d) => (dims[d.key] = 0));
      scale.questions.forEach((q, idx) => {
        dims[q.dim] += answers[idx];
      });
      const result = {};
      const details = [];
      scale.dimensions.forEach((d) => {
        result[d.key] = dims[d.key];
        details.push({ key: d.key, name: d.name, total: dims[d.key], color: d.color });
      });
      return { result, details, raw: null, avg: null, ...scale.scoring.interpret(result) };
    }

    let total = 0;
    scale.questions.forEach((q, idx) => {
      let score = answers[idx];
      if (q.reverse) score = 6 - score;
      total += score;
    });
    const avg = (total / scale.questions.length).toFixed(2);
    return { raw: total, avg, result: null, details: null, ...scale.scoring.interpret(total) };
  }
}

const scoring = new ScoringEngine();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.selected) state.selected = new Set(saved.selected);
    if (saved.quiz) state.quiz = saved.quiz;
    if (saved.results) state.results = saved.results;
    if (saved.writing) state.writing = saved.writing;
  } catch (e) {
    console.warn('读取本地记录失败', e);
  }
}

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selected: Array.from(state.selected),
        quiz: state.quiz,
        results: state.results,
        writing: state.writing
      })
    );
  } catch (e) {
    console.warn('保存本地记录失败', e);
  }
}

function showScreen(name) {
  if (state.current === name) return;
  const prev = document.querySelector('.screen.active');
  const next = document.getElementById('screen-' + name);
  if (!next) return;

  if (prev) {
    prev.classList.add('leaving');
    prev.classList.remove('active');
    setTimeout(() => {
      prev.classList.remove('leaving');
      prev.style.display = 'none';
    }, 400);
  }

  next.style.display = 'flex';
  next.offsetHeight;
  next.classList.add('active');
  state.current = name;

  requestAnimationFrame(() => {
    sketchAllBorders();
    if (name === 'result') drawResultCharts();
  });
}

function renderMenu() {
  const container = document.getElementById('scale-menu');
  container.innerHTML = '';

  SCALES.forEach((scale) => {
    const card = document.createElement('div');
    card.className = 'scale-card sketch-border';
    card.dataset.id = scale.id;
    if (state.selected.has(scale.id)) card.classList.add('selected');

    card.innerHTML = `
      <svg class="check-mark" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="var(--ink-blue)" stroke="var(--ink-primary)" stroke-width="2"/>
        <path d="M7 12l4 4 6-7" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div class="icon">${scale.icon}</div>
      <h3>${scale.name}</h3>
      <p class="sub">${scale.sub}</p>
      <p class="desc">${scale.desc}</p>
    `;

    card.addEventListener('click', () => {
      if (state.selected.has(scale.id)) state.selected.delete(scale.id);
      else state.selected.add(scale.id);
      renderMenu();
      updateBeginButton();
      saveState();
    });

    container.appendChild(card);
  });

  updateBeginButton();
  requestAnimationFrame(() => sketchAllBorders());
}

function updateBeginButton() {
  const btn = document.querySelector('[data-action="begin-quiz"]');
  btn.disabled = state.selected.size === 0;
}

function startQuiz() {
  if (state.selected.size === 0) return;
  state.quiz.scaleIds = Array.from(state.selected);
  state.quiz.scaleIndex = 0;
  state.quiz.questionIndex = 0;
  state.quiz.answers = {};
  state.quiz.scaleIds.forEach((id) => (state.quiz.answers[id] = []));
  state.results = null;
  saveState();
  showScreen('quiz');
  renderQuestion();
}

function currentScale() {
  return SCALES.find((s) => s.id === state.quiz.scaleIds[state.quiz.scaleIndex]);
}

function renderQuestion() {
  const scale = currentScale();
  const qIndex = state.quiz.questionIndex;
  const question = scale.questions[qIndex];
  const answers = state.quiz.answers[scale.id];

  document.getElementById('quiz-scale-name').textContent = `${scale.icon} ${scale.name}`;
  document.getElementById('quiz-progress-text').textContent = `${qIndex + 1} / ${scale.questions.length}`;
  document.getElementById('question-text').textContent = question.text;

  const optionsEl = document.getElementById('options');
  optionsEl.innerHTML = '';

  scale.options.forEach((opt, idx) => {
    const btn = document.createElement('div');
    btn.className = 'option';
    if (answers[qIndex] === opt.score) {
      btn.classList.add('selected');
    }
    btn.innerHTML = `<span class="opt-key">${idx + 1}</span><span>${opt.label}</span>`;
    btn.addEventListener('click', () => selectOption(opt.score));
    optionsEl.appendChild(btn);
  });

  requestAnimationFrame(() => {
    sketchBorder(document.querySelector('.question-card'), { fill: '#ffffff', fillStyle: 'solid' });
    document.querySelectorAll('.option.selected').forEach((el) => drawOptionCircle(el));
    drawProgressBar();
  });
}

function drawProgressBar() {
  const scale = currentScale();
  const progress = (state.quiz.questionIndex + 1) / scale.questions.length;
  drawProgress(document.getElementById('progress-canvas'), progress, { stroke: '#ff6b6b' });
}

function selectOption(score) {
  const scale = currentScale();
  state.quiz.answers[scale.id][state.quiz.questionIndex] = score;
  saveState();
  renderQuestion();

  setTimeout(() => {
    if (state.quiz.questionIndex < scale.questions.length - 1) {
      state.quiz.questionIndex += 1;
      renderQuestion();
    } else {
      finishScale();
    }
  }, 280);
}

function prevQuestion() {
  if (state.quiz.questionIndex > 0) {
    state.quiz.questionIndex -= 1;
    renderQuestion();
  }
}

function finishScale() {
  if (state.quiz.scaleIndex < state.quiz.scaleIds.length - 1) {
    state.quiz.scaleIndex += 1;
    state.quiz.questionIndex = 0;
    saveState();
    renderQuestion();
  } else {
    computeResults();
    showScreen('result');
  }
}

function computeResults() {
  state.results = {};
  state.quiz.scaleIds.forEach((id) => {
    state.results[id] = scoring.calculate(id, state.quiz.answers[id]);
  });
  saveState();
}

function renderResults() {
  const panels = document.getElementById('result-panels');
  panels.innerHTML = '';

  if (!state.results) return;

  state.quiz.scaleIds.forEach((id) => {
    const scale = SCALES.find((s) => s.id === id);
    const result = state.results[id];
    const panel = document.createElement('div');
    panel.className = 'result-panel sketch-border';
    panel.dataset.scale = id;

    let scoreHtml = '';
    if (result.raw !== null) {
      scoreHtml = `<span class="score">${result.raw}</span><span>分（平均 ${result.avg}）</span>`;
    } else if (scale.id === 'bigfive') {
      scoreHtml = `<span class="score">${scale.dimensions.map((d) => `${d.name} ${result.result[d.key]}`).join(' · ')}</span>`;
    } else if (scale.id === 'mlq') {
      scoreHtml = `<span class="score">拥有意义 ${result.result.presence} · 寻求意义 ${result.result.search}</span>`;
    }

    panel.innerHTML = `
      <h3>${scale.icon} ${scale.name}</h3>
      <div class="score-line">
        ${scoreHtml}
        <span class="level" style="background:${result.color}">${result.level}</span>
      </div>
      <p class="interpret">${result.text}</p>
      ${scale.id === 'bigfive' ? '<canvas class="result-chart" width="320" height="280"></canvas>' : ''}
      ${scale.id === 'mlq' ? '<canvas class="result-chart" width="320" height="240"></canvas>' : ''}
    `;

    panels.appendChild(panel);
  });

  requestAnimationFrame(() => {
    sketchAllBorders();
    drawResultCharts();
  });
}

function drawResultCharts() {
  if (!state.results) return;
  const panels = document.getElementById('result-panels');

  state.quiz.scaleIds.forEach((id) => {
    const scale = SCALES.find((s) => s.id === id);
    const result = state.results[id];
    const panel = panels.querySelector(`[data-scale="${id}"]`);
    if (!panel) return;

    if (scale.id === 'bigfive') {
      const canvas = panel.querySelector('canvas');
      const data = scale.dimensions.map((d) => parseFloat((result.result[d.key] * 2).toFixed(1)));
      const labels = scale.dimensions.map((d) => d.name);
      const colors = scale.dimensions.map((d) => d.color);
      drawRadarChart(canvas, data, labels, { max: 10, colors, fill: 'rgba(78, 205, 196, 0.2)', stroke: '#4ecdc4' });
    }

    if (scale.id === 'mlq') {
      const canvas = panel.querySelector('canvas');
      const data = [result.result.presence, result.result.search];
      const labels = ['拥有意义', '寻求意义'];
      const colors = scale.dimensions.map((d) => d.color);
      drawBarChart(canvas, data, labels, { max: 25, colors });
    }
  });
}

function renderWriting() {
  const list = document.getElementById('i-am-list');
  list.innerHTML = '';
  state.writing.forEach((val, idx) => {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'i-am-input';
    input.placeholder = `我是……`;
    input.value = val;
    input.dataset.index = idx;
    input.addEventListener('input', (e) => {
      state.writing[idx] = e.target.value;
      saveState();
    });
    list.appendChild(input);
  });
}

function analyzeWords() {
  const panel = document.getElementById('wordcloud-panel');
  const content = document.getElementById('wordcloud-content');
  panel.classList.remove('hidden');
  content.innerHTML = '';

  const texts = state.writing.filter(Boolean);
  if (texts.length === 0) {
    content.innerHTML = '<p>还没写内容，先写几句吧。</p>';
    return;
  }

  const freq = {};
  texts.forEach((text) => {
    text
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 2)
      .forEach((w) => {
        freq[w] = (freq[w] || 0) + 1;
      });
  });

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20);
  if (sorted.length === 0) {
    content.innerHTML = '<p>关键词不够多，再多写几句。</p>';
    return;
  }

  sorted.forEach(([word, count]) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.style.fontSize = Math.max(0.9, Math.min(1.6, 0.9 + count * 0.12)) + 'rem';
    span.textContent = `${word} ${count}`;
    content.appendChild(span);
  });

  requestAnimationFrame(() => sketchBorder(panel, { fill: '#ffffff', fillStyle: 'solid' }));
}

function saveImage() {
  const panels = document.getElementById('result-panels');
  if (!panels || panels.children.length === 0) return;

  html2canvas(panels, { scale: 2, backgroundColor: '#fdfbf7' }).then((canvas) => {
    const link = document.createElement('a');
    link.download = `我是谁测评_${new Date().toLocaleDateString()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

function resetAll() {
  state.selected = new Set();
  state.quiz = { scaleIds: [], scaleIndex: 0, questionIndex: 0, answers: {} };
  state.results = null;
  state.writing = Array(20).fill('');
  localStorage.removeItem(STORAGE_KEY);
  renderMenu();
  showScreen('landing');
}

function bindActions() {
  document.getElementById('app').addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (!action) return;

    switch (action) {
      case 'start':
        showScreen('menu');
        break;
      case 'select-all':
        SCALES.forEach((s) => state.selected.add(s.id));
        renderMenu();
        saveState();
        break;
      case 'begin-quiz':
        startQuiz();
        break;
      case 'prev':
        prevQuestion();
        break;
      case 'quit':
        showScreen('menu');
        break;
      case 'restart':
        resetAll();
        break;
      case 'writing':
        showScreen('writing');
        break;
      case 'back-result':
        showScreen('result');
        break;
      case 'analyze':
        analyzeWords();
        break;
      case 'save-image':
        saveImage();
        break;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (state.current !== 'quiz') return;
    const key = e.key;
    if (/^[1-5]$/.test(key)) {
      selectOption(parseInt(key, 10));
    } else if (key === 'ArrowLeft') {
      prevQuestion();
    }
  });
}

function init() {
  loadState();
  renderMenu();
  renderWriting();
  bindActions();

  if (state.results && state.quiz.scaleIds.length > 0) {
    renderResults();
  }

  if (state.current && state.current !== 'landing') {
    showScreen(state.current);
  } else {
    showScreen('landing');
  }
}

init();
