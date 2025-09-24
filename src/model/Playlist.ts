import Track from './Track.ts';

export default class Playlist {
    name: string;
    tracks: Track[] = [];

    constructor(name: string, tracks: Track[]) {
        this.name = name;
        this.tracks = tracks;
    }


    getTotalDuration(): number {
        return this.tracks.reduce((total, track) => total + track.duration, 0);
    }

}