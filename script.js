// Функция для добавления задания
function addTask(user, day, taskText) {
  const task = {
    text: taskText,
    done: false, // Задание новое и не выполнено
  };

  // Ссылка на день пользователя в Firebase
  const userRef = firebase.database().ref('checklist/' + user + '/' + day);
  userRef.push(task);  // Добавляем задание в день
}
// Функция для сброса данных каждую неделю
function checkAndReset(user) {
  const lastResetRef = firebase.database().ref('lastReset/' + user);
  
  lastResetRef.once('value').then(snapshot => {
    const lastResetDate = snapshot.val();
    const currentDate = new Date();
    const diffInDays = (currentDate - new Date(lastResetDate)) / (1000 * 3600 * 24);

    // Если прошло больше 7 дней, сбрасываем список дел
    if (diffInDays >= 7) {
      const userRef = firebase.database().ref('checklist/' + user);
      userRef.set({});  // Очищаем список дел для пользователя
      lastResetRef.set(currentDate.toISOString());  // Обновляем дату последнего сброса
    }
  });
}
const userRef = firebase.database().ref('checklist/' + user);
userRef.on('value', (snapshot) => {
  const data = snapshot.val();
  // Обновляем UI в соответствии с данными из Firebase
});
