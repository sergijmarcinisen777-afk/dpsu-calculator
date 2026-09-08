const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // Ваші HTML файли лежать у папці public

// Імітація бази даних у пам'яті (для швидкого тестування)
// На продакшені замінюється на MongoDB або PostgreSQL
const users = [
    { id: 1, username: 'admin', password: '123', role: 'programmer', data: {} },
    { id: 2, username: 'guest1', password: '123', role: 'guest', data: {} }
];

// 1. Авторизація (Вхід)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: 'Невірний логін або пароль' });
    }
    
    res.json({ id: user.id, username: user.username, role: user.role });
});

// 2. Реєстрація нових гостей
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'Користувач вже існує' });
    }
    
    const newUser = { id: Date.now(), username, password, role: 'guest', data: {} };
    users.push(newUser);
    res.json({ success: true, user: { id: newUser.id, username, role: 'guest' } });
});

// 3. Панель Програміста: Перегляд усіх гостей та їхніх даних
app.get('/api/admin/users', (req, res) => {
    const adminId = req.headers['user-id'];
    const user = users.find(u => u.id == adminId);

    if (!user || user.role !== 'programmer') {
        return res.status(403).json({ error: 'Доступ заборонено! Ви не Програміст.' });
    }

    // Повертаємо список усіх користувачів із їхніми даними
    const guests = users.map(u => ({ id: u.id, username: u.username, role: u.role, data: u.data }));
    res.json(guests);
});

// 4. Збереження персональних даних користувача (машини, книги, коефіцієнти)
app.post('/api/user/save', (req, res) => {
    const userId = req.headers['user-id'];
    const user = users.find(u => u.id == userId);

    if (!user) return res.status(401).json({ error: 'Неавторизовано' });

    user.data = req.body.data; // Зберігаємо індивідуальну програму під користувача
    res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущено на порту ${PORT}`));