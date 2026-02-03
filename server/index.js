import express from 'express';
import session from 'express-session';
import { pool } from './db.js';
import { randomUUID } from 'crypto';
import { hashPassword, comparePassword } from './components/hash.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS to allow requests from Vercel frontend and local development
const allowedOrigins = [
  'https://miggymouse-to-do-list.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

/* app.get('/', (req, res) => {
  res.send('Aray Mo Pakak!!!!!');
}); */



/* app.get('/home', (req, res) => {
    res.send('love----joy-----hop----');
})

app.get('/get-list', (req, res) => {
    res.send('love----joy-----hop----');
})

app.get('/add-list', (req, res) => {
    res.send('love----joy-----hop----');
})

app.get('/edit-list', (req, res) => {
    res.send('love----joy-----hop----');
})

app.get('/delet-list', (req, res) => {
    res.send('love----joy-----hop----');
})

app.get('/get-item', (req, res) => {
    res.send('love----joy-----hop----');
})

app.get('/add-item', (req, res) => {
    res.send('love----joy-----hop----');
})

app.get('/edit-item', (req, res) => {
    res.send('love----joy-----hop----');
})

app.get('/delete-item', (req, res) => {
    res.send('love----joy-----hop----');
}) */




app.get('/get-lists', async (req, res) => {
    try {
        const result = await pool.query('SELECT id as list_id, title, status FROM list ORDER BY id DESC');
        res.status(200).json({ success: true, lists: result.rows });
    } catch (error) {
        console.error('Get lists error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch lists' });
    }
});

app.get('/get-items/:id', async (req, res) => {
    try {
        const listId = req.params.id;
        const result = await pool.query('SELECT * FROM items WHERE list_id = $1 ORDER BY id DESC', [listId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'No items found for the given list ID' });
        }

        res.status(200).json({ success: true, items: result.rows });
    } catch (error) {
        console.error('Get items error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch items' });
    }
});


app.post('/add-list', async (req, res) => {
    try {
        const { listtitle } = req.body;
        
        if (!listtitle || !listtitle.trim()) {
            return res.status(400).json({ success: false, message: 'Task title is required' });
        }
        
        const id = randomUUID();

        const result = await pool.query('INSERT INTO list (id, title, status) VALUES ($1, $2, $3)', [id, listtitle, 'pending']);

        res.status(200).json({ success: true, message: 'List added successfully', id });
    } catch (error) {
        console.error('Add list error:', error);
        res.status(500).json({ success: false, message: 'Failed to add task. Please try again.' });
    }
});

app.post('/edit-list', async (req, res) => {
    const { id, listtitle } = req.body;

    await pool.query('UPDATE list SET title = $2 WHERE id = $1', [id, listtitle]);

    res.status(200).json({ success: true, message: 'List updated successfully' });
});

app.post('/delete-list', async (req, res) => {
    const { id } = req.body;

    await pool.query('DELETE FROM list WHERE id = $1', [id]);

    res.status(200).json({ success: true, message: 'List deleted successfully' });
});


app.post('/add-item', async (req, res) => {
    try {
        const { listId, description } = req.body;
        const id = randomUUID();

        if (!listId || !description || !description.trim()) {
            return res.status(400).json({ success: false, message: 'List ID and description are required' });
        }

        await pool.query('INSERT INTO items (id, list_id, description, status) VALUES ($1, $2, $3, $4)', [id, listId, description, 'pending']);

        res.status(200).json({ success: true, message: 'Item added successfully', id });
    } catch (error) {
        console.error('Add item error:', error);
        res.status(500).json({ success: false, message: 'Failed to add item. Please try again.' });
    }
});

app.post('/edit-item', async (req, res) => {
    const { listId, description, status } = req.body;

    await pool.query('UPDATE items SET description = $2, status = $3 WHERE list_id = $1', [listId, description, status]);

    res.status(200).json({ success: true, message: 'Item updated successfully' });
});

app.post('/delete-items', async (req, res) => {
    const { listId } = req.body;

    await pool.query('DELETE FROM items WHERE list_id = $1', [listId]);

    res.status(200).json({ success: true, message: 'Item deleted successfully' });
});

app.post('/register', async (req, res) => {
    const { password, username, name } = req.body;
    const id = randomUUID();
    try {
        const hashedPassword = hashPassword(password, 10);
        await pool.query('INSERT INTO user_accounts (id, username, password,name) VALUES ($1, $2, $3,$4)', [id, username, hashedPassword, name]);
        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});



app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM user_accounts WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = result.rows[0];
        const match = comparePassword(password, user.password);

        if (match) {
            req.session.user = { id: user.id, name: user.name };
            res.status(200).json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

app.get('/get-session', (req, res) => {
    if (req.session.user) {
        res.status(200).json({
            success: true,
            session: true,
            user: req.session.user
        });
    } else {
        res.status(200).json({
            success: true,
            session: false
        });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ success: true, message: 'Logout successful' });
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});