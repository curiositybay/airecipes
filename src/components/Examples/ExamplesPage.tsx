'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { getTheme } from '@/config/theme';

interface Example {
  id: number;
  name: string;
  description: string;
}

const ExamplesPage = () => {
  const theme = getTheme('ocean');
  const [examples, setExamples] = useState<Example[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newExample, setNewExample] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchExamples();
  }, []);

  const fetchExamples = async () => {
    try {
      setLoading(true);
      const data = await api.get<{ data: Example[] }>('/api/v1/examples');
      setExamples(data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch examples. Make sure the backend is running.');
      console.error('Error fetching examples:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExample.name.trim()) return;

    try {
      const data = await api.post<{ data: Example }>(
        '/api/v1/examples',
        newExample
      );
      setExamples([data.data, ...examples]);
      setNewExample({ name: '', description: '' });
      setError(null);
    } catch (err) {
      setError('Failed to create example.');
      console.error('Error creating example:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete('/api/v1/examples/' + id);
      setExamples(examples.filter(example => example.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete example.');
      console.error('Error deleting example:', err);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div
          className={`animate-spin rounded-full h-8 w-8 border-b-2 ${theme.colors.text.iconPrimary}`}
          role='status'
        ></div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className={`text-3xl font-bold mb-8 ${theme.colors.text.primary}`}>
        Examples
      </h1>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className='mb-8'>
        <div className='flex gap-4'>
          <input
            type='text'
            placeholder='Example name'
            value={newExample.name}
            onChange={e =>
              setNewExample({
                ...newExample,
                name: e.target.value,
              })
            }
            className={`flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 ${theme.colors.text.iconPrimary}`}
          />
          <input
            type='text'
            placeholder='Description'
            value={newExample.description}
            onChange={e =>
              setNewExample({
                ...newExample,
                description: e.target.value,
              })
            }
            className={`flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 ${theme.colors.text.iconPrimary}`}
          />
          <button
            type='submit'
            className={`px-6 py-2 text-white rounded focus:outline-none focus:ring-2 ${theme.colors.primary} ${theme.colors.primaryHover}`}
          >
            Create Example
          </button>
        </div>
      </form>

      <div className='grid gap-4'>
        {examples.map(example => (
          <div
            key={example.id}
            className='border border-gray-200 rounded-lg p-4'
          >
            <div className='flex justify-between items-start'>
              <div>
                <h3
                  className={`text-lg font-semibold ${theme.colors.text.primary}`}
                >
                  {example.name}
                </h3>
                <p className={theme.colors.text.muted}>{example.description}</p>
              </div>
              <button
                onClick={() => handleDelete(example.id)}
                className='px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700'
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamplesPage;
