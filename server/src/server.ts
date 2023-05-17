import fastify from 'fastify'
import cors from '@fastify/cors'
import { memoriesRoutes } from './routes/memories'

const app = fastify()

app.register(cors, {
  origin: true, // Todas URLs de front poderão acessar o back
  // origin: ['http://localhost:3000','http://localhost:3333'], //Exemplo para fechar URLs específicas
})
app.register(memoriesRoutes)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('🚀 HTTP server running on http://localhost:3333')
  })
