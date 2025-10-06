import { useState, useEffect } from 'react'
import { supabase, type Event, type Group, type UserProfile } from '@/lib/supabase'

// Hook for fetching events
export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  const addEvent = async (event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([event])
        .select()

      if (error) throw error
      if (data) {
        setEvents(prev => [...prev, ...data])
      }
      return { success: true, data }
    } catch (err) {
      console.error('Error adding event:', err)
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error
      if (data) {
        setEvents(prev => prev.map(event => 
          event.id === id ? { ...event, ...data[0] } : event
        ))
      }
      return { success: true, data }
    } catch (err) {
      console.error('Error updating event:', err)
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) throw error
      setEvents(prev => prev.filter(event => event.id !== id))
      return { success: true }
    } catch (err) {
      console.error('Error deleting event:', err)
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents
  }
}

// Hook for fetching groups
export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setGroups(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching groups:', err)
    } finally {
      setLoading(false)
    }
  }

  const addGroup = async (group: Omit<Group, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([group])
        .select()

      if (error) throw error
      if (data) {
        setGroups(prev => [...prev, ...data])
      }
      return { success: true, data }
    } catch (err) {
      console.error('Error adding group:', err)
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const updateGroup = async (id: string, updates: Partial<Group>) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error
      if (data) {
        setGroups(prev => prev.map(group => 
          group.id === id ? { ...group, ...data[0] } : group
        ))
      }
      return { success: true, data }
    } catch (err) {
      console.error('Error updating group:', err)
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  const deleteGroup = async (id: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id)

      if (error) throw error
      setGroups(prev => prev.filter(group => group.id !== id))
      return { success: true }
    } catch (err) {
      console.error('Error deleting group:', err)
      return { success: false, error: err instanceof Error ? err.message : 'An error occurred' }
    }
  }

  return {
    groups,
    loading,
    error,
    addGroup,
    updateGroup,
    deleteGroup,
    refetch: fetchGroups
  }
}

// Hook for user profile management
export function useUserProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        throw error
      }

      setProfile(data)
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userId) return

    try {
      setError(null)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      setProfile(data)
      return data
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      throw err
    }
  }

  const addInterest = async (interest: string) => {
    if (!profile) return
    
    const newInterests = [...(profile.interests || []), interest]
    return updateProfile({ interests: newInterests })
  }

  const removeInterest = async (interest: string) => {
    if (!profile) return
    
    const newInterests = (profile.interests || []).filter(i => i !== interest)
    return updateProfile({ interests: newInterests })
  }

  const addVisitedEvent = async (eventId: string) => {
    if (!profile) return
    
    const newVisitedEvents = [...(profile.visited_events || []), eventId]
    return updateProfile({ visited_events: newVisitedEvents })
  }

  const joinGroup = async (groupId: string) => {
    if (!profile) return
    
    const newJoinedGroups = [...(profile.joined_groups || []), groupId]
    return updateProfile({ joined_groups: newJoinedGroups })
  }

  const leaveGroup = async (groupId: string) => {
    if (!profile) return
    
    const newJoinedGroups = (profile.joined_groups || []).filter(id => id !== groupId)
    return updateProfile({ joined_groups: newJoinedGroups })
  }

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return {
    profile,
    loading,
    error,
    updateProfile,
    addInterest,
    removeInterest,
    addVisitedEvent,
    joinGroup,
    leaveGroup,
    refetch: fetchProfile
  }
}