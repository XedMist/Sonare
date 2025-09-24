import Album from './Album.ts';

type Genre = "Rock" | "Pop" | "Jazz" | "Classical" | "Hip-Hop" | "Electronic" | "Country" | "Reggae" | "Blues" | "Folk" | "Metal" | "Punk" | "R&B" | "Soul" | "Funk" | "Disco" | "Gospel" | "Ska" | "Techno" | "House";

export default class Track {
    name: string;
    duration: number;
    path: string;
    album?: Album;
    genres?: Genre[] = [];

    constructor(name: string, duration: number, path: string, album?: Album, genres?: Genre[]) {
        this.name = name;
        this.duration = duration;
        this.path = path;
        this.album = album;
        this.genres = genres;
    }
};