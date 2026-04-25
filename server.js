const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'movies.json');

const readMovies = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');
const writeMovies = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

const server = http.createServer((req, res) => {
    const { method, url } = req;
    const id = url.split('/')[2];

    res.setHeader('Content-Type', 'application/json');

    if (method === 'GET' && url === '/movies') {
        res.writeHead(200);
        return res.end(JSON.stringify(readMovies()));
    }

    if (method === 'GET' && id) {
        const movies = readMovies();
        const movie = movies.find(m => m.id === id);
        if (movie) {
            res.writeHead(200);
            return res.end(JSON.stringify(movie));
        } else {
            res.writeHead(404);
            return res.end(JSON.stringify({ message: "Movie not found" }));
        }
    }

    if (method === 'POST' && url === '/movies') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        
        req.on('end', () => {
            const movies = readMovies();
            const newMovie = JSON.parse(body);
            newMovie.id = Date.now().toString();
            
            movies.push(newMovie);
            writeMovies(movies);
            
            res.writeHead(201);
            res.end(JSON.stringify(newMovie));
        });
        return;
    }
    res.writeHead(404);
    res.end(JSON.stringify({ message: "Route not found" }));
});

server.listen(3000, () => console.log('Server running on port 3000'));
