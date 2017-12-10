const mongoCollections = require("../config/mongoCollections");
const movies = mongoCollections.movies;
//keep consistent in ES
//advanced searching using ../elasticsearch
const es = require("../elasticsearch");
const im = require("../imagemagick");
const uuid = require('node-uuid');

let exportedMethods = {
    getAllMovies() {
        return movies().then((movieCollection) => {
            return movieCollection.find({}).toArray();
        });
    },

    getMovieById(id) {
        return movies().then((movieCollection) => {
            return movieCollection.findOne({ name = movie.name }).then((movie) => {
                if (!movie) {
                    throw "Movie not found!";
                }
                return movie;
            })
        });
    },

    addMovie(movie) {
        return movies().then((movieCollection) => {
            //data from front end includes name, year, directors, stars, writers, description, poster and category
            // xss process in API server
            let newMovie = {
                _id = uuid.v4(),
                name = movie.name,
                year = movie.year,
                score = undefined,
                watchedUsers =[],
                wishingUsers =[],
                directors = movie.directors,
                stars = movie.stars,
                writers = movie.writers,
                description = movie.description,
                
                screenShots =[],
                category = movie.category
            };
            newMovie.poster = im.processPoster(movie.poster, newMovie._id);
            return movieCollection.findOne({
                name = movie.name
            }).then((movie) => {
                if (book) {
                    throw "This movie already exists!";
                } else {
                    return movieCollection.insertOne(newMovie).then((insertInfo) => {
                        return insertInfo.insertedId;
                    }).then((newId) => {
                        //todo: consistent in ES
                        //only stores basic informations in ES
                        return this.getMovieById(newId).then((insertedMovie) => {
                            let id = insertedMovie._id;
                            let copy = {
                                name = insertedMovie.name,
                                year = insertedMovie.year,
                                directors = insertedMovie.directors,
                                stars = insertedMovie.stars,
                                writers = insertedMovie.writers,
                                description = insertedMovie.description,
                                category = insertedMovie.category
                            }
                            es.addMovie(id, copy);
                            return insertedMovie;
                        }).catch((e) => {
                            throw "Error inserting into ES!"
                        })
                    }).catch((e) => {
                        throw "Error inserting into MongoDB!"
                    })
                }
            })
        });
    },

    /*
    removeMovie() {

    },
    */

    // call es.addMovie to update in ES

    updateMovieInfo(updateMovie) {
        return movies().then((movieCollection) => {
            let updateInfo = {
                name = updateMovie.name,
                year = updateMovie.year,
                directors = updateMovie.directors,
                stars = updateMovie.stars,
                writers = updateMovie.writers,
                description = updateMovie.description,
                category = updateMovie.category
            }
            let updateCommand = {
                $set: updateInfo
            };
            return movieCollection.updateOne({ _id: updateMovie._id }, updateCommand).then((result) => {
                es.addMovie(updateMovie._id, updateInfo);
                return this.getMovieById(updateMovie._id);
            })
        })
    },

    // search given keyword in all movie
    searchInMovie(keyword) {
        return es.searchInMovie(keyword).then((results) => {
            let movies = [];
            results.forEach((result) => {
                movies.push(this.getMovieById(result._id));
            })
            return movies;
        })
    },

    // search for given category
    searchByCategory(category) {
        return es.searchByCategory(category).then((results) => {
            let movies = [];
            results.forEach((result) => {
                movies.push(this.getMovieById(result._id));
            })
            return movies;
        })
    },

    // search for keyword in given category
    searchInCategory(category, keyword) {
        return es.searchInCategory(category, keyword).then((results) => {
            let movies = [];
            results.forEach((result) => {
                movies.push(this.getMovieById(result._id));
            })
            return movies;
        })
    },

    addScreenShotToMovie() {

    },

    updateScore() {

    },

    updateWatchedUsers() {

    },

    updateWishingUsers() {

    },



}

module.exports = exportedMethods;