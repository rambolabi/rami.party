/* ==========================================================================
   Daybook — notes & tasks, saved locally.
   A leaner rewrite of the original Notes & Todo page.
   ========================================================================== */
(function () {
    'use strict';

    const KEY = {
        notes: 'daybook.notes',
        lastDay: 'daybook.lastDay',
        tasks: 'daybook.tasks',
        theme: 'daybook.theme',
    };

    const $ = (sel) => document.querySelector(sel);
    const store = {
        get(key, fallback) {
            try {
                const raw = localStorage.getItem(key);
                return raw === null ? fallback : JSON.parse(raw);
            } catch {
                return fallback;
            }
        },
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch { /* storage full or blocked — stay silent */ }
        },
    };

    /* ---- Elements ---- */
    const notesEl = $('#notes');
    const notesMeta = $('#notesMeta');
    const stampBtn = $('#stampBtn');
    const lastDay = $('#lastDay');
    const lastDayText = $('#lastDayText');

    const taskForm = $('#taskForm');
    const taskInput = $('#taskInput');
    const taskList = $('#taskList');
    const tasksMeta = $('#tasksMeta');
    const emptyTasks = $('#emptyTasks');

    const themeToggle = $('#themeToggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const newDayBtn = $('#newDayBtn');
    const toast = $('#toast');

    let tasks = store.get(KEY.tasks, []);

    /* ---- Toast ---- */
    let toastTimer;
    function notify(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    }

    /* ---- Theme ---- */
    function applyTheme(mode) {
        const dark = mode === 'dark';
        document.body.classList.toggle('dark', dark);
        themeIcon.textContent = dark ? '☀️' : '🌙';
        document.querySelector('meta[name="theme-color"]')
            ?.setAttribute('content', dark ? '#0d0f14' : '#f6f7f9');
    }
    function initTheme() {
        const saved = store.get(KEY.theme, null);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(saved || (prefersDark ? 'dark' : 'light'));
    }
    themeToggle.addEventListener('click', () => {
        const next = document.body.classList.contains('dark') ? 'light' : 'dark';
        store.set(KEY.theme, next);
        applyTheme(next);
    });

    /* ---- Notes ---- */
    function countWords(text) {
        const t = text.trim();
        return t ? t.split(/\s+/).length : 0;
    }
    function updateNotesMeta() {
        const words = countWords(notesEl.value);
        notesMeta.textContent = `${words} word${words === 1 ? '' : 's'}`;
    }
    function loadNotes() {
        notesEl.value = store.get(KEY.notes, '');
        updateNotesMeta();
    }
    notesEl.addEventListener('input', () => {
        store.set(KEY.notes, notesEl.value);
        updateNotesMeta();
    });

    function insertTimestamp() {
        const stamp = new Date().toLocaleString(undefined, {
            weekday: 'short', year: 'numeric', month: 'short',
            day: 'numeric', hour: '2-digit', minute: '2-digit',
        });
        const val = notesEl.value;
        const needsBreak = val.length && !val.endsWith('\n');
        notesEl.value = `${val}${needsBreak ? '\n' : ''}${stamp}\n`;
        store.set(KEY.notes, notesEl.value);
        updateNotesMeta();
        notesEl.focus();
        notesEl.selectionStart = notesEl.selectionEnd = notesEl.value.length;
    }
    stampBtn.addEventListener('click', insertTimestamp);

    /* ---- Last day's notes ---- */
    function loadLastDay() {
        const text = store.get(KEY.lastDay, '');
        if (text.trim()) {
            lastDayText.textContent = text;
            lastDay.hidden = false;
        } else {
            lastDay.hidden = true;
        }
    }

    /* ---- Tasks ---- */
    function saveTasks() {
        store.set(KEY.tasks, tasks);
    }
    function updateTasksMeta() {
        const done = tasks.filter(t => t.done).length;
        tasksMeta.textContent = `${done} of ${tasks.length} done`;
        emptyTasks.style.display = tasks.length ? 'none' : 'block';
    }
    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task' + (task.done ? ' done' : '');

            const check = document.createElement('input');
            check.type = 'checkbox';
            check.className = 'check';
            check.checked = task.done;
            check.setAttribute('aria-label', task.done ? 'Mark task not done' : 'Mark task done');
            check.addEventListener('change', () => {
                tasks[index].done = check.checked;
                li.classList.toggle('done', check.checked);
                saveTasks();
                updateTasksMeta();
            });

            const label = document.createElement('span');
            label.className = 'label';
            label.textContent = task.text;
            label.addEventListener('click', () => check.click());

            const del = document.createElement('button');
            del.className = 'del';
            del.type = 'button';
            del.innerHTML = '&times;';
            del.title = 'Delete task';
            del.setAttribute('aria-label', 'Delete task');
            del.addEventListener('click', () => {
                tasks.splice(index, 1);
                saveTasks();
                renderTasks();
            });

            li.append(check, label, del);
            taskList.appendChild(li);
        });
        updateTasksMeta();
    }
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (!text) return;
        tasks.push({ text, done: false });
        saveTasks();
        renderTasks();
        taskInput.value = '';
        taskInput.focus();
    });

    /* ---- New day ---- */
    newDayBtn.addEventListener('click', () => {
        const hasNotes = notesEl.value.trim().length > 0;
        const doneCount = tasks.filter(t => t.done).length;
        if (!hasNotes && !doneCount) {
            notify('Nothing to archive yet');
            return;
        }
        const ok = confirm(
            "Start a new day?\n\n• Today's notes move to “Yesterday's notes”\n• Completed tasks are cleared\n• Unfinished tasks stay"
        );
        if (!ok) return;

        store.set(KEY.lastDay, notesEl.value);
        notesEl.value = '';
        store.set(KEY.notes, '');
        updateNotesMeta();

        tasks = tasks.filter(t => !t.done);
        saveTasks();
        renderTasks();
        loadLastDay();
        lastDay.open = false;
        notify('Fresh day started ✦');
    });

    /* ---- Global shortcuts ---- */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.activeElement !== taskInput) {
            e.preventDefault();
            insertTimestamp();
        }
    });

    /* ---- Init ---- */
    initTheme();
    loadNotes();
    loadLastDay();
    renderTasks();
})();
