const fs = require('fs')
const path = require('path')
const express = require('express')

const app = express();
const port = 3000;

const fitasPath = path.join(__dirname, 'fitas.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let fitasData = fs.readFileSync(fitasPath, 'utf-8')
let fitas = JSON.parse(fitasData);

function buscarFitaPorTitulo(titulo) {
    return fitas.find(fita =>
        fita.titulo.toLowerCase() === titulo.toLowerCase());
}

function buscarFitaPorCategoria(categoria) {
    return fitas.find(fita =>
        fita.categoria.toLowerCase() === categoria.toLowerCase());
}

app.get("/", (req, res) =>{
    res.sendFile(path.join(__dirname, "index.html"))
})
app.get('/encontrar-fita', (req, res) => {
    res.sendFile(path.join(__dirname, "encontrarfita.html"))
})

app.post('/encontrar-fita', (req, res) => {
    const tituloFita = req.body;
    const categoriaFita = req.body;
    const fitaEncontrada = buscarFitaPorTitulo(tituloFita.titulo) || buscarFitaPorCategoria(categoriaFita.categoria);

    if (fitaEncontrada) {
        res.send(`<a href="http://localhost:3000">Voltar</a><br><br><h1>Fita encontrada:</h1><pre>
        ${JSON.stringify(fitaEncontrada, null, 2)}</pre>`);
    } else {
        res.send('<a href="http://localhost:3000">Voltar</a><br><br><h1>Fita não foi encontrada</h1>');
    }
})

function salvarDados(fita) {
    fs.writeFileSync(fitasPath, JSON.stringify(fitas, null, 2));
}

app.get('/adicionar-fita', (req, res) => {
    res.sendFile(path.join(__dirname, 'adicionarfita.html'));
});

app.get("/ver-todas", (req, res) => {
    res.send(`<a href="http://localhost:3000">Voltar</a><br><br><pre>${JSON.stringify(fitas, null, 2)}</pre>`)
})

app.post('/adicionar-fita', (req, res) => {
    const novaFita = req.body;

    if (fitas.find(fita => fita.titulo.toLowerCase() === novaFita.titulo.toLowerCase())) {
        res.send('<h1>Fita já em estoque.</h1>')
        return;
    }
    fitas.push(novaFita);

    salvarDados();

    res.send('<h1>Fita adicionada com sucesso!</h1>')
});

app.get('/atualizar-fita', (req, res) => {
    res.sendFile(path.join(__dirname, 'atualizarfita.html'))

})
app.post('/atualizar-fita', (req, res) =>{
    const {titulo, novasSinopse} = req.body;
    let fitasData = fs.readFileSync(fitasPath, 'utf-8')
    let fitas = JSON.parse(fitasData);
    
    const fitaIndex = fitas.findIndex(fita => fitas.titulo.toLowerCase() === titulo.toLowerCase());
    
    if (fitaIndex === -1) {
        res.send ('<h1>Fita não encontrada </h1>');
        return;
    }
    fitas[fitaIndex].desc = novaSinopse;

    salvarDados(fitas);

    res.send('<h1> Dados da fita atualizados com sucesso </h1>');
});

app.get('/retirar-fita', (req, res) => {
    res.sendFile(path.join(__dirname, 'retirarfita.html'));
})

app.post('retirar-fita', (req, res) => {
    const { titulo } = req.body;

    let fitasData = fs.readFileSync(fitasPath, 'utf-8')
    let fitas = JSON.parse(fitasData);

    const fitaIndex = fitas.findIndex(fita => fita.titulo.toLowerCase() === titulo.toLowerCase());

    if (fitaIndex === -1) {
        res.send('<h1>Fita não encontrada</h1>');
        return;
    }
    else{
        res.send(`
        <script>
        if (confirm('Deseja excluir a fita ${titulo}?')){
            window.location.href = '/fita-retirada?titulo=${titulo}'
        }
        else{
            window.locatio.href = '/retirar-fita';
        }
        </script>
        `)
    }
})

app.get('/fita-retirada', (req, res) => {
    const titulo = req.query.titulo;

    let fitasData = fs.readFileSync(fitasPath, 'utf-8')
    let fitas = JSON.parse(fitasData);

    const fitaIndex = fita.findIndex(fita => fita.titulo.toLowerCase() === titulo.toLowerCase());

    fitas.splice(fitaIndex, 1);

    salvarDados(fitas);

    res.send(`<h1>A fita: ${titulo} foi retirada com sucesso</h1>`);
});

app.listen(port, () => {
    console.log(`Servidor Iniciado em http://localhost:${port}`)
})