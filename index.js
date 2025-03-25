const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();

const global_api = 'https://impulsee.pythonanywhere.com/afd-platform/backend/urls'; // API manzili

// Static fayllar uchun (CRA build papkasini ko'rsatamiz)
app.use(express.static(path.join(__dirname, '../build')));

// URL uchun film nomini formatlash
const formatFilmNameForURL = (name) => {
    return name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
};

// Har bir film sahifasi uchun dinamik HTML yaratish
app.get('/:department_id/:department_name/:film_id/:film_name', async (req, res) => {
    const { department_id, department_name, film_id, film_name } = req.params;

    try {
        // API dan filmlarni olish (axios orqali)
        const response = await axios.get(`${global_api}/movies/`);
        const data = response.data;

        const film = data.find(f => formatFilmNameForURL(f.movies_name) === film_name);

        console.log('====================================');
        console.log(film.movies_name);
        console.log('====================================');


        if (film) {
            res.json({
                title: `${film.movies_name} - Uzbek tilida`,
                description: film.movies_description,
                image: film.movies_preview_url,
                // other meta data
            });
        } else {
            res.status(404).json({ error: 'Film not found' });
        }
    } catch (error) {
        console.error("Xato yuz berdi: ", error);
        res.status(500).send('Server xatosi');
    }
});

// Boshqa barcha so'rovlarni Reactga yo'naltirish
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server ${PORT}-portda ishga tushdi`);
});