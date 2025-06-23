const fs = require('fs')
const path = require('path')
const express = require('express')

const app = express();
const port = 3000;

const tarefasPath = path.join(__dirname, 'tarefas.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let tarefasData = fs.readFileSync(tarefasPath, 'utf-8')
let tarefas = JSON.parse(tarefasData);


function buscarTarefaPorTitulo(titulo) {
    return tarefas.find(tarefa =>
        tarefa.titulo.toLowerCase() === titulo.toLowerCase());
}

function buscarTarefaPorMateria(materia) {
    return tarefas.find(tarefa =>
        tarefa.materia.toLowerCase() === materia.toLowerCase());
}
app.get('/', (req, res)=> {
    res.sendFile(path.join(__dirname, "index.html"))
})

function tabelasFormat(tarefa){
    tarefasTable = "";
    tarefasTable += `
    <tr>
        <td>${tarefa.titulo}</td>
        <td>${tarefa.materia}</td>
        <td>${tarefa.descricao}</td>
        `
    return tarefasTable
}
app.get("/ver-todas", (req, res) =>{
    let tarefasTable = '';

    tarefas.forEach(tarefa =>{
        tarefasTable += `
        <tr>
            <td>${tarefa.titulo}</td>
            <td>${tarefa.materia}</td>
            <td>${tarefa.descricao}</td>
            `
    });

    const htmlContent = fs.readFileSync('todastarefas.html', 'utf-8');
    const finalHtml = htmlContent.replace('{{tarefasTable}}', tarefasTable)

    res.send(finalHtml)
})
app.get('/encontrar-tarefa', (req, res) => {
    res.sendFile(path.join(__dirname, "encontrartarefa.html"))
})

app.post('/encontrar-tarefa', (req, res) => {
    const tituloTarefa = req.body;
    const materiaTarefa = req.body;
    const tarefaEncontrada = buscarTarefaPorTitulo(tituloTarefa.titulo) || buscarTarefaPorMateria(materiaTarefa.materia);

    if (tarefaEncontrada) {
        let tarefasTable = tabelasFormat(tarefaEncontrada)
        const htmlContent = fs.readFileSync('todastarefas.html', 'utf-8');
        const finalHtml = htmlContent.replace('{{tarefasTable}}', tarefasTable)

        res.send(finalHtml)
    } else {
        res.send('<a href="http://localhost:3000">Voltar</a><br><br><div class="position-absolute top-50 start-50 translate-middle"<h1>Tarefa não foi encontrada</h1></div>');
    }
})

function salvarDados(tarefa) {
    fs.writeFileSync(tarefasPath, JSON.stringify(tarefas, null, 2));    
}

app.get('/marcar-tarefa', (req, res) => { 
    res.sendFile(path.join(__dirname, 'marcartarefa.html'));
});

app.get("/ver-todas", (req, res) => {
    res.send(`<a href="http://localhost:3000">Voltar</a><br><br><pre>${JSON.stringify(tarefas, null, 2)}</pre>`)
})

app.post('/marcar-tarefa', (req, res) => {
    const novaTarefa = req.body;

    if (tarefas.find(tarefa => tarefa.titulo.toLowerCase() === novaTarefa.titulo.toLowerCase())) {
        res.send(`<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
        <body><a href="http://localhost:3000" class="btn btn-primary">Voltar</a><br><div class="position-absolute top-50 start-50 translate-middle"><h1>Tarefa já marcada.</h1></div></body>`)
        return;
    }
    tarefas.push(novaTarefa);

    salvarDados();

    res.send(`<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT" crossorigin="anonymous">
    <a class="btn btn-primary" href="http://localhost:3000">Voltar</a><br><div class="position-absolute top-50 start-50 translate-middle"<h1>Tarefa marcada com sucesso!</h1></div>`)
});

app.get('/atualizar-tarefa', (req, res) => {
    res.sendFile(path.join(__dirname, 'atualizartarefa.html'))

})
app.post('/atualizar-tarefa', (req, res) =>{
    const {titulo, descricao, materia} = req.body;
    const tarefaIndex = tarefas.findIndex(tarefa => tarefa.titulo.toLowerCase() === titulo.toLowerCase());
    
    if (tarefaIndex === -1) {
        res.send ('<a href="http://localhost:3000">Voltar</a><br><div class="position-absolute top-50 start-50 translate-middle"<h1>Tarefa não encontrada </h1></div>');
        return;
    }
    tarefas[tarefaIndex].descricao = descricao;
    tarefas[tarefaIndex].materia = materia;

    salvarDados(tarefas);

    res.send('<a href="http://localhost:3000">Voltar</a><br><div class="position-absolute top-50 start-50 translate-middle"<h1> Dados da tarefa atualizados com sucesso </h1></div>');
});
-
app.get('/retirar-tarefa', (req, res) => {
    res.sendFile(path.join(__dirname, 'retirartarefa.html'));
})

app.post('/retirar-tarefa', (req, res) => {
    const { titulo } = req.body;


    const tarefaIndex = tarefas.findIndex(tarefa => tarefa.titulo.toLowerCase() === titulo.toLowerCase());

    if (tarefaIndex === -1) {
        res.send('<a href="http://localhost:3000">Voltar</a><br><div class="position-absolute top-50 start-50 translate-middle"<h1>Tarefa não encontrada</h1></div>');
        return;
    }
    else{
        res.send(`
        <script>
        if (confirm('Deseja excluir a tarefa ${titulo}?')){
            window.location.href = '/tarefa-retirada?titulo=${titulo}'
        }
        else{
            window.location.href = '/retirar-tarefa';
        }
        </script>
        `)
    }
})

app.get('/tarefa-retirada', (req, res) => {
    const titulo = req.query.titulo;

    const tarefaIndex = tarefas.findIndex(tarefa => tarefa.titulo.toLowerCase() === titulo.toLowerCase());

    tarefas.splice(tarefaIndex, 1);

    salvarDados(tarefas);

    res.send(`<a href="http://localhost:3000">Voltar</a><br><div class="position-absolute top-50 start-50 translate-middle"<h1>A tarefa: ${titulo} foi retirada com sucesso</h1></div>`);
});

app.listen(port, () => {
    console.log(`Servidor Iniciado em http://localhost:${port}`)
})