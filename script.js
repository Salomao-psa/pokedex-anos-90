/* =====================================================
   Pokédex Anos 90 - consumo da PokéAPI com fetch
   Documentação: https://pokeapi.co/docs/v2
   ===================================================== */

const API_URL = "https://pokeapi.co/api/v2";
const TOTAL = 151;        // 1ª geração (anos 90)
const POR_PAGINA = 20;    // quantos cards carregar por vez

// Referências aos elementos do HTML  
const container = document.getElementById("cards");
const statusEl = document.getElementById("status");
const buscaEl = document.getElementById("busca");
const tipoEl = document.getElementById("filtro-tipo");
const btnMais = document.getElementById("btn-mais");
const btnFav = document.getElementById("btn-favoritos");
const contadorFav = document.getElementById("contador-fav");

// Estado da aplicação
let pokemons = [];        // detalhes já carregados
let proximo = 1;          // próximo ID a buscar
let soFavoritos = false;
let favoritos = lerFavoritos();

/* ---------- Favoritos () ---------- */
function lerFavoritos() {
  try { return JSON.parse(localStorage.getItem("favoritos-pokedex")) || []; }
  catch { return []; }
}
function salvarFavoritos() {
  try { localStorage.setItem("favoritos-pokedex", JSON.stringify(favoritos)); } catch {}
  contadorFav.textContent = favoritos.length;
}

/* ---------- Requisições com fetch ---------- */
// Busca os detalhes de um Pokémon pelo ID
function buscarPokemon(id) {
  return fetch(`${API_URL}/pokemon/${id}`).then((resposta) => {
    if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);
    return resposta.json();
  });
}

// Carrega o próximo lote de Pokémon
async function carregarLote() {
  btnMais.disabled = true;
  statusEl.className = "";
  statusEl.textContent = "Carregando Pokémon...";

  const fim = Math.min(proximo + POR_PAGINA - 1, TOTAL);
  const ids = [];
  for (let i = proximo; i <= fim; i++) ids.push(i);

  try {
    const lote = await Promise.all(ids.map(buscarPokemon));
    console.log(`Lote #${proximo}-${fim} recebido da PokéAPI:`, lote);
    pokemons.push(...lote);
    proximo = fim + 1;
    montarFiltroTipos();
    renderizar();
    statusEl.textContent = "";
  } catch (erro) {
    console.error("Falha ao consumir a API:", erro);
    statusEl.className = "erro";
    statusEl.textContent = "Não foi possível carregar os dados. Verifique sua conexão e tente novamente.";
  } finally {
    btnMais.disabled = false;
    btnMais.hidden = proximo > TOTAL;
  }
}

/* ---------- Criação dinâmica dos cards (DOM) ---------- */
function criarElemento(tag, classe, texto) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

function criarCard(p) {
  const card = criarElemento("article", "card");

  // Nome do personagem
  const numero = criarElemento("p", "numero", `#${String(p.id).padStart(3, "0")}`);
  const nome = criarElemento("h2", "", p.name);

  // Coração de favoritar
  const btn = criarElemento("button", "favorito");
  btn.type = "button";
  const atualizarCoracao = () => {
    const fav = favoritos.includes(p.id);
    btn.textContent = fav ? "♥" : "♡";
    btn.setAttribute("aria-label", fav ? `Remover ${p.name} dos favoritos` : `Favoritar ${p.name}`);
  };
  atualizarCoracao();
  btn.addEventListener("click", () => {
    favoritos = favoritos.includes(p.id)
      ? favoritos.filter((id) => id !== p.id)
      : [...favoritos, p.id];
    salvarFavoritos();
    if (soFavoritos) renderizar(); else atualizarCoracao();
  });

  // Imagem
  const moldura = criarElemento("div", "moldura");
  const img = document.createElement("img");
  img.src = p.sprites.other["official-artwork"].front_default || p.sprites.front_default;
  img.alt = `Imagem de ${p.name}`;
  img.loading = "lazy";
  moldura.appendChild(img);

  // Tipos
  const tipos = criarElemento("div", "tipos");
  p.types.forEach((t) => tipos.appendChild(criarElemento("span", `tipo t-${t.type.name}`, t.type.name)));

  // Informações adicionais
  const info = criarElemento("ul", "info");
  const dados = [
    ["Altura", `${p.height / 10} m`],
    ["Peso", `${p.weight / 10} kg`],
    ["HP", p.stats[0].base_stat],
    ["Ataque", p.stats[1].base_stat],
    ["Habilidade", p.abilities[0].ability.name.replace("-", " ")],
  ];
  dados.forEach(([rotulo, valor]) => {
    const li = document.createElement("li");
    li.append(criarElemento("span", "", rotulo), criarElemento("span", "", String(valor)));
    info.appendChild(li);
  });

  card.append(btn, numero, nome, moldura, tipos, info);
  return card;
}

/* ---------- Renderização com filtros ---------- */
function renderizar() {
  const termo = buscaEl.value.trim().toLowerCase();
  const tipo = tipoEl.value;

  const filtrados = pokemons.filter((p) =>
    (!termo || p.name.includes(termo) || String(p.id) === termo) &&
    (!tipo || p.types.some((t) => t.type.name === tipo)) &&
    (!soFavoritos || favoritos.includes(p.id))
  );

  container.replaceChildren();               // limpa o container
  filtrados.forEach((p) => container.appendChild(criarCard(p)));  // cria os cards

  if (!filtrados.length && !statusEl.classList.contains("erro")) {
    statusEl.textContent = "Nenhum Pokémon encontrado com esses filtros.";
  } else if (statusEl.textContent.startsWith("Nenhum")) {
    statusEl.textContent = "";
  }
  contadorFav.textContent = favoritos.length;
}

function montarFiltroTipos() {
  const existentes = new Set([...tipoEl.options].map((o) => o.value));
  const tipos = new Set(pokemons.flatMap((p) => p.types.map((t) => t.type.name)));
  [...tipos].sort().forEach((t) => {
    if (existentes.has(t)) return;
    const op = criarElemento("option", "", t.charAt(0).toUpperCase() + t.slice(1));
    op.value = t;
    tipoEl.appendChild(op);
  });
}

/* ---------- Eventos ---------- */
buscaEl.addEventListener("input", renderizar);
tipoEl.addEventListener("change", renderizar);
btnMais.addEventListener("click", carregarLote);
btnFav.addEventListener("click", () => {
  soFavoritos = !soFavoritos;
  btnFav.setAttribute("aria-pressed", soFavoritos);
  renderizar();
});

// Início
salvarFavoritos();
carregarLote();
