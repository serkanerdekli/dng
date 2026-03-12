
import { Book, Branch, User, InventoryLog, Campaign } from '../types';

const API_BASE = '/api';

export const apiService = {
  // Books
  async getBooks(): Promise<Book[]> {
    const res = await fetch(`${API_BASE}/books`);
    if (!res.ok) throw new Error('Failed to fetch books');
    return res.json();
  },
  async saveBook(book: Partial<Book>): Promise<Book> {
    const res = await fetch(`${API_BASE}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });
    if (!res.ok) throw new Error('Failed to save book');
    const data = await res.json();
    return data[0];
  },
  async deleteBook(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete book');
  },

  // Branches
  async getBranches(): Promise<Branch[]> {
    const res = await fetch(`${API_BASE}/branches`);
    if (!res.ok) throw new Error('Failed to fetch branches');
    return res.json();
  },
  async saveBranch(branch: Partial<Branch>): Promise<Branch> {
    const res = await fetch(`${API_BASE}/branches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branch),
    });
    if (!res.ok) throw new Error('Failed to save branch');
    const data = await res.json();
    return data[0];
  },
  async deleteBranch(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/branches/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete branch');
  },

  // Users
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },
  async saveUser(user: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Failed to save user');
    const data = await res.json();
    return data[0];
  },
  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete user');
  },

  // Logs
  async getLogs(): Promise<InventoryLog[]> {
    const res = await fetch(`${API_BASE}/logs`);
    if (!res.ok) throw new Error('Failed to fetch logs');
    return res.json();
  },
  async saveLog(log: Partial<InventoryLog>): Promise<InventoryLog> {
    const res = await fetch(`${API_BASE}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    if (!res.ok) throw new Error('Failed to save log');
    const data = await res.json();
    return data[0];
  },

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    const res = await fetch(`${API_BASE}/campaigns`);
    if (!res.ok) throw new Error('Failed to fetch campaigns');
    return res.json();
  },
  async saveCampaign(campaign: Partial<Campaign>): Promise<Campaign> {
    const res = await fetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaign),
    });
    if (!res.ok) throw new Error('Failed to save campaign');
    const data = await res.json();
    return data[0];
  },
  async deleteCampaign(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/campaigns/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete campaign');
  },
};
