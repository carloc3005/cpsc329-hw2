let currentPage = 1;
let totalMovies = 0;
let totalPages = 1;
let currentSearchQuery = "";
let currentSortOption = "";

const apiKey = '00c011cf8ae34863f2b8931d4ea1ba4b'; // My API key

// Define sort options in JS
const sortOptions = [
  { value: "releaseAsc", label: "Release Date (Ascending)", tmdbValue: "release_date.asc" },
  { value: "releaseDesc", label: "Release Date (Descending)", tmdbValue: "release_date.desc" },
  { value: "ratingAsc", label: "Rating (Ascending)", tmdbValue: "vote_average.asc" },
  { value: "ratingDesc", label: "Rating (Descending)", tmdbValue: "vote_average.desc" }
];

// Populate the sort select element from the sortOptions array
function populateSortOptions() {
  const select = document.getElementById("sortOptions");
  // Clear any existing options and add a placeholder
  select.innerHTML = '<option value="" disabled selected>Sort By</option>';
  sortOptions.forEach(option => {
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.label;
    select.appendChild(opt);
  });
}

// Map the selected sort option to TMDB's sort_by parameter
function mapSortOption(optionValue) {
  const option = sortOptions.find(opt => opt.value === optionValue);
  return option ? option.tmdbValue : "";
}

// Load movies using either the search or discover endpoint
function loadMovies() {
  let url = "";
  if (currentSearchQuery.trim() !== "") {
    // Use search endpoint if there's a query
    url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(currentSearchQuery)}&page=${currentPage}`;
  } else {
    // Use discover endpoint with sort_by parameter (if selected)
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${currentPage}`;
    if (currentSortOption) {
      url += `&sort_by=${mapSortOption(currentSortOption)}`;
    }
  }

  fetch(url)
    .then(response => response.json())
    .then(data => {
      totalMovies = data.total_results;
      totalPages = data.total_pages;
      
      let movies = data.results;
      
      // If using search and a sort option is chosen, sort client side.
      if (currentSearchQuery.trim() !== "" && currentSortOption) {
        movies.sort((a, b) => {
          if (currentSortOption === 'ratingAsc') {
            return a.vote_average - b.vote_average;
          } else if (currentSortOption === 'ratingDesc') {
            return b.vote_average - a.vote_average;
          } else if (currentSortOption === 'releaseAsc') {
            return new Date(a.release_date) - new Date(b.release_date);
          } else if (currentSortOption === 'releaseDesc') {
            return new Date(b.release_date) - new Date(a.release_date);
          }
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
  container.innerHTML = movies.map(movie => {
    const posterUrl = movie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
      : 'placeholder.jpg'; // Fallback image if needed

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
  }).join('');
}

// Update pagination controls UI
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

// Listen for search input changes
document.getElementById('searchInput').addEventListener('input', () => {
  currentSearchQuery = document.getElementById('searchInput').value;
  currentPage = 1; // Reset to first page for new search queries
  loadMovies();
});

// Listen for sort option changes
document.getElementById('sortOptions').addEventListener('change', (event) => {
  currentSortOption = event.target.value;
  currentPage = 1; // Reset to first page when sort order changes
  loadMovies();
});

// Initialize sort options and load movies on page load
populateSortOptions();
loadMovies();
