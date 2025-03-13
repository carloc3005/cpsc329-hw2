let currentPage = 1;
let totalMovies = 0;
let totalPages = 1;

const apiKey = '00c011cf8ae34863f2b8931d4ea1ba4b'; // Your TMDB API key

function loadMovies() {
  // Fetch movies from TMDB's discover endpoint
  fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&page=${currentPage}`)
    .then(response => response.json())
    .then(data => {
      totalMovies = data.total_results;
      totalPages = data.total_pages;

      // Render movie cards using data.results
      renderMovies(data.results);
      
      // Update the pagination info
      updatePagination();
    })
    .catch(error => console.error("Error fetching movies: ", error));
}

function renderMovies(movies) {
  const container = document.querySelector('.card-container');
  container.innerHTML = movies.map(movie => {
    // Build the poster URL. TMDB requires you to prepend with a base URL.
    const posterUrl = movie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
      : 'placeholder.jpg'; // Provide a fallback image if needed

    return `
      <div class="card">
        <img src="${posterUrl}" alt="${movie.title}" />
        <div class="card-content">
          <h3>${movie.title}</h3>
          <p>Release Date: ${movie.release_date}</p>
          <p>Rating: ${movie.vote_average}</p>
        </div>
      </div>
    `;
  }).join('');
}

function updatePagination() {
  document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// Pagination button event listeners
document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    loadMovies(); // Load movies for the previous page
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    loadMovies(); // Load movies for the next page
  }
});

// Initial load of movies
loadMovies();
