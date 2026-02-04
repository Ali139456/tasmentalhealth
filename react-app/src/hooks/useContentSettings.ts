import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface ContentSettings {
  [key: string]: string
}

export function useContentSettings() {
  const [settings, setSettings] = useState<ContentSettings>({})
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_content_settings')
        .select('setting_key, value')

      if (error) throw error

      const settingsMap: ContentSettings = {}
      data?.forEach(setting => {
        settingsMap[setting.setting_key] = setting.value
      })
      setSettings(settingsMap)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching content settings:', error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchSettings()

    // Set up real-time subscription for changes
    const channel = supabase
      .channel('content-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'site_content_settings'
        },
        (payload) => {
          // Refetch settings immediately when any change occurs
          fetchSettings()
        }
      )
      .subscribe()

    // Also poll every 2 seconds as a backup (in case real-time doesn't work)
    const pollInterval = setInterval(() => {
      fetchSettings()
    }, 2000)

    return () => {
      // Cleanup
      supabase.removeChannel(channel)
      clearInterval(pollInterval)
    }
  }, [fetchSettings])

  return { settings, loading, refetch: fetchSettings }
}
