// Global variables
let currentAnime = null;
let selectedAnime = null;

// ==================== CHOOSE ANIME PAGE ====================
const searchInput = document.querySelector(".find-bar");
const searchBtn = document.querySelector(".find-anime");
const animeTitle = document.getElementById("anime-name-title");
const animeImg = document.getElementById("anime-img");
const addbt = document.querySelector(".add-anime-bt");
const animeCard = document.querySelector(".anime-choose-card")

// Only run if we're on the choose anime page
if (searchBtn && animeTitle && animeImg && addbt) {
  searchBtn.addEventListener("click", searchAnime);
  
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      searchAnime();
    }
  });

  addbt.addEventListener("click", add);
}

async function searchAnime() {
  const query = searchInput.value.trim();

  if (!query) {
    alert("Type an anime name first!");
    animeCard.style.display = "none";
    return;
  }

  animeCard.style.display = "block";
  animeTitle.textContent = "SEARCHING...";
  animeImg.src = "";

  const graphqlQuery = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
        }
        episodes
      }
    }
  `;

  try {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: {
          search: query
        }
      })
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.data || !result.data.Media) {
      animeTitle.textContent = "";
      animeImg.src = "";
      alert("Anime not found!");
      animeCard.style.display = "none";
      return;
    }

    const anime = result.data.Media;

    const title =
      anime.title.english ||
      anime.title.romaji ||
      anime.title.native;

    selectedAnime = {
      id: anime.idMal || anime.id,
      title: title,
      image: anime.coverImage.large || anime.coverImage.medium,
      totalEpisodes: anime.episodes ?? null,
      currentSeason: 1,
      currentEpisode: 1
    };

    currentAnime = anime;

    animeTitle.textContent = selectedAnime.title;
    animeImg.src = selectedAnime.image;
    animeImg.alt = selectedAnime.title;

    console.log("Anime found:", selectedAnime);

  } catch (error) {
    console.error("Error fetching anime:", error);

    animeTitle.textContent = "";
    animeImg.src = "";

    animeCard.style.display = "none";
    alert("Error searching anime. Try again!");
  }
}

function add() {
  if (!selectedAnime) {
    alert("Search for an anime first!");
    animeCard.style.display = "none";
    return;
  }
  
  let watchingList = JSON.parse(localStorage.getItem("watching")) || [];

  // Check if anime is already in the list
  const alreadyExists = watchingList.some(anime => anime.id === selectedAnime.id);
  
  if (alreadyExists) {
    alert("This anime is already in your watching list!");
    animeCard.style.display = "none";
    return;
  }

  watchingList.push(selectedAnime);
  localStorage.setItem("watching", JSON.stringify(watchingList));

  console.log("Added to watching list:", selectedAnime);
  animeCard.style.display = "none";
  alert(`${selectedAnime.title} added to your watching list!`);

  // Clear search
  searchInput.value = "";
  animeTitle.textContent = "";
  animeImg.src = "";
  selectedAnime = null;
}

// ==================== WATCHING PAGE ====================
const watchingContainer = document.getElementById("watching-cards");

// Only run if we're on the watching page
if (watchingContainer) {
  document.addEventListener("DOMContentLoaded", renderWatching);
}

function saveWatching(data) {
  localStorage.setItem("watching", JSON.stringify(data));
}

function createWatchingCard(anime, index) {
  const card = document.createElement("div");
  card.classList.add("anime-card");

  card.innerHTML = `
    <img src="${anime.image}" alt="${anime.title}">
    <div class="anime-card-info">
      <h2>${anime.title}</h2>
      <p>
        Season ${anime.currentSeason}<br>
        Episode ${anime.currentEpisode} / ${anime.totalEpisodes ?? "--"}
      </p>
      <button class="config" data-index="${index}"></button>
    </div>
  `;


  return card;
}

function renderWatching() {
  if (!watchingContainer) return;

  const watching = JSON.parse(localStorage.getItem("watching")) || [];
  watchingContainer.innerHTML = "";

  if (watching.length === 0) {
    watchingContainer.innerHTML = `
      <p style="grid-column: 1/-1; text-align: center; color: #888;">
        No animes in your watching list yet. Go to "Choose the animes" to add some!
      </p>
    `;
    return;
  }

  watching.forEach((anime, index) => {
    watchingContainer.appendChild(createWatchingCard(anime, index));
  });
}

function createWatchingCard(anime, index) {
  const card = document.createElement("div");
  card.classList.add("anime-card");

  card.innerHTML = `
    <img src="${anime.image}" alt="${anime.title}">
    <div class="anime-card-info">
      <h2>${anime.title}</h2>
      <p>
        Season ${anime.currentSeason}<br>
        Episode ${anime.currentEpisode} / ${anime.totalEpisodes ?? "--"}
      </p>
      <button class="config" data-index="${index}"></button>
    </div>
  `;

  // ADICIONA O EVENT LISTENER AQUI, ANTES DO RETURN
  card.querySelector(".config").addEventListener("click", () => {
    openPopup(anime, index);
  });

  return card;
}

function openPopup(anime, index) {
  const popupOverlay = document.getElementById('popup-overlay');
  
  // Preenche os dados do anime no popup
  // (imagem, nome, episódio atual, temporada atual, etc)
  
  // Mostra o popup
  popupOverlay.style.display = 'flex';
  
  // Guarda o índice pra saber qual anime está editando
  // você vai precisar disso pra salvar/deletar depois
}