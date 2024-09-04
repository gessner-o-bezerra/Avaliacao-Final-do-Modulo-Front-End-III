document.addEventListener("DOMContentLoaded", () => {
  const cardsContainer = document.querySelector(".cards-container");
  const filter = document.querySelector("#searchInput");
  const prevButton = document.querySelector("#prevButton");
  const nextButton = document.querySelector("#nextButton");

  const totalCharacters = document.querySelector("#totalCharacters");
  const inputLocation = document.querySelector("#location");
  const inputEpisode = document.querySelector("#episode");

  let characters = [];
  let filteredCharacters = [];
  let episodes = [];
  let locations = new Set();
  let currentPage = 1;
  const charactersPerPage = 4;
  let totalCharactersCount = 0;
  let totalEpisodesCount = 0;

  // Requisição inicial
  async function fetchCharacters(page = 1) {
    try {
      const response = await api.get(`/character?page=${page}`);
      const newCharacters = response.data.results;
      characters.push(...newCharacters); // Acumula personagens
      totalCharactersCount = response.data.info.count;
      
      // Adiciona localizações únicas ao Set
      newCharacters.forEach((character) => {
        if (
          character.origin.name !== "unknown" &&
          character.origin.name !== "undefined"
        ) {
          locations.add(character.origin.name);
        }
      });

      // Carrega episódios
      await fetchEpisodes();

      if (page < response.data.info.pages) {
        await fetchCharacters(page + 1);
      } else {
        updateTotalCharacters();
        filteredCharacters = characters; // Inicialmente, todos os personagens estão filtrados
        displayCharacters(); // Exibe os personagens carregados
      }
    } catch (error) {
      console.error("Ocorreu um erro ao buscar os personagens:", error);
    }
  }

  async function fetchEpisodes(page = 1) {
    try {
      const response = await api.get(`/episode?page=${page}`);
      episodes.push(...response.data.results);
      totalEpisodesCount = response.data.info.count;

      if (page < response.data.info.pages) {
        await fetchEpisodes(page + 1);
      }
    } catch (error) {
      console.error("Ocorreu um erro ao buscar os episódios:", error);
    }
  }

  // Define quantos cards serão exibidos por vez
  function displayCharacters() {
    cardsContainer.innerHTML = "";
    const startIndex = (currentPage - 1) * charactersPerPage;
    const endIndex = startIndex + charactersPerPage;
    const charactersSubset = filteredCharacters.slice(startIndex, endIndex);

    charactersSubset.forEach((character) => {
      const card = createCard(character);
      cardsContainer.appendChild(card);
    });

    updatePaginationButtons();
  }

  function createCard(character) {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card mb-3";

    let statusClass;
    let statusNaw;
    let especie;
    let planet;
    if (character.status === "Alive") {
      statusClass = "status-alive";
      statusNaw = "Vivo";
    } else if (character.status === "Dead") {
      statusClass = "status-dead";
      statusNaw = "Morto";
    } else {
      statusClass = "status-unknown";
      statusNaw = "Desconhecido";
    }

    if (character.species === "Human") {
      especie = "Humano";
    } else {
      especie = "Alienígena";
    }

    if (character.origin.name === "Earth (Replacement Dimension)") {
      planet = "Terra (Dimensão de Substituição)";
    } else if (character.origin.name === "Earth (C-137)") {
      planet = "Terra (C-137)";
    } else if (
      character.origin.name === "unknown" ||
      character.origin.name === "undefined"
    ) {
      planet = "Desconhecido";
    }

    const lastEpisodeUrl = character.episode[character.episode.length - 1];
    const lastEpisode = episodes.find((ep) => ep.url === lastEpisodeUrl);
    const lastEpisodeName = lastEpisode ? lastEpisode.name : "Desconhecido";

    cardDiv.innerHTML = `
      <div class="row g-0 rounded-4">
        <div class="col-md-3">
          <img src="${
            character.image
          }" class="card-img-top rounded float-start" alt="${character.name}">
        </div>
        <div class="col-md-8">
          <div class="card-body">
            <h5 class="card-title">${character.name}</h5>
            <p class="card-text">
              <span class="status-indicator ${statusClass}"></span>
              ${statusNaw} - ${especie}
            </p>
            <p class="card-label">Última localização conhecida</p>
            <p class="card-text">Planeta: ${planet}</p>
            <p class="card-label">Visto pela última vez em</p>
            <p class="card-text">${lastEpisodeName}</p>
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#characterModal" data-character='${JSON.stringify(
              character
            )}'>
              Ver Detalhes
            </button>
          </div>
        </div>
      </div>
    `;

    return cardDiv;
  }

  document.addEventListener("click", function (event) {
    if (event.target.matches("[data-bs-toggle='modal']")) {
      const character = JSON.parse(event.target.getAttribute("data-character"));
      const modalHeader = document.querySelector(
        "#characterModal .modal-header"
      );
      const modalBody = document.querySelector("#characterModal .modal-body");

      let statusClass;
      let statusNaw;
      let especie;
      let planet;

      if (character.status === "Alive") {
        statusClass = "status-alive";
        statusNaw = "Vivo";
      } else if (character.status === "Dead") {
        statusClass = "status-dead";
        statusNaw = "Morto";
      } else {
        statusClass = "status-unknown";
        statusNaw = "Desconhecido";
      }

      if (character.species === "Human") {
        especie = "Humano";
      } else {
        especie = "Alienígena";
      }

      if (character.origin.name === "Earth (Replacement Dimension)") {
        planet = "Terra (Dimensão de Substituição)";
      } else if (character.origin.name === "Earth (C-137)") {
        planet = "Terra (C-137)";
      } else if (
        character.origin.name === "unknown" ||
        character.origin.name === "undefined"
      ) {
        planet = "Desconhecido";
      }

      modalHeader.innerHTML = `
            <img src="${character.image}" class="mb-2 img-custon-modal" alt="${character.name}">
            <h5>${character.name}</h5>
        `;
      modalBody.innerHTML = `
            <p>Status: <span class="status-indicator ${statusClass}"></span> ${statusNaw}</p>
            <p>Espécie: ${especie}</p>
            <p>Planeta: ${planet}</p>
        `;
    }
  });

  function updatePaginationButtons() {
    const maxPage = Math.ceil(filteredCharacters.length / charactersPerPage);
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage >= maxPage;
  }

  function goToNextPage() {
    const maxPage = Math.ceil(filteredCharacters.length / charactersPerPage);
    if (currentPage < maxPage) {
      currentPage++;
      displayCharacters();
    }
  }

  function goToPrevPage() {
    if (currentPage > 1) {
      currentPage--;
      displayCharacters();
    }
  }

  function filterCharacters() {
    const searchTerm = filter.value.toLowerCase();
    filteredCharacters = characters.filter((character) =>
      character.name.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    displayCharacters();
  }

  function updateTotalCharacters() {
    totalCharacters.innerHTML = `
    <p id="totalCharacters" class="footer-item-p mb-2 mb-md-0">Personagens:
    <span class="footer-item mb-2 mb-md-0">${totalCharactersCount}</span>
    </p>`;

    inputLocation.innerHTML = `
      <p id="totalCharacters" class="footer-item-p mb-2 mb-md-0">Localizações:
      <span class="footer-item mb-2 mb-md-0">${locations.size}</span>
      </p>`;

    inputEpisode.innerHTML = `
    <p id="totalCharacters" class="footer-item-p mb-2 mb-md-0">Episódios:
    <span class="footer-item mb-2 mb-md-0">${totalEpisodesCount}</span>
    </p>`;
  }

  prevButton.addEventListener("click", goToPrevPage);
  nextButton.addEventListener("click", goToNextPage);
  filter.addEventListener("input", filterCharacters);

  fetchCharacters();
});
