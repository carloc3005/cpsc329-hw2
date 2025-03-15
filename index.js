// Global state
let currentPage = 1;
let totalMovies = 0;
let totalPages = 1;
let currentSearchQuery = "";
let currentSortOption = "";

// TMDB API key
const apiKey = '00c011cf8ae34863f2b8931d4ea1ba4b';

// Define available sort options
const sortOptions = [
  { value: "releaseAsc", label: "Release Date (Ascending)", tmdbValue: "release_date.asc" },
  { value: "releaseDesc", label: "Release Date (Descending)", tmdbValue: "release_date.desc" },
  { value: "ratingAsc", label: "Rating (Ascending)", tmdbValue: "vote_average.asc" },
  { value: "ratingDesc", label: "Rating (Descending)", tmdbValue: "vote_average.desc" }
];

// Populate sort dropdown from sortOptions array
function populateSortOptions() {
  const select = document.getElementById("sortOptions");
  // Default option is now clickable (not disabled)
  select.innerHTML = '<option value="">Sort By</option>';
  sortOptions.forEach(option => {
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.label;
    select.appendChild(opt);
  });
}

// Returns the TMDB sort_by parameter for the selected option
function mapSortOption(optionValue) {
  const option = sortOptions.find(opt => opt.value === optionValue);
  return option ? option.tmdbValue : "";
}

// Fetch movies from TMDB API
function loadMovies() {
  let url = "";
  
  if (currentSearchQuery.trim() !== "") {
    // Search endpoint (exclude adult films)
    url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
      currentSearchQuery
    )}&include_adult=false&page=${currentPage}`;
  } else {
    // Discover endpoint (exclude adult films)
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&include_adult=false&page=${currentPage}`;
    if (currentSortOption) {
      url += `&sort_by=${mapSortOption(currentSortOption)}`;
      // If sorting by release date descending, limit to movies released up to 2025
      if (currentSortOption === 'releaseDesc') {
        url += "&primary_release_date.lte=2025-12-31";
      }
    }
  }
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      totalMovies = data.total_results;
      totalPages = data.total_pages;
      
      let movies = data.results;
      
      // For search results with a sort option, sort client-side.
      if (currentSearchQuery.trim() !== "" && currentSortOption) {
        movies.sort((a, b) => {
          if (currentSortOption === 'ratingAsc') return a.vote_average - b.vote_average;
          if (currentSortOption === 'ratingDesc') return b.vote_average - a.vote_average;
          if (currentSortOption === 'releaseAsc') return new Date(a.release_date) - new Date(b.release_date);
          if (currentSortOption === 'releaseDesc') return new Date(b.release_date) - new Date(a.release_date);
          return 0;
        });
      }
      
      renderMovies(movies);
      updatePagination();
    })
    .catch(error => console.error("Error fetching movies:", error));
}

// Render movies into the card container
function renderMovies(movies) {
  const container = document.querySelector('.card-container');
  container.innerHTML = movies
    .map(movie => {
      const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'placeholder.jpg'; // Make sure this file exists in your project
      
      return `
        <div class="card">
          <img src="${posterUrl}" alt="${movie.title}" />
          <div class="card-content">
            <h3>${movie.title}</h3>
            <p>Release Date: ${movie.release_date || "N/A"}</p>
            <p>Rating: ${movie.vote_average || "N/A"}</p>
          </div>
        </div>
      `;
    })
    .join('');
}

// Update pagination UI controls
function updatePagination() {
  document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// Event listeners for pagination buttons
document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    loadMovies();
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    loadMovies();
  }
});

// Update search query as user types
document.getElementById('searchInput').addEventListener('input', () => {
  currentSearchQuery = document.getElementById('searchInput').value;
  currentPage = 1;
  loadMovies();
});

// Update sort option when changed
const sortDropdown = document.getElementById('sortOptions');
sortDropdown.addEventListener('change', (event) => {
  currentSortOption = event.target.value;
  currentPage = 1;
  loadMovies();
});

// Reset sort when the sort dropdown is double-clicked
sortDropdown.addEventListener('dblclick', () => {
  currentSortOption = "";
  sortDropdown.value = "";
  currentPage = 1;
  loadMovies();
});

// Initialize sort dropdown and fetch initial movies
populateSortOptions();
loadMovies();
