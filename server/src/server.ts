import 'dotenv/config'

import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { memoriesRoutes } from './routes/memories'
import { authRoutes } from './routes/auth'

const app = fastify()

app.register(cors, {
  origin: true, // Todas URLs de front poderão acessar o back
  // origin: ['http://localhost:3000','http://localhost:3333'], //Exemplo para fechar URLs específicas
})
app.register(jwt, {
  secret: 'spacetime', // Usado para diferenciar os JWTs gerados por este back-end dos demais
})
app.register(memoriesRoutes)
app.register(authRoutes)

app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('🚀 HTTP server running on http://localhost:3333')
  })
