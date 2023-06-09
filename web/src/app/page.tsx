import { EmptyMemories } from '@/components/EmptyMemories'
import { api } from '@/lib/api'
import { cookies } from 'next/headers'
import dayjs from 'dayjs'
import ptBr from 'dayjs/locale/pt-br'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import mime from 'mime'

dayjs.locale(ptBr)

interface Memory {
  id: string
  coverUrl: string
  excerpt: string
  createdAt: string
}

export default async function Home() {
  const isAuthenticated = cookies().has('token')

  if (!isAuthenticated) {
    return <EmptyMemories />
  }

  const token = cookies().get('token')?.value

  const response = await api.get('/memories', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const memories: Memory[] = response.data

  if (memories.length === 0) {
    return <EmptyMemories />
  }

  return (
    <div className="flex flex-col gap-10 p-8">
      {memories.map((memory) => {
        let mimeType = mime.getType(memory.coverUrl)
        !mimeType && (mimeType = '')
        const mimeTypeImageRegex = /^(image)\/[a-zA-Z]+/
        const mimeTypeVideoRegex = /^(video)\/[a-zA-Z]+/
        return (
          <div key={memory.id} className="space-y-4">
            <time className="-ml-8 flex items-center gap-2 text-sm text-gray-100 before:h-px before:w-5 before:bg-gray-50">
              {dayjs(memory.createdAt).format('D[ de ] MMMM[, ] YYYY')}
            </time>
            {mimeTypeImageRegex.test(mimeType) && (
              <Image
                src={memory.coverUrl}
                alt="cover"
                width={592}
                height={280}
                className="aspect-video w-full rounded-lg object-cover"
              />
            )}

            {mimeTypeVideoRegex.test(mimeType) && (
              <video
                src={memory.coverUrl}
                width={592}
                height={280}
                controls={true}
                className="aspect-video w-full rounded-lg object-cover"
                autoPlay={true}
                muted={true}
              />
            )}

            <p className="text-lg leading-relaxed text-gray-200">
              {memory.excerpt}
            </p>

            <Link
              href={`/memories/${memory.id}`}
              className="flex items-center gap-2 text-sm  text-gray-200 hover:text-gray-100"
            >
              Ler mais <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )
      })}
    </div>
  )
}
