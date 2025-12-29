import { User, Release, Track, Ticket } from './db';

const users: User[] = [
  {
    id: 1,
    email: 'moder@olprod.ru',
    password: 'zzzz-2014',
    name: 'Модератор',
    role: 'admin',
    balance: 0,
    created_at: new Date().toISOString()
  }
];

const releases: Release[] = [];
let tracks: Track[] = [];
const tickets: Ticket[] = [];

let currentUserId = 2;
let currentReleaseId = 1;
let currentTrackId = 1;
let currentTicketId = 1;

export const mockDb = {
  users: {
    findByEmail: (email: string) => users.find(u => u.email === email),
    findById: (id: number) => users.find(u => u.id === id),
    create: (data: Omit<User, 'id' | 'created_at'>) => {
      const user: User = {
        ...data,
        id: currentUserId++,
        created_at: new Date().toISOString()
      };
      users.push(user);
      return user;
    },
    updateBalance: (id: number, balance: number) => {
      const user = users.find(u => u.id === id);
      if (user) user.balance = balance;
      return user;
    }
  },
  releases: {
    findAll: () => releases,
    findByUserId: (userId: number) => releases.filter(r => r.user_id === userId && r.status !== 'deleted'),
    findDeletedByUserId: (userId: number) => releases.filter(r => r.user_id === userId && r.status === 'deleted'),
    findByStatus: (status: string) => releases.filter(r => r.status === status),
    findById: (id: number) => releases.find(r => r.id === id),
    search: (query: string) => releases.filter(r => r.title.toLowerCase().includes(query.toLowerCase())),
    create: (data: Omit<Release, 'id' | 'created_at' | 'updated_at'>) => {
      const release: Release = {
        ...data,
        id: currentReleaseId++,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      releases.push(release);
      return release;
    },
    update: (id: number, data: Partial<Release>) => {
      const index = releases.findIndex(r => r.id === id);
      if (index !== -1) {
        releases[index] = {
          ...releases[index],
          ...data,
          updated_at: new Date().toISOString()
        };
        return releases[index];
      }
      return null;
    },
    delete: (id: number) => {
      const index = releases.findIndex(r => r.id === id);
      if (index !== -1) {
        const oldStatus = releases[index].status;
        releases[index] = {
          ...releases[index],
          status: 'deleted',
          rejection_reason: oldStatus === 'deleted' ? releases[index].rejection_reason : `_prev_status:${oldStatus}`,
          updated_at: new Date().toISOString()
        };
        return true;
      }
      return false;
    }
  },
  tracks: {
    findByReleaseId: (releaseId: number) => tracks.filter(t => t.release_id === releaseId).sort((a, b) => a.track_order - b.track_order),
    create: (data: Omit<Track, 'id' | 'created_at'>) => {
      const track: Track = {
        ...data,
        id: currentTrackId++,
        created_at: new Date().toISOString()
      };
      tracks.push(track);
      return track;
    },
    update: (id: number, data: Partial<Track>) => {
      const index = tracks.findIndex(t => t.id === id);
      if (index !== -1) {
        tracks[index] = { ...tracks[index], ...data };
        return tracks[index];
      }
      return null;
    },
    deleteByReleaseId: (releaseId: number) => {
      tracks = tracks.filter(t => t.release_id !== releaseId);
    }
  },
  tickets: {
    findAll: () => tickets,
    findByUserId: (userId: number) => tickets.filter(t => t.user_id === userId),
    findById: (id: number) => tickets.find(t => t.id === id),
    create: (data: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>) => {
      const ticket: Ticket = {
        ...data,
        id: currentTicketId++,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      tickets.push(ticket);
      return ticket;
    },
    update: (id: number, data: Partial<Ticket>) => {
      const index = tickets.findIndex(t => t.id === id);
      if (index !== -1) {
        tickets[index] = {
          ...tickets[index],
          ...data,
          updated_at: new Date().toISOString()
        };
        return tickets[index];
      }
      return null;
    }
  }
};