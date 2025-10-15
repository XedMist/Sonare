import { int, sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
});

export type InsertUser = typeof usersTable.$inferInsert;

export const tracksTable = sqliteTable("tracks", {
  id: int().primaryKey({ autoIncrement: true }),
  path: text().notNull().unique(),
  name: text().notNull(),
  duration: int().notNull(), // seconds
  thumbnail: text(),
});

export const tracksRelations = relations(tracksTable, ({ many }) => ({
  tracksToAlbumsTable: many(tracksToAlbumsTable),
}));

export type InsertTrack = typeof tracksTable.$inferInsert;

export const albumsTable = sqliteTable("albums", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
});

export const albumsRelations = relations(albumsTable, ({ many }) => ({
  tracksToAlbumsTable: many(tracksToAlbumsTable),
  albumsToArtistsTable: many(albumsToArtistsTable),
}));

export const tracksToAlbumsTable = sqliteTable("tracks_to_albums", {
  trackId: int("track_id").notNull().references(() => tracksTable.id, { onDelete: "cascade" }),
  albumId: int("album_id").notNull().references(() => albumsTable.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.trackId, table.albumId] }),
}));

export const tracksToAlbumsRelations = relations(
  tracksToAlbumsTable,
  ({ one }) => ({
    track: one(tracksTable, {
      fields: [tracksToAlbumsTable.trackId],
      references: [tracksTable.id],
    }),
    album: one(albumsTable, {
      fields: [tracksToAlbumsTable.albumId],
      references: [albumsTable.id],
    }),
  }),
);

export const artistsTable = sqliteTable("artists", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
});

export const artistsRelations = relations(artistsTable, ({ many }) => ({
  albums: many(albumsToArtistsTable),
}));

export type InsertArtist = typeof artistsTable.$inferInsert;

export const albumsToArtistsTable = sqliteTable("albums_to_artists", {
  albumId: int("album_id").notNull().references(() => albumsTable.id, { onDelete: "cascade" }),
  artistId: int("artist_id").notNull().references(() => artistsTable.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.albumId, table.artistId] }),
}));

export const albumsToArtistsRelations = relations(
  albumsToArtistsTable,
  ({ one }) => ({
    album: one(albumsTable, {
      fields: [albumsToArtistsTable.albumId],
      references: [albumsTable.id],
    }),
    artist: one(artistsTable, {
      fields: [albumsToArtistsTable.artistId],
      references: [artistsTable.id],
    }),
  }),
);

export const playlistsTable = sqliteTable("playlists", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  userId: int().notNull().references(() => usersTable.id, { onDelete: "cascade" }),
});

export const playlistsRelations = relations(
  playlistsTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [playlistsTable.userId],
      references: [usersTable.id],
    }),
    tracks: many(playlistsToTracksTable),
  }),
);

export const playlistsToTracksTable = sqliteTable("playlists_to_tracks", {
  playlistId: int("playlist_id").notNull().references(() => playlistsTable.id, { onDelete: "cascade" }),
  trackId: int("track_id").notNull().references(() => tracksTable.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.playlistId, table.trackId] }),
}));

export const playlistsToTracksRelations = relations(
  playlistsToTracksTable,
  ({ one }) => ({
    playlist: one(playlistsTable, {
      fields: [playlistsToTracksTable.playlistId],
      references: [playlistsTable.id],
    }),
    track: one(tracksTable, {
      fields: [playlistsToTracksTable.trackId],
      references: [tracksTable.id],
    }),
  }),
);
