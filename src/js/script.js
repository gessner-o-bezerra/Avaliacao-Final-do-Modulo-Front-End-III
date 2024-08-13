document.addEventListener("DOMContentLoaded", () => {
  const cardsContainer = document.querySelector(".cards-container");
  const filter = document.querySelector("#searchInput");
  const prevButton = document.querySelector("#prevButton");
  const nextButton = document.querySelector("#nextButton");

  const totalCharacters = document.querySelector("#totalCharacters");
  const inputLocation = document.querySelector("#location");
  const inputEpisode = document.querySelector("#episode");

  let characters = [];
  let episodes = [];
  let currentPage = 1;
  const charactersPerPage = 4;

 

  function fetchCharacters() {
    api
      .get("/character")
      .then((response) => {
        characters = response.data.results;
        updateTotalCharacters();
        
        fetchEpisodes();
      })
      .catch((error) => {
        console.error("There was an error fetching the characters:", error);
      });
  }

  function fetchEpisodes() {
    api
      .get("/episode")
      .then((response) => {
        episodes = response.data.results;
        
        displayCharacters();
        updatePaginationButtons();
      })
      .catch((error) => {
        console.error("There was an error fetching the episodes:", error);
      });
  }

  function displayCharacters() {
    cardsContainer.innerHTML = "";
    const startIndex = (currentPage - 1) * charactersPerPage;
    const endIndex = startIndex + charactersPerPage;
    const charactersToDisplay = characters.slice(startIndex, endIndex);

    charactersToDisplay.forEach((character) => {
      const card = createCard(character);
      cardsContainer.appendChild(card);
    });

    updateTotalCharacters();
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

    if(character.species === "Human"){
      especie = "Humano"
    }else{
      especie = "Alienígena"
    }

    if(character.origin.name === "Earth (Replacement Dimension)"){
      planet = "Terra (Dimensão de Substituição)"
    }else if(character.origin.name === "Earth (C-137)"){
      planet = "Terra (C-137)"
    }else if(character.origin.name === "unknown" || character.origin.name === "undefined"){
      planet = "Desconhecido"
    }

    // Find the last episode
    const lastEpisodeUrl = character.episode[character.episode.length - 1];
    const lastEpisode = episodes.find(ep => ep.url === lastEpisodeUrl);
    const lastEpisodeName = lastEpisode ? lastEpisode.name : "Desconhecido";

    cardDiv.innerHTML = `
      <div class="row g-0">
        <div class="col-md-3">
          <img src="${character.image}" class="card-img-top" alt="${character.name}">
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
            <!-- Button trigger modal -->
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#characterModal" data-character='${JSON.stringify(character)}'>
              Ver Detalhes
            </button>
          </div>
        </div>
      </div>
    `;

    return cardDiv;
}

document.addEventListener("click", function(event) {
    if (event.target.matches("[data-bs-toggle='modal']")) {
        const character = JSON.parse(event.target.getAttribute("data-character"));
        const modalHeader = document.querySelector("#characterModal .modal-header");
        const modalBody = document.querySelector("#characterModal .modal-body");
        console.log(event.target);
        console.log(character);
        console.log(modalBody);

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

        if(character.species === "Human"){
            especie = "Humano"
        }else{
            especie = "Alienígena"
        }

        if(character.origin.name === "Earth (Replacement Dimension)"){
            planet = "Terra (Dimensão de Substituição)"
        }else if(character.origin.name === "Earth (C-137)"){
            planet = "Terra (C-137)"
        }else if(character.origin.name === "unknown" || character.origin.name === "undefined"){
            planet = "Desconhecido"
        }

        modalHeader.innerHTML = `
            <img src="${character.image}" class="img-fluid mb-3" alt="${character.name}">
            <h5>${character.name}</h5>
        `
        modalBody.innerHTML = `
            
            <p>Status: <span class="status-indicator ${statusClass}"></span> ${statusNaw}</p>
            <p>Espécie: ${especie}</p>
            <p>Planeta: ${planet}</p>
        `;
    }
});

  function updatePaginationButtons() {
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === Math.ceil(characters.length / charactersPerPage);
  }

  function goToNextPage() {
    if (currentPage < Math.ceil(characters.length / charactersPerPage)) {
      currentPage++;
      displayCharacters();
      updatePaginationButtons();
    }
  }

  function goToPrevPage() {
    if (currentPage > 1) {
      currentPage--;
      displayCharacters();
      updatePaginationButtons();
    }
  }

  function filterCharacters() {
    const searchTerm = filter.value.toLowerCase();
    const filteredCharacters = characters.filter((character) =>
      character.name.toLowerCase().includes(searchTerm)
    );
    characters = filteredCharacters;
    currentPage = 1; // Reset to first page after filtering
    displayCharacters();
    updatePaginationButtons();
  }

  function updateTotalCharacters() {
    totalCharacters.innerHTML = `
    <p id="totalCharacters" class="footer-item-p mb-2 mb-md-0">Personagens:
    <span class="footer-item mb-2 mb-md-0">${characters.length}</span>
    </p>
       
    `;

    const locations = new Set(characters.map(character => character.origin.name));
    inputLocation.innerHTML = `
      <p id="totalCharacters" class="footer-item-p mb-2 mb-md-0">LOCALIZAÇÕES:
    <span class="footer-item mb-2 mb-md-0">${locations.size}</span>
    </p> 
    `;

    inputEpisode.innerHTML = `
      <p id="totalCharacters" class="footer-item-p mb-2 mb-md-0">EPISÓDIOS:
    <span class="footer-item mb-2 mb-md-0">${episodes.length}</span>
    </p> 
    `;
  }

  filter.addEventListener("input", filterCharacters);
  nextButton.addEventListener("click", goToNextPage);
  prevButton.addEventListener("click", goToPrevPage);

  // Initial fetch
  fetchCharacters();
  
});
