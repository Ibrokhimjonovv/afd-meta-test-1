// const express = require('express');
// const path = require('path');
// const axios = require('axios');
// const app = express();

// const global_api = 'https://impulsee.pythonanywhere.com/afd-platform/backend/urls'; // API manzili

// // Static fayllar uchun (CRA build papkasini ko'rsatamiz)
// app.use(express.static(path.join(__dirname, '../build')));

// // URL uchun film nomini formatlash
// const formatFilmNameForURL = (name) => {
//     return name
//         .toLowerCase()
//         .replace(/\s+/g, "-")
//         .replace(/[^a-z0-9-]/g, "");
// };

// // Har bir film sahifasi uchun dinamik HTML yaratish
// app.get('/:department_id/:department_name/:film_id/:film_name', async (req, res) => {
//     const { department_id, department_name, film_id, film_name } = req.params;

//     try {
//         // API dan filmlarni olish (axios orqali)
//         const response = await axios.get(`${global_api}/movies/`);
//         const data = response.data;

//         const film = data.find(f => formatFilmNameForURL(f.movies_name) === film_name);

//         console.log('====================================');
//         console.log(film.movies_name);
//         console.log('====================================');


//         if (film) {
//             res.json({
//                 title: `${film.movies_name} - Uzbek tilida`,
//                 description: film.movies_description,
//                 image: film.movies_preview_url,
//                 // other meta data
//             });
//         } else {
//             res.status(404).json({ error: 'Film not found' });
//         }
//     } catch (error) {
//         console.error("Xato yuz berdi: ", error);
//         res.status(500).send('Server xatosi');
//     }
// });

// // Boshqa barcha so'rovlarni Reactga yo'naltirish
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../build', 'index.html'));
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server ${PORT}-portda ishga tushdi`);
// });
const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors'); // CORS paketini qo'shdik
const app = express();

// CORS sozlamalari
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://afd-platform.vercel.app',
    'https://afd-platform.vercel.app'
  ],
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

const global_api = 'https://impulsee.pythonanywhere.com/afd-platform/backend/urls';

// URL uchun film nomini formatlash
const formatFilmNameForURL = (name) => {
    return name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
};

// API endpoint - faqat JSON ma'lumot qaytaradi
app.get('/:department_id/:department_name/:film_id/:film_name', async (req, res) => {
    const { department_id, department_name, film_id, film_name } = req.params;

    try {
        const response = await axios.get(`${global_api}/movies/`);
        const data = response.data;
        const film = data.find(f => formatFilmNameForURL(f.movies_name) === film_name);

        if (film) {
            res.json({
                success: true,
                title: `${film.movies_name} - Uzbek tilida`,
                description: film.movies_description,
                image: film.movies_preview_url,
                url: `https://afd-platform.vercel.app/${department_id}/${department_name}/${film_id}/${film_name}`,
                // Schema.org ma'lumotlari
                schema: {
                    "@context": "https://schema.org",
                    "@type": "Movie",
                    "name": film.movies_name,
                    "description": film.movies_description,
                    "image": film.movies_preview_url
                }
            });
        } else {
            res.status(404).json({ 
                success: false,
                error: 'Film not found',
                message: 'Requested movie was not found in our database'
            });
        }
    } catch (error) {
        console.error("Xato yuz berdi: ", error);
        res.status(500).json({ 
            success: false,
            error: 'Server xatosi',
            details: error.message
        });
    }
});

// OPTIONS metodini qo'llab-quvvatlash (CORS uchun)
app.options('*', cors());

// Boshqa barcha so'rovlar uchun 404 xabar qaytarish
app.get('*', (req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Endpoint not found',
        message: 'The requested API endpoint does not exist'
    });
});

// Xato ishlovchisi
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Something went wrong on the server'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server ${PORT}-portda ishga tushdi`);
    console.log(`CORS sozlamalari: localhost, afd-platform.vercel.app uchun ruxsat berilgan`);
});