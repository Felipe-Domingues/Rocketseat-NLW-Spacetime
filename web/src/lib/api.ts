import axios from 'axios'

export const api = axios.create({
  baseURL: 'https://rocketseat-nlw-spacetime-otmd.vercel.app/',
})
