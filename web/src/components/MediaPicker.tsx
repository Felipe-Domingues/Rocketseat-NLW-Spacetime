'use client'

import { ChangeEvent, useState } from 'react'

export function MediaPicker() {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewVideo, setPreviewVideo] = useState<string | null>(null)
  const [textErrorFileSize, setTextErrorFileSize] = useState<'flex' | 'none'>(
    'none',
  )

  function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.target

    if (!files) {
      return
    }

    if (files[0]) {
      if (files[0].size > 20_971_520) {
        setTextErrorFileSize('flex')

        return
      } else {
        setTextErrorFileSize('none')
      }

      const previewURL = URL.createObjectURL(files[0])

      const mimeTypeImageRegex = /^(image)\/[a-zA-Z]+/
      const mimeTypeVideoRegex = /^(video)\/[a-zA-Z]+/

      if (mimeTypeImageRegex.test(files[0].type)) {
        setPreviewVideo(null)
        setPreviewImage(previewURL)
      } else if (mimeTypeVideoRegex.test(files[0].type)) {
        setPreviewImage(null)
        setPreviewVideo(previewURL)
      }
    }
  }

  return (
    <>
      <input
        type="file"
        name="coverUrl"
        onChange={onFileSelected}
        id="media"
        className="invisible h-0 w-0"
        accept="image/*, video/*"
      />

      {previewImage && (
        // eslint-disable-next-line
        <img
          src={previewImage}
          alt=""
          className="aspect-video w-full rounded-lg object-cover"
        />
      )}

      {previewVideo && (
        // eslint-disable-next-line
        <video
          src={previewVideo}
          className="aspect-video w-full rounded-lg object-cover"
          controls={true}
          autoPlay={true}
          muted={true}
        />
      )}
      <div className="py-2" style={{ display: textErrorFileSize }}>
        <p className="font-body text-red-600">
          O arquivo deve ser menor que 20mb!
        </p>
      </div>
    </>
  )
}
