import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middleware/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const createMealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        dateBr: z.string(),
        hour: z.string(),
        diet: z.boolean(),
      })

      const { sessionId } = request.cookies

      const [user] = await knex('users')
        .where('session_id', sessionId)
        .select('id')

      const userId = user.id

      const { name, description, dateBr, hour, diet } =
        createMealsBodySchema.parse(request.body)

      const dateArray = dateBr.split('/')

      const dateTime = new Date(
        `${dateArray[2]}-${dateArray[1]}-${dateArray[0]} ${hour}`,
      )

      if (isNaN(dateTime.getTime())) {
        throw new Error('Invalid date format!')
      }

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        date: dateTime.toISOString(),
        diet,
        user_id: userId,
      })

      return reply.status(201).send()
    },
  )
}
