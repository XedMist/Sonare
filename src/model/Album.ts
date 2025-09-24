import Artist from "./Artist.ts";
import Track from "./Track.ts";

export default class Album {
    name: string;
    artists: Artist[] = [];
    tracks: Track[] = [];

    constructor(name: string, artists: Artist[], tracks: Track[] = []) {
        this.name = name;
        this.artists = artists;
        this.tracks = tracks;
    }

};