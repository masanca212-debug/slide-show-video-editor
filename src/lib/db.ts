import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface VideoEditorDB extends DBSchema {
  users: {
    key: string;
    value: {
      id: string;
      email: string;
      password: string;
      created_at: string;
    };
    indexes: { 'by-email': string };
  };
  projects: {
    key: string;
    value: {
      id: string;
      user_id: string;
      title: string;
      width: number;
      height: number;
      fps: number;
      duration: number;
      created_at: string;
      updated_at: string;
    };
    indexes: { 'by-user': string };
  };
  images: {
    key: string;
    value: {
      id: string;
      project_id: string;
      user_id: string;
      file_name: string;
      file_data: ArrayBuffer;
      file_type: string;
      file_size: number;
      start_time: number;
      duration: number;
      layer: number;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
      opacity: number;
      scale: number;
      effects: string;
      created_at: string;
    };
    indexes: { 'by-project': string };
  };
  music: {
    key: string;
    value: {
      id: string;
      project_id: string;
      user_id: string;
      file_name: string;
      file_data: ArrayBuffer;
      file_type: string;
      file_size: number;
      start_time: number;
      duration: number;
      volume: number;
      created_at: string;
    };
    indexes: { 'by-project': string };
  };
  voiceovers: {
    key: string;
    value: {
      id: string;
      project_id: string;
      user_id: string;
      file_name: string;
      file_data: ArrayBuffer;
      file_type: string;
      file_size: number;
      start_time: number;
      duration: number;
      volume: number;
      created_at: string;
    };
    indexes: { 'by-project': string };
  };
}

let dbInstance: IDBPDatabase<VideoEditorDB> | null = null;

export async function initDB() {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<VideoEditorDB>('video-editor-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' });
        userStore.createIndex('by-email', 'email', { unique: true });
      }

      if (!db.objectStoreNames.contains('projects')) {
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
        projectStore.createIndex('by-user', 'user_id');
      }

      if (!db.objectStoreNames.contains('images')) {
        const imageStore = db.createObjectStore('images', { keyPath: 'id' });
        imageStore.createIndex('by-project', 'project_id');
      }

      if (!db.objectStoreNames.contains('music')) {
        const musicStore = db.createObjectStore('music', { keyPath: 'id' });
        musicStore.createIndex('by-project', 'project_id');
      }

      if (!db.objectStoreNames.contains('voiceovers')) {
        const voiceoverStore = db.createObjectStore('voiceovers', { keyPath: 'id' });
        voiceoverStore.createIndex('by-project', 'project_id');
      }
    },
  });

  return dbInstance;
}

export async function getDB() {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export const db = {
  users: {
    async create(email: string, password: string) {
      const db = await getDB();
      const hashedPassword = await hashPassword(password);
      const user = {
        id: generateId(),
        email,
        password: hashedPassword,
        created_at: new Date().toISOString(),
      };
      await db.add('users', user);
      return { id: user.id, email: user.email, created_at: user.created_at };
    },

    async findByEmail(email: string) {
      const db = await getDB();
      const user = await db.getFromIndex('users', 'by-email', email);
      return user;
    },

    async authenticate(email: string, password: string) {
      const user = await this.findByEmail(email);
      if (!user) return null;

      const hashedPassword = await hashPassword(password);
      if (user.password !== hashedPassword) return null;

      return { id: user.id, email: user.email, created_at: user.created_at };
    },
  },

  projects: {
    async create(userId: string, data: {
      title: string;
      width: number;
      height: number;
      fps: number;
      duration: number;
    }) {
      const db = await getDB();
      const now = new Date().toISOString();
      const project = {
        id: generateId(),
        user_id: userId,
        ...data,
        created_at: now,
        updated_at: now,
      };
      await db.add('projects', project);
      return project;
    },

    async getByUser(userId: string) {
      const db = await getDB();
      return await db.getAllFromIndex('projects', 'by-user', userId);
    },

    async getById(id: string) {
      const db = await getDB();
      return await db.get('projects', id);
    },

    async update(id: string, data: Partial<{
      title: string;
      width: number;
      height: number;
      fps: number;
      duration: number;
    }>) {
      const db = await getDB();
      const project = await db.get('projects', id);
      if (!project) throw new Error('Project not found');

      const updated = {
        ...project,
        ...data,
        updated_at: new Date().toISOString(),
      };
      await db.put('projects', updated);
      return updated;
    },

    async delete(id: string) {
      const db = await getDB();
      await db.delete('projects', id);

      const images = await db.getAllFromIndex('images', 'by-project', id);
      for (const img of images) {
        await db.delete('images', img.id);
      }

      const music = await db.getAllFromIndex('music', 'by-project', id);
      for (const m of music) {
        await db.delete('music', m.id);
      }

      const voiceovers = await db.getAllFromIndex('voiceovers', 'by-project', id);
      for (const v of voiceovers) {
        await db.delete('voiceovers', v.id);
      }
    },
  },

  images: {
    async create(projectId: string, userId: string, file: File, metadata: {
      start_time: number;
      duration: number;
      layer: number;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      rotation?: number;
      opacity?: number;
      scale?: number;
      effects?: string;
    }) {
      const db = await getDB();
      const fileData = await file.arrayBuffer();
      const image = {
        id: generateId(),
        project_id: projectId,
        user_id: userId,
        file_name: file.name,
        file_data: fileData,
        file_type: file.type,
        file_size: file.size,
        x: metadata.x ?? 0,
        y: metadata.y ?? 0,
        width: metadata.width ?? 0,
        height: metadata.height ?? 0,
        rotation: metadata.rotation ?? 0,
        opacity: metadata.opacity ?? 1,
        scale: metadata.scale ?? 1,
        effects: metadata.effects ?? '{}',
        ...metadata,
        created_at: new Date().toISOString(),
      };
      await db.add('images', image);
      return image;
    },

    async getByProject(projectId: string) {
      const db = await getDB();
      return await db.getAllFromIndex('images', 'by-project', projectId);
    },

    async update(id: string, data: Partial<{
      start_time: number;
      duration: number;
      layer: number;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
      opacity: number;
      scale: number;
      effects: string;
    }>) {
      const db = await getDB();
      const image = await db.get('images', id);
      if (!image) throw new Error('Image not found');

      const updated = { ...image, ...data };
      await db.put('images', updated);
      return updated;
    },

    async delete(id: string) {
      const db = await getDB();
      await db.delete('images', id);
    },
  },

  music: {
    async create(projectId: string, userId: string, file: File, metadata: {
      start_time: number;
      duration: number;
      volume?: number;
    }) {
      const db = await getDB();
      const fileData = await file.arrayBuffer();
      const music = {
        id: generateId(),
        project_id: projectId,
        user_id: userId,
        file_name: file.name,
        file_data: fileData,
        file_type: file.type,
        file_size: file.size,
        volume: metadata.volume ?? 1,
        ...metadata,
        created_at: new Date().toISOString(),
      };
      await db.add('music', music);
      return music;
    },

    async getByProject(projectId: string) {
      const db = await getDB();
      return await db.getAllFromIndex('music', 'by-project', projectId);
    },

    async update(id: string, data: Partial<{
      start_time: number;
      duration: number;
      volume: number;
    }>) {
      const db = await getDB();
      const music = await db.get('music', id);
      if (!music) throw new Error('Music not found');

      const updated = { ...music, ...data };
      await db.put('music', updated);
      return updated;
    },

    async delete(id: string) {
      const db = await getDB();
      await db.delete('music', id);
    },
  },

  voiceovers: {
    async create(projectId: string, userId: string, file: File, metadata: {
      start_time: number;
      duration: number;
      volume?: number;
    }) {
      const db = await getDB();
      const fileData = await file.arrayBuffer();
      const voiceover = {
        id: generateId(),
        project_id: projectId,
        user_id: userId,
        file_name: file.name,
        file_data: fileData,
        file_type: file.type,
        file_size: file.size,
        volume: metadata.volume ?? 1,
        ...metadata,
        created_at: new Date().toISOString(),
      };
      await db.add('voiceovers', voiceover);
      return voiceover;
    },

    async getByProject(projectId: string) {
      const db = await getDB();
      return await db.getAllFromIndex('voiceovers', 'by-project', projectId);
    },

    async update(id: string, data: Partial<{
      start_time: number;
      duration: number;
      volume: number;
    }>) {
      const db = await getDB();
      const voiceover = await db.get('voiceovers', id);
      if (!voiceover) throw new Error('Voiceover not found');

      const updated = { ...voiceover, ...data };
      await db.put('voiceovers', updated);
      return updated;
    },

    async delete(id: string) {
      const db = await getDB();
      await db.delete('voiceovers', id);
    },
  },
};
