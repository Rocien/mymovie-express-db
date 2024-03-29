const axios = require('axios'); // Import axios for making HTTP requests

// I unified search function for movies, with dynamic sorting based on my route
exports.searchMovies = async (req, res) => {
  const { keyword } = req.query; // Extract 'keyword' from query parameters
  let sortBy = 'popularity.desc'; // Default sorting criteria

  // Determining the sorting criteria based on the requested route
  if (req.path.includes('/popularity')) {
    sortBy = 'popularity.desc';
  } else if (req.path.includes('/release-date')) {
    sortBy = 'release_date.desc';
  } else if (req.path.includes('/vote')) {
    sortBy = 'vote_average.desc';
  }

  try {
    // Constructing the URL for the TMDB API request with dynamic sorting
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIEDB_API_KEY}&query=${keyword}&sort_by=${sortBy}`;
    const response = await axios.get(url);
    // Simplify the response to include only id, title, and poster_path
    const movies = response.data.results.map(({ id, title, poster_path }) => ({
      id,
      title,
      poster_path
    }));
    // Send the simplified movie list as a JSON response
    res.json(movies);
  } catch (error) {
    // Handle errors by sending a 500 Internal Server Error status
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Retrieve movie details by ID, with caching in Redis
exports.getMovieById = async (req, res) => {
  const { id } = req.params; // Extract the movie ID from URL parameters
  try {
    const cachedMovie = await req.redisClient.get(id); // Try to retrieve movie details from Redis cache
    if (cachedMovie) {
      // If movie details are found in cache, return them
      return res.json(JSON.parse(cachedMovie));
    } else {
      // If not found in cache, fetch movie details from TMDB API
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.MOVIEDB_API_KEY}`
      );
      // Cache the fetched movie details in Redis, with an expiration of 24 hours
      await req.redisClient.set(id, JSON.stringify(response.data), { EX: 86400 });
      // Return the fetched movie details as a JSON response
      res.json(response.data);
    }
  } catch (error) {
    // Handle errors by sending a 500 Internal Server Error status
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch and return metadata about image base URL and available sizes
exports.getMetadata = async (req, res) => {
  try {
    // Fetch the configuration data from the TMDB API
    const response = await axios.get(
      `https://api.themoviedb.org/3/configuration?api_key=${process.env.MOVIEDB_API_KEY}`
    );
    // Extract the image base URL and sizes from the response
    const { secure_base_url, poster_sizes } = response.data.images;
    // Format and return the metadata as specified
    res.json({
      meta: {
        images: {
          baseUrl: secure_base_url,
          sizes: poster_sizes // Return sizes as a single array
        }
      }
    });
  } catch (error) {
    // Handle errors by sending a 500 Internal Server Error status
    res.status(500).json({ error: 'Internal server error' });
  }
};
