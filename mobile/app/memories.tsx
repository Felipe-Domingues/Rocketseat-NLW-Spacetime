import {
  ScrollView,
  TouchableOpacity,
  View,
  Text,
  Image,
  RefreshControl,
} from 'react-native'
import Icon from '@expo/vector-icons/Feather'
import * as SecureStore from 'expo-secure-store'
import { Video } from 'expo-av'

import NLWLogo from '../src/assets/nlw-spacetime-logo.svg'
import { Link, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useCallback, useEffect, useState } from 'react'
import { api } from '../src/lib/api'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'
import mime from 'mime'

dayjs.locale(ptBr)

interface Memory {
  coverUrl: string
  excerpt: string
  id: string
  createdAt: string
}

export default function Memories() {
  const { bottom, top } = useSafeAreaInsets() // Retorna a distancia de padding que deverá ser dada para cada dispositivo
  const router = useRouter()
  const [memories, setMemories] = useState<Memory[]>([])

  async function signOut() {
    await SecureStore.deleteItemAsync('token')

    router.replace('/')
  }

  async function loadMemories() {
    const token = await SecureStore.getItemAsync('token')

    const response = await api.get('/memories', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    setMemories(response.data)
  }
  useEffect(() => {
    loadMemories()
  }, [])

  const [refreshing, setRefreshing] = useState(false)
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(async () => {
      await loadMemories()
      setRefreshing(false)
    }, 2000)
  }, [])

  return (
    <>
      <View
        className="flex-row items-center justify-between px-8 pb-4"
        style={{ paddingTop: top }}
      >
        <NLWLogo />

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={signOut}
            className="h-10 w-10 items-center justify-center rounded-full bg-red-500"
          >
            <Icon name="log-out" size={16} color="#000" />
          </TouchableOpacity>

          <Link href="/new" asChild>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <Icon name="plus" size={16} color="#000" />
            </TouchableOpacity>
          </Link>
        </View>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: bottom }}
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            tintColor="#FFFFFF"
            title="Atualizar"
            titleColor="#FFFFFF"
            colors={['#FFFFFF']}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <View className="mt-6 space-y-10">
          {memories.map((memory) => {
            let mimeType = mime.getType(memory.coverUrl)
            !mimeType && (mimeType = '')
            const mimeTypeImageRegex = /^(image)\/[a-zA-Z]+/
            const mimeTypeVideoRegex = /^(video)\/[a-zA-Z]+/

            return (
              <View key={memory.id} className="space-y-4">
                <View className="flex-row items-center gap-2">
                  <View className="h-px w-5 bg-gray-50" />
                  <Text className="font-body text-xs text-gray-100">
                    {dayjs(memory.createdAt).format('D[ de ] MMMM[, ] YYYY')}
                  </Text>
                </View>
                <View className="space-y-4 px-8">
                  {mimeTypeImageRegex.test(mimeType) && (
                    <Image
                      source={{
                        uri: memory.coverUrl,
                      }}
                      alt="Cover"
                      className="aspect-video w-full rounded-lg"
                    />
                  )}

                  {mimeTypeVideoRegex.test(mimeType) && (
                    <Video
                      source={{
                        uri: memory.coverUrl,
                      }}
                      className="aspect-video w-full rounded-lg"
                      isLooping
                      shouldPlay
                      useNativeControls
                      isMuted
                    />
                  )}
                  <Text className="font-body text-base leading-relaxed text-gray-100">
                    {memory.excerpt}
                  </Text>
                  <Link href="/memories/id" asChild>
                    <TouchableOpacity className="flex-row items-center gap-2">
                      <Text className="font-body text-sm text-gray-200">
                        Ler mais
                      </Text>
                      <Icon name="arrow-right" size={16} color="#9e9ea0" />
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            )
          })}
        </View>
      </ScrollView>
    </>
  )
}
