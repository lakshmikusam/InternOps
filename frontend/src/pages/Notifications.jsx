import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'

export default function Notifications() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => api.get(`/notifications?page=${page}&limit=20`).then(res => res.data),
    refetchInterval: 30000, // poll every 30s
  })

  const markReadMut = useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries('notifications')
  })

  const markAllReadMut = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries('notifications')
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries('notifications')
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <button onClick={() => markAllReadMut.mutate()} className="bg-blue-500 text-white px-3 py-1 rounded">
          Mark All Read
        </button>
      </div>
      {isLoading && <p>Loading...</p>}
      {data?.data?.map(n => (
        <div key={n.id} className={`border p-3 mb-2 rounded ${n.read ? 'bg-gray-50' : 'bg-white'}`}>
          <p>{n.message}</p>
          <p className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</p>
          <div className="flex gap-2 mt-1">
            {!n.read && (
              <button onClick={() => markReadMut.mutate(n.id)} className="text-blue-600 text-sm">Mark read</button>
            )}
            <button onClick={() => deleteMut.mutate(n.id)} className="text-red-600 text-sm">Delete</button>
          </div>
        </div>
      ))}
      {data && (
        <div className="flex gap-2 mt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="bg-gray-300 px-3 py-1 rounded">Prev</button>
          <span>Page {data.page} of {Math.ceil(data.total / data.limit)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * data.limit >= data.total} className="bg-gray-300 px-3 py-1 rounded">Next</button>
        </div>
      )}
    </div>
  )
}
