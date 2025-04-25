 const firebaseConfig = {
    apiKey: "AIzaSyD_s1qYFW00kgDKalSr_vwEkCxtvgHKMKY",
    authDomain: "check-list-archeage.firebaseapp.com",
    databaseURL: "https://check-list-archeage-default-rtdb.firebaseio.com/",
    projectId: "check-list-archeage",
    storageBucket: "check-list-archeage.firebasestorage.app",
    messagingSenderId: "189792073386",
    appId: "1:189792073386:web:b982dc9463dd00329902d3"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const defaultTasks = ["Задание 1", "Задание 2", "Задание 3"];

  const dayButtonsDiv = document.getElementById('day-buttons');
  const taskListDiv = document.getElementById('task-list');
  const userSelect = document.getElementById('user');
  const addTaskBtn = document.getElementById('add-task-btn');
  const newTaskInput = document.getElementById('new-task');

  let selectedDay = 'Пн';

  // создаем кнопки дней недели
  daysOfWeek.forEach(day => {
    const btn = document.createElement('button');
    btn.textContent = day;
    btn.className = 'day-btn';
    if (day === selectedDay) btn.classList.add('active');
    btn.addEventListener('click', () => {
      selectedDay = day;
      renderDays();
      loadTasks();
    });
    dayButtonsDiv.appendChild(btn);
  });

  function renderDays() {
    const buttons = document.querySelectorAll('.day-btn');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.textContent === selectedDay);
    });
  }

  function loadTasks() {
    const user = userSelect.value;
    
    // Проверка и сброс задач, если прошла неделя
    checkAndReset(user);

    const ref = db.ref(`checklist/${user}/${selectedDay}`);
    ref.once('value', snapshot => {
      let tasks = snapshot.val();
      if (!tasks) {
        tasks = defaultTasks.map(text => ({ text, done: false }));
        ref.set(tasks);
      }
      renderTasks(tasks);
    });
  }

  function renderTasks(tasks) {
    taskListDiv.innerHTML = '';
    tasks.forEach((task, index) => {
      const div = document.createElement('div');
      div.className = 'task';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;
      checkbox.addEventListener('change', () => {
        const user = userSelect.value;
        const ref = db.ref(`checklist/${user}/${selectedDay}/${index}/done`);
        ref.set(checkbox.checked);
      });
      const label = document.createElement('span');
      label.textContent = task.text;
      div.appendChild(checkbox);
      div.appendChild(label);
      taskListDiv.appendChild(div);
    });
  }

  // Добавление нового задания
  addTaskBtn.addEventListener('click', () => {
    const taskText = newTaskInput.value.trim();
    if (taskText) {
      const user = userSelect.value;
      const ref = db.ref(`checklist/${user}/${selectedDay}`);
      ref.push({ text: taskText, done: false });
      newTaskInput.value = ''; // Очищаем поле ввода
    }
  });

  // автообновление при смене пользователя
  userSelect.addEventListener('change', loadTasks);

  loadTasks();

  // Функция для сброса данных каждую неделю
  function checkAndReset(user) {
    const lastResetRef = db.ref('lastReset/' + user);
    
    lastResetRef.once('value', snapshot => {
      const lastResetDate = snapshot.val();
      const currentDate = new Date();
      const diffInDays = (currentDate - new Date(lastResetDate)) / (1000 * 3600 * 24);

      // Если прошло больше 7 дней, сбрасываем список дел
      if (diffInDays >= 7) {
        const userRef = db.ref('checklist/' + user);
        userRef.set({});  // Очищаем все данные для пользователя
        lastResetRef.set(currentDate.toISOString());  // Обновляем дату последнего сброса
      }
    });
  }
