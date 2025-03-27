'use strict'

    // criação da tela inicial
    const app = document.getElementById('app')

    // cria o h1
    const h1 = document.createElement('h1');
    h1.textContent = 'Pesquise seu Amiibo favorito!'
    app.appendChild(h1)

    // cria a div da caixa de pesquisa (search-box)
    const searchBox = document.createElement('div')
    searchBox.classList.add('search-box')
    app.appendChild(searchBox)

    // cria o input de pesquisa
    const searchInput = document.createElement('input')
    searchInput.type = 'text'
    searchInput.id = 'searchInput'
    searchInput.placeholder = 'Digite o Amiibo ou o jogo. Ex.: Mario'
    searchBox.appendChild(searchInput)

    // cria o botão de pesquisa
    const searchButton = document.createElement('button')
    searchButton.id = 'searchButton'
    searchButton.textContent = 'PESQUISAR'
    searchBox.appendChild(searchButton)

    // cria o botão "Listar Todos"
    const listAllButton = document.createElement('button')
    listAllButton.id = 'listAllButton'
    listAllButton.textContent = 'Listar Todos os Amiibos'
    listAllButton.style.display = 'none'
    app.appendChild(listAllButton)

    // cria o container para os cards
    const cardsContainer = document.createElement('div')
    cardsContainer.id = 'cardsContainer'
    app.appendChild(cardsContainer)

    // lista de gameseries
    let knownGames = []

    // função para buscar a lista de gameseries
    const fetchAllGameSeries = async () => {
        try{
            const response = await fetch('https://www.amiiboapi.com/api/amiibo/')
            const data = await response.json()
            knownGames = [...new Set(data.amiibo.map(amiibo => amiibo.gameSeries))]
            console.log('Gameseries carregadas:', knownGames)
        }catch(error){
            console.error('Erro ao buscar a lista de gameseries:', error)
        }
    }

    // carrega a lista de gameseries
    fetchAllGameSeries()

    // Função para buscar Amiibos
    const fetchAmiibos = async (query = '', searchType = 'name') => {
        let url = 'https://www.amiiboapi.com/api/amiibo/'
        if (query) {
            url += `?${searchType}=${encodeURIComponent(query)}`
        }

        try{
            const response = await fetch(url)
            const data = await response.json()
            displayCards(data.amiibo)
            // oculta o botao buscar todos
            listAllButton.style.display = 'none'
        } catch (error) {
            console.error('Erro ao buscar Amiibos:', error)
            const errorMessage = document.createElement('p')
            errorMessage.textContent = 'Erro ao carregar os Amiibos. Tente novamente mais tarde.'
            cardsContainer.appendChild(errorMessage)
        }
    }

    // função para exibir os cards
    const displayCards = (amiibos) => {
        cardsContainer.replaceChildren()

        if(amiibos.length === 0){
            const noResultsMessage = document.createElement('p')
            noResultsMessage.textContent = 'Nenhum Amiibo encontrado.'
            cardsContainer.appendChild(noResultsMessage);
            return
        }

        amiibos.forEach(amiibo => {
            const card = document.createElement('div')
            card.classList.add('card')

            // cria a imagem do Amiibo
            const amiiboImage = document.createElement('img')
            amiiboImage.src = amiibo.image
            amiiboImage.alt = amiibo.name
            card.appendChild(amiiboImage)

            // cria o nome do Amiibo
            const amiiboName = document.createElement('h3')
            amiiboName.textContent = amiibo.name
            card.appendChild(amiiboName)

            // cria a série do jogo
            const amiiboGameSeries = document.createElement('p')
            amiiboGameSeries.textContent = amiibo.gameSeries
            card.appendChild(amiiboGameSeries)

            // adiciona o evento de clique ao card
            card.addEventListener('click', () => showDetails(amiibo))

            // adiciona o card ao container
            cardsContainer.appendChild(card)
        })
    }

    // função para exibir detalhes no modal
    const showDetails = (amiibo) => {
        document.getElementById('modal-image').src = amiibo.image
        document.getElementById('modal-name').textContent = amiibo.name
        document.getElementById('modal-game').textContent = amiibo.gameSeries
        document.getElementById('modal-type').textContent = amiibo.type
        document.getElementById('modal-series').textContent = amiibo.amiiboSeries

        // verifica as datas de lançamento
        document.getElementById('modal-release-na').textContent = amiibo.release?.na || 'N/A'
        document.getElementById('modal-release-eu').textContent = amiibo.release?.eu || 'N/A'
        document.getElementById('modal-release-jp').textContent = amiibo.release?.jp || 'N/A'
        document.getElementById('modal-release-au').textContent = amiibo.release?.au || 'N/A'

        // exibe o modal
        document.getElementById('modal').style.display = 'flex'
    }

    // fecha o modal ao clicar no "x"
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('modal').style.display = 'none'
    })

    // fecha o modal ao clicar fora dele
    window.addEventListener('click', (event) => {
        if (event.target === document.getElementById('modal')){
            document.getElementById('modal').style.display = 'none'
        }
    })

    // função para verificar se a pesquisa é por jogo
    const isGameQuery = (query) => {
        // verifica se o texto da pesquisa corresponde a uma gameseries conhecida
        return knownGames.some(game => game.toLowerCase() === query.toLowerCase())
    }

    // evento de clique no botão de pesquisa
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim()
        if(query){
            // verifica se a pesquisa é por jogo
            const searchType = isGameQuery(query) ? 'gameseries' : 'name'
            fetchAmiibos(query, searchType)
        }else{
            const noInputMessage = document.createElement('p')
            noInputMessage.textContent = 'Digite algo para pesquisar.'
            cardsContainer.appendChild(noInputMessage)
        }
    })

    // evento de tecla "enter" para pesquisa
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter'){
            const query = searchInput.value.trim()
            if(query){
                
                const searchType = isGameQuery(query) ? 'gameseries' : 'name'
                fetchAmiibos(query, searchType)
            }else{
                const noInputMessage = document.createElement('p')
                noInputMessage.textContent = 'Digite algo para pesquisar.'
                cardsContainer.appendChild(noInputMessage)
            }
        }
    })

    // evento de clique no botão listar Todos
    listAllButton.addEventListener('click', () => {
        fetchAmiibos()
    });

    // exibe o botão listar Todos na tela inicial
    listAllButton.style.display = 'block'
