import {
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native'
import Icon from '@expo/vector-icons/Feather'

import NLWLogo from '../src/assets/nlw-spacetime-logo.svg'
import { Link, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import React, { useRef, useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import * as SecureStore from 'expo-secure-store'
import { api } from '../src/lib/api'
import { Video } from 'expo-av'

export default function NewMemory() {
  const { bottom, top } = useSafeAreaInsets() // Retorna a distancia de padding que deverá ser dada para cada dispositivo
  const router = useRouter()

  const [textErrorFileSize, setTextErrorFileSize] = useState<'flex' | 'none'>(
    'none',
  )
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewVideo, setPreviewVideo] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  async function openImagePicker() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
        videoQuality: 1,
      })

      if (result.assets[0]) {
        // Verifica se é maior que 20mb
        if (result.assets[0].fileSize > 20_971_520) {
          setTextErrorFileSize('flex')

          return
        } else {
          setTextErrorFileSize('none')
        }

        if (result.assets[0].type === 'image') {
          setPreviewVideo(null)
          setPreviewImage(result.assets[0].uri)
        } else if (result.assets[0].type === 'video') {
          setPreviewImage(null)
          setPreviewVideo(result.assets[0].uri)
        }
      }
    } catch (err) {}
  }

  async function handleCreateMemory() {
    const token = await SecureStore.getItemAsync('token')

    let coverUrl = ''

    if (previewImage || previewVideo) {
      const uploadFormData = new FormData()

      if (previewImage) {
        uploadFormData.append('file', {
          uri: previewImage,
          name: 'image.jpg',
          type: 'image/jpg',
        } as any)
      } else if (previewVideo) {
        uploadFormData.append('file', {
          uri: previewVideo,
          name: 'video.mp4',
          type: 'video/mp4',
        } as any)
      }

      const uploadResponse = await api.post('/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      coverUrl = uploadResponse.data.fileUrl
    }

    await api.post(
      '/memories',
      {
        content,
        isPublic,
        coverUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    router.replace('/memories')
  }

  const btnSave = useRef()

  return (
    <>
      <View
        className="flex-row items-center justify-between px-8 pb-4"
        style={{ paddingTop: top }}
      >
        <NLWLogo />

        <Link href="/memories" asChild>
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-purple-500">
            <Icon name="arrow-left" size={16} color="#FFF" />
          </TouchableOpacity>
        </Link>
      </View>

      <ScrollView
        className="flex-1 px-8"
        contentContainerStyle={{ paddingBottom: bottom }}
        keyboardDismissMode="on-drag"
      >
        <View className="mt-6 space-y-6">
          <View className="flex-row items-center gap-2">
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              thumbColor={isPublic ? '#9b79ea' : '#9e9ea0'}
              trackColor={{ false: '#767577', true: '#372560' }}
            />
            <Text className="font-body text-base text-gray-200">
              Tornar memória pública
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={openImagePicker}
            className="h-48 items-center justify-center rounded-lg border border-dashed border-gray-800 bg-black/20"
          >
            {previewImage ? (
              <Image
                source={{ uri: previewImage }}
                className="h-full w-full rounded-lg object-cover"
                alt="Cover"
              />
            ) : previewVideo ? (
              <Video
                source={{ uri: previewVideo }}
                className="h-full w-full rounded-lg object-cover"
                isLooping
                shouldPlay
                useNativeControls
                isMuted
              />
            ) : (
              <>
                <View className="flex-row items-center gap-2">
                  <Icon name="image" color="#FFF" />
                  <Text className="font-body text-sm text-gray-200">
                    Adicionar foto ou vídeo de capa
                  </Text>
                </View>
                <View className="p-2" style={{ display: textErrorFileSize }}>
                  <Text className="font-body text-red-600">
                    O arquivo deve ser menor que 20mb!
                  </Text>
                </View>
              </>
            )}
          </TouchableOpacity>

          <TextInput
            multiline
            className="p-0 font-body text-lg text-gray-50"
            placeholder="Fique livre para adicionar fotos, vídeos e relatos sobre essa experiência que você quer lembrar para sempre."
            placeholderTextColor="#56565a"
            text-textAlignVertical="top"
            value={content}
            onChangeText={setContent}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            className="items-center self-end rounded-full bg-green-500 px-5 py-2"
            ref={btnSave}
            onPress={handleCreateMemory}
          >
            <Text className="font-alt text-sm uppercase text-black">
              Salvar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  )
}
