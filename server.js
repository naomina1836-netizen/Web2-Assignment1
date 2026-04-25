const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'movies.json');

const readMovies = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');

const writeMovies = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
});

server.listen(PORT, () => console.log(`Server at http://localhost:${PORT}`));