const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'movies.json');

const readMovies = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, '[]');
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error("Error reading file:", err);
        return [];
    }
};

const writeMovies = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const server = http.createServer((req, res) => {
    const { method, url } = req;
    const items = url.split('/');
    const id = items[2];

    res.setHeader('Content-Type', 'application/json');

    if (method === 'GET' && url === '/movies') {
        res.writeHead(200);
        return res.end(JSON.stringify(readMovies()));
    }

    if (method === 'GET' && items[1] === 'movies' && id) {
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
            try {
                const movies = readMovies();
                const newMovie = JSON.parse(body);
                
                newMovie.id = Date.now().toString();
                movies.push(newMovie);
                writeMovies(movies);

                res.writeHead(201);
                res.end(JSON.stringify(newMovie));
            } catch (e) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: "Invalid JSON data" }));
            }
        });
        return;
    }

    if (method === 'PUT' && items[1] === 'movies' && id) {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                let movies = readMovies();
                const index = movies.findIndex(m => m.id === id);
                if (index !== -1) {
                    const updates = JSON.parse(body);
                    movies[index] = { ...movies[index], ...updates, id };
                    writeMovies(movies);
                    res.writeHead(200);
                    res.end(JSON.stringify(movies[index]));
                } else {
                    res.writeHead(404);
                    res.end(JSON.stringify({ message: "Movie not found" }));
                }
            } catch (e) {
                res.writeHead(400);
                res.end(JSON.stringify({ message: "Invalid JSON data" }));
            }
        });
        return;
    }

    if (method === 'DELETE' && items[1] === 'movies' && id) {
        let movies = readMovies();
        const initialLength = movies.length;
        const filtered = movies.filter(m => m.id !== id);
        
        if (filtered.length < initialLength) {
            writeMovies(filtered);
            res.writeHead(200);
            res.end(JSON.stringify({ message: "Movie deleted successfully" }));
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ message: "Movie not found" }));
        }
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ message: "Route not found" }));
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`To see movies, visit http://localhost:${PORT}/movies`);
});
