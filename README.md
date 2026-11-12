Pokédex Anos 90

 uma página web que consome a PokéAPI e mostra os 151 Pokémon da primeira geração em cards. Fiz usando só HTML, CSS e JavaScript, sem framework.

Sobre o projeto

O desafio era criar um site que pegasse dados de uma API de desenhos famosos e mostrasse os personagens em cards criados pelo JavaScript. Escolhi Pokémon por que Gengar >> all

O index.html tem só uma section vazia. Os cards são todos criados pelo script.js com createElement e appendChild, depois que os dados chegam da API.

O que o site faz
Busca os Pokémon na API com fetch (de 20 em 20, pelo botão "Carregar mais")
Mostra cada card com nome, número, imagem, tipos, altura, peso, HP, ataque e habilidade
Coração no canto do card para favoritar (os favoritos ficam salvos no navegador com localStorage)
Busca por nome ou número
Filtro por tipo e filtro só de favoritos

Tecnologias
HTML5
CSS3 (grid, variáveis CSS, media queries)
JavaScript (fetch, async/await, Promise.all, manipulação do DOM)
PokéAPI
Como rodar
Baixe ou clone o repositório:
Abra o arquivo index.html no navegador (é só dar dois cliques).

Precisa de internet, porque os dados e as imagens vêm da API.

Estrutura
pokedex-anos-90/
├── index.html   # estrutura da página (container vazio dos cards)
├── style.css    # estilos
├── script.js    # consumo da API e criação dos cards
└── README.md
API utilizada
Documentação: https://pokeapi.co/docs/v2
Endpoint usado: https://pokeapi.co/api/v2/pokemon/{id}


