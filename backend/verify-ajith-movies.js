import mongoose from 'mongoose';
import Movie from './models/Movie.js';

mongoose.connect('mongodb://localhost:27017/streamverse')
  .then(async () => {
    const ajithMovies = await Movie.find({ 'cast.name': 'Ajith Kumar' })
      .select('title year genres views averageRating')
      .sort({ year: -1 });

    console.log('='.repeat(70));
    console.log('AJITH KUMAR MOVIES IN DATABASE:');
    console.log('='.repeat(70));

    ajithMovies.forEach((m, i) => {
      console.log(`${i+1}. ${m.title} (${m.year})`);
      console.log(`   Genres: ${m.genres.join(', ')}`);
      console.log(`   Rating: ${m.averageRating}/5 ⭐ | Views: ${m.views.toLocaleString()} 👁`);
      console.log('');
    });

    console.log('='.repeat(70));
    console.log(`Total Ajith Kumar Movies: ${ajithMovies.length}`);
    console.log('='.repeat(70));

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
